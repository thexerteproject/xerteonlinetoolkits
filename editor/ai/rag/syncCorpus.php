<?php

header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once (str_replace('\\', '/', __DIR__) . "/BaseRAG.php");
require_once (str_replace('\\', '/', __DIR__) . "/MistralRAG.php");
require_once (str_replace('\\', '/', __DIR__) . "/../transcribe/TranscriberFactory.php");
require_once (str_replace('\\', '/', __DIR__) . "/../../../config.php");
require_once (str_replace('\\', '/', __DIR__) . "/../../../vendor_config.php");
require_once (str_replace('\\', '/', __DIR__) . "/RagFactory.php");
require_once (str_replace('\\', '/', __DIR__) . "/../management/dataRetrievalHelper.php");

use function rag\makeRag;
use function transcribe\makeTranscriber;

/**
 * Given a user-supplied relative path, resolve it against your project root
 * and ensure it exists.
 */
function prepareURL(string $uploadPath): string
{
    global $xerte_toolkits_site;
    // Move up from rag/ai/editor to your XOT root
    $basePath = __DIR__ . '/../../../';
    $full = realpath(urldecode($basePath . $uploadPath));

    if ($full === false) {
        throw new Exception("Invalid path: {$uploadPath}");
    }

    x_check_path_traversal($full, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

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
global $xerte_toolkits_site;

if(!isset($_SESSION['toolkits_logon_id'])){
    die("Session ID not set");
}

try {

    //get settings from the management table, which help us decide which options to use
    $managementSettings = get_block_indicators();

    // 1. Decode JSON payload
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Malformed JSON input: ' . json_last_error_msg());
    }
    //todo alek this needs cleaning
    $gridData = $input['gridData'] ?? [];
    $baseUrl = $input['baseURL'] ?? '';
    $corpusScope = $input['corpusGrid'] ?? true;
    $useLoInCorpus = $input['useLoInCorpus'] ?? false;

    // 2. Prep directories & API keys
    $baseDir = prepareURL($baseUrl);
    $mediaPath = $baseDir . DIRECTORY_SEPARATOR .'RAG' . DIRECTORY_SEPARATOR . 'corpus';

    x_check_path_traversal($mediaPath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

    if (!is_dir($mediaPath)) {
        mkdir($mediaPath, 0777, true);
    }
    $mediaDir = realpath($mediaPath);

    $transcriptionKey = $xerte_toolkits_site->{$managementSettings['transcription']['key_name']};

    $provider = $managementSettings['transcription']['active_vendor'];
    $cfgTranscribe = [
        'api_key' => $transcriptionKey,
        'basedir' => $baseDir,
        'provider' => $provider
    ];

    $transcriptMgr = makeTranscriber($cfgTranscribe);

    $encodingKey = $xerte_toolkits_site->{$managementSettings['encoding']['key_name']};
    $provider = $managementSettings['encoding']['active_vendor'];
    $cfg = [
            'api_key' => $encodingKey,
            'encoding_directory' => $baseDir,
            'provider' => $provider
        ];
    $rag = makeRag($cfg);

    $results = [];

    if (!$useLoInCorpus){
        // 1) Walk grid data by reference, so we can update col_2 in place
        foreach ($gridData as &$row) {
            $uploadUrl = urldecode(ltrim($row['col_2'])) ?? null;

            if (!$uploadUrl) {
                $results[] = [
                    'file'  => null,
                    'status' => 'Missing col_2 (source) value',
                ];
                $row['col_2'] = 'ERROR/SKIP';
                continue;
            }

            try {
                // 2) Process the file
                $transcript = $transcriptMgr->process($uploadUrl);

                // 3) Record success
                $results[] = [
                    'file'       => $uploadUrl,
                    'status' => 'Transcribed Successfully',
                ];

                // 4a) Mutate the grid row in place: replace col_2 with the transcript path; add original source (video file, audio file, or link) to col_4
                $row['col_2'] = $transcript['transcript_path'];
                $row['col_4'] = $transcript['source'];
            } catch (Exception $e) {
                if ($e->getMessage()!="Unsupported media type for transcription."){
                    // 4b) Record the error
                    $results[] = [
                        'file'  => $uploadUrl,
                        'status' =>'Error: ' . $e->getMessage(),
                        'continue_request'=>'false',
                    ];
                    $row['col_2'] = 'ERROR/SKIP';
                }
            }
        }
        // break the reference
        unset($row);

        //Filter any errors, as failing the transcript step likely means there's an error with the file path, file type or otherwise
        $gridData = array_filter($gridData, function($row) {
            return isset($row['col_2']) && trim($row['col_2']) !== 'ERROR/SKIP';
        });

        // 5. Once all transcripts are accounted for, run the RAG on all listed files, including the transcripts
        // 5.1 Create a list of all file objects with the relevant data to be processed
        $fileObjects = array_map(function($row) use ($baseDir) {
            $path = normalize_path(urldecode(ltrim($row['col_2']))); //first normalize whatever is in col 2, just in case a valid path has already been substituted if it's a transcript
            //If it's already a full path, don't do anything extra. If it isn't, add the base directory
            if(!(realpath($path))){
                $path = normalize_path(urldecode(rtrim($baseDir, '/\\') . '/' . ltrim($row['col_2'], '/\\')));
            }
            x_check_path_traversal($path, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');
            return [
                'path'     => $path,
                'metadata' => [
                    'name'        => $row['col_1'] ?? null,
                    'description' => $row['col_3'] ?? null,
                    'source' => $row['col_4'] ?: $path,
                ]
            ];
        }, $gridData);
    } else {
        //If we're adding the learning object to the context, use the static path of the preview.xml and add the relevant fields instead
        //The processFileList works in principle the same, the only thing changed is the fact that we use a static file list
        $path = normalize_path(urldecode(rtrim($baseDir, '/\\') . '/' . ltrim('preview.xml', '/\\')));
        $fileObjects =
            [
                ['path'     => $path,
                'metadata' => [
                    'name'        => 'Learning Object',
                    'description' => 'The last synced version of the learning object preview.',
                    'source' => $path,
                    ]
                ]
            ];
    }

    //5.2 encode all files in the file list and register them as processed
    try {
        $ragResults = $rag->processFileList($fileObjects, $corpusScope);
    } catch (Exception $e){
        throw new Exception('An error occured while processing your file: ' . $e );
    }

    $debugOutput = ob_get_contents();
    ob_end_clean();

    // 1) Normalization helper
    function normalize_id(string $str): string {
        // URLs stay as‑is
        if (filter_var($str, FILTER_VALIDATE_URL)) {
            return $str;
        }
        // unify slashes and look for "RAG/corpus/"
        $p = str_replace('\\', '/', $str);
        $needle = 'RAG/corpus/';
        if (false !== $pos = strpos($p, $needle)) {
            // strip off everything before "RAG/corpus/"
            return substr($p, $pos);
        }
        // fallback
        return $str;
    }

// 2) Seed from transcription‐step results
    $map = [];
    foreach ($results as $row) {
        $id = normalize_id($row['file']);
        $map[$id] = [
            'id'                      => $id,
            'file'                    => $row['file'],
            'transcription_status'    => $row['status'],
            'continue_request'    => $row['continue_request'],
            // you could copy other fields here if needed; it shouldn't break the frontend usage
        ];
    }

// 3) Merge in RAG results
    foreach ($ragResults as $row) {
        $id = normalize_id($row['source']);
        if (!isset($map[$id])) {
            // no transcription entry for this id, so start a fresh one
            $map[$id] = [
                'id'   => $id,
                'file' => null,
            ];
        }
        // attach the RAG status
        $map[$id]['rag_status'] = trim($row['status']);
    }

// 4) Re‐index as a zero‑based array
    $fullResults = array_values($map);

    // 6. Return JSON
    echo json_encode([
        'success' => true,
        'results' => $fullResults
    ], JSON_THROW_ON_ERROR);

} catch (Exception $ex) {
    echo json_encode([
        'success' => false,
        'error' => $ex->getMessage()
    ], JSON_THROW_ON_ERROR);
}

