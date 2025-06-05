<?php

header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once (str_replace('\\', '/', __DIR__) . "/BaseRAG.php");
require_once (str_replace('\\', '/', __DIR__) . "/MistralRAG.php");
require_once (str_replace('\\', '/', __DIR__) . "/../../../config.php");
require_once (str_replace('\\', '/', __DIR__) . "/../../../vendor_config.php");

use rag\MistralRAG;

ob_start();

/**
 * Given a user-supplied relative path, resolve it against the project root
 * and ensure it exists.
 */
function prepareURL(string $uploadPath): string
{
    // Move up from rag/ai/editor to the XOT root
    $basePath = __DIR__ . '/../../../';
    $full = realpath(urldecode($basePath . $uploadPath));

    if ($full === false) {
        throw new Exception("Invalid path: {$uploadPath}");
    }
    return $full;
}

function normalize_path(string $path): string
{
    // 1) turn backslashes into forward-slashes
    $p = str_replace('\\', '/', $path);

    // 2) collapse multiple slashes into one
    $p = preg_replace('#/+#', '/', $p);

    return $p;
}

try {
    global $xerte_toolkits_site;

    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);

    $baseUrl = $input['baseURL'] ?? '';
    $type   = x_clean_input($input['type']   ?? '',    'string');
    $gridId = x_clean_input($input['gridId'] ?? '',    'string');
    $format = x_clean_input($input['format'] ?? '',    'string');

    // Prep directories & API keys
    $baseDir = prepareURL($baseUrl);
    x_check_path_traversal($baseDir);
    $mistralKey = $xerte_toolkits_site->mistralenc_key;
    $rag = new MistralRAG($mistralKey, $baseDir);

    $corpusFile = $rag->getCorpusDirectory();
    $corpus = ['hashes' => []];
    if (file_exists($corpusFile)) {
        $raw    = file_get_contents($corpusFile);
        $corpus = json_decode($raw, true) ?: $corpus;

        // Loop over each hash entry
        foreach ($corpus['hashes'] as $hash => $entry) {
            if (isset($entry['metaData']['source']) && is_string($entry['metaData']['source'])) {
                $src = $entry['metaData']['source'];

                // If it’s a URL, leave it
                if (!preg_match('#^https?://#i', $src)) {
                    // Otherwise strip up to "RAG/corpus/" or "preview.xml"
                    $src = normalize_path($src);
                    $needleCorpus = 'RAG/corpus/';
                    $needlePreview = 'preview.xml';

                    $posCorpus = strpos($src, $needleCorpus);
                    $posPreview = strpos($src, $needlePreview);

                    if ($posCorpus !== false) {
                        $src = 'FileLocation + \'' . substr($src, $posCorpus) . '\'';
                    } elseif ($posPreview !== false) {
                        $src = 'FileLocation + \'' . substr($src, $posPreview) . '\'';
                    }
                }

                // 4) write it back
                $corpus['hashes'][$hash]['metaData']['source'] = $src;
            }
        }

    }
    //Replace the hashes with simple indexes, as full hashes are not needed
    $anonymizedCorpus = $corpus;
    $anonymizedCorpus['hashes'] = array_values($corpus['hashes']);

    if ($format == "csv"){
        //Build the rows using the | symbol as a separator
        $csv_parsed = '';
        foreach ($anonymizedCorpus['hashes'] as $entry) {
            $files = $entry['files']    ?? [];
            $meta  = $entry['metaData'] ?? [];
            $name        = $meta['name']        ?? '';
            $description = $meta['description'] ?? '';
            $fileSource  = $meta['source']      ?? '';

            foreach ($files as $file) {
                $cells = [ $name, $fileSource, $description ];
                foreach ($cells as $cell) {
                    $safe = str_replace('|',' ', $cell);
                    $csv_parsed .= ($safe === '' ? ' ' : $safe) . '|';
                }
                $csv_parsed .= '|';
            }
        }
        // strip the trailing "||"
        $filesStructured = substr($csv_parsed, 0, -2);
    } else if ($format == "json"){
        $filesStructured = $anonymizedCorpus;
    }



    $debugOutput = ob_get_contents();
    ob_end_clean();

    echo json_encode([
        'type'   => $type,
        'corpus'    => $filesStructured,
        'gridId' => $gridId
    ]);

} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $ex->getMessage()
    ], JSON_THROW_ON_ERROR);
}
