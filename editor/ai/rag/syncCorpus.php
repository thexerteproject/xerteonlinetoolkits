<?php

header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once (str_replace('\\', '/', __DIR__) . "/BaseRAG.php");
require_once (str_replace('\\', '/', __DIR__) . "/MistralRAG.php");
require_once (str_replace('\\', '/', __DIR__) . "/../transcribe/AITranscribe.php");
require_once (str_replace('\\', '/', __DIR__) . "/../transcribe/MediaHandler.php");
require_once (str_replace('\\', '/', __DIR__) . "/../transcribe/CorpusSynchronizer.php");
require_once (str_replace('\\', '/', __DIR__) . "/../transcribe/RegistryHandler.php");
require_once (str_replace('\\', '/', __DIR__) . "/../transcribe/TranscriptManager.php");
require_once (str_replace('\\', '/', __DIR__) . "/../../../config.php");

use rag\MistralRAG;

/**
 * Given a user-supplied relative path, resolve it against your project root
 * and ensure it exists.
 */
function prepareURL(string $uploadPath): string
{
    // Move up from rag/ai/editor to your XOT root
    $basePath = __DIR__ . '/../../../';
    $full = realpath(urldecode($basePath . $uploadPath));

    if ($full === false) {
        throw new Exception("Invalid path: {$uploadPath}");
    }
    return $full;
}

/**
 * Normalize any Windows or Unix path string to use forward-slashes
 * and collapse duplicates.
 */
function normalize_path(string $path): string
{
    // 1) turn backslashes into forward-slashes
    $p = str_replace('\\', '/', $path);

    // 2) collapse multiple slashes into one
    $p = preg_replace('#/+#', '/', $p);

    return $p;
}

ob_start();

try {
    global $xerte_toolkits_site;
    // 1. Decode JSON payload
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Malformed JSON input: ' . json_last_error_msg());
    }
    $gridData = $input['gridData'] ?? [];
    $baseUrl = $input['baseURL'] ?? '';

    // 2. Prep directories & API keys
    $baseDir = prepareURL($baseUrl);
    $mediaDir = realpath($baseDir . DIRECTORY_SEPARATOR . 'media');
    $transcriptDir = realpath($mediaDir . DIRECTORY_SEPARATOR . 'transcripts');
    $corpusDir = realpath($mediaDir . DIRECTORY_SEPARATOR . 'corpus');

    x_check_path_traversal($baseDir);
    x_check_path_traversal($mediaDir);
    x_check_path_traversal($transcriptDir);
    x_check_path_traversal($corpusDir);

    $gladiaKey = $xerte_toolkits_site->gladia_key;
    $transcriber = new GladiaTranscribe($gladiaKey);
    $mediaHandler = new MediaHandler($baseDir, $transcriber);
    $registryHandler = new RegistryHandler($transcriptDir);
    $corpusSync = new CorpusSynchronizer($transcriptDir, $corpusDir);
    $transcriptMgr = new TranscriptManager($registryHandler, $mediaHandler, $corpusSync);

    $results = [];

    // 1) Walk grid data by reference, so we can update col_2 in place
    foreach ($gridData as &$row) {
        $uploadUrl = urldecode(ltrim($row['col_2'])) ?? null;

        if (!$uploadUrl) {
            $results[] = [
                'file'  => null,
                'error' => 'Missing col_2 value',
            ];
            continue;
        }

        try {
            // 2) Process the file
            $transcript = $transcriptMgr->process($uploadUrl);

            // 3) Record success
            $results[] = [
                'file'       => $uploadUrl,
                'transcript' => $transcript,
            ];

            // 4a) Mutate the grid row in place: replace col_2 with the transcript path; add original source (video file, audio file, or link) to col_4
            $row['col_2'] = $transcript['transcript_path'];
            $row['col_4'] = $transcript['source'];
        } catch (Exception $e) {
            // 4b) Record the error, leave col_2 untouched
            $results[] = [
                'file'  => $uploadUrl,
                'error' => $e->getMessage(),
            ];
        }
    }
    // break the reference
    unset($row);

    // 5. Once all transcripts are accounted for, run the RAG on all listed files, including the transcripts
    $mistralKey = $xerte_toolkits_site->mistralai_key;
    $rag = new MistralRAG($mistralKey, 'txt', $baseDir);
    // 5.1 Create a list of all file objects with the relevant data to be processed
    $fileObjects = array_map(function($row) use ($baseDir) {
        $path = normalize_path(urldecode(ltrim($row['col_2']))); //first normalize whatever is in col 2, just in case a valid path has already been substituted if it's a transcript
        //If it's already a full path, don't do anything extra. If it isn't, add the base directory
        if(!(realpath($path))){
            $path = normalize_path(urldecode(rtrim($baseDir, '/\\') . '/' . ltrim($row['col_2'], '/\\')));
        }
        x_check_path_traversal($path);
        return [
            'path'     => $path,
            'metadata' => [
                'name'        => $row['col_1'] ?? null,
                'description' => $row['col_3'] ?? null,
                'source' => $row['col_4'] ?: $path,
            ]
        ];
    }, $gridData);

    //5.2 encode all files in the file list and register them as processed
    $rag->processFileList($fileObjects);

    $debugOutput = ob_get_contents();
    ob_end_clean();

    // 6. Return JSON
    echo json_encode([
        'success' => true,
        'results' => $results
    ], JSON_THROW_ON_ERROR);

} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $ex->getMessage()
    ], JSON_THROW_ON_ERROR);
}

