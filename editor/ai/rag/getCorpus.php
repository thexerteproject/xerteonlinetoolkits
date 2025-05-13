<?php

header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once (str_replace('\\', '/', __DIR__) . "/BaseRAG.php");
require_once (str_replace('\\', '/', __DIR__) . "/MistralRAG.php");
require_once (str_replace('\\', '/', __DIR__) . "/../../../config.php");

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
    $type   = x_clean_input($input['type']   ?? '',    'alphanumeric');
    $gridId = x_clean_input($input['gridId'] ?? '',    'alphanumeric');

    // Prep directories & API keys
    $baseDir = prepareURL($baseUrl);
    x_check_path_traversal($baseDir);
    $mistralKey = $xerte_toolkits_site->mistralai_key;
    $rag = new MistralRAG($mistralKey, 'txt', $baseDir);

    $corpusFile = $rag->getCorpusDirectory();
    $corpus = ['hashes' => []];
    if (file_exists($corpusFile)) {
        $raw    = file_get_contents($corpusFile);
        $corpus = json_decode($raw, true) ?: $corpus;

        // Loop over each hash entry
        foreach ($corpus['hashes'] as $hash => $entry) {
            if (isset($entry['metaData']['source']) && is_string($entry['metaData']['source'])) {
                $src = $entry['metaData']['source'];

                //if it’s a URL, leave it
                if (! preg_match('#^https?://#i', $src)) {
                    //otherwise strip up to "media/"
                    $src = normalize_path($src);
                    $needle = 'media/';
                    if (false !== ($pos = strpos($src, $needle))) {
                        //for files, we substitute 'FileLocation' instead of the full path, to stay consistent with how it is displayed/handled in the front end
                        $src = 'FileLocation + ' . substr($src, $pos);
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

    //Build the rows using the | symbol as a separator
    $csv_parsed = '';
    foreach ($anonymizedCorpus['hashes'] as $entry) {
        $files = $entry['files']    ?? [];
        $meta  = $entry['metaData'] ?? [];
        $name        = $meta['name']        ?? '';
        $description = $meta['description'] ?? '';
        $fileSource  = $meta['source']      ?? '';

        foreach ($files as $file) {
            // each cell + '|' ; after each row add an extra '|'
            $cells = [ $name, $fileSource, $description ];
            foreach ($cells as $cell) {
                // sanitize any stray pipes in the data
                $safe = str_replace('|',' ', $cell);
                $csv_parsed .= $safe . '|';
            }
            $csv_parsed .= '|';
        }
    }

    // strip the trailing "||"
    $csv_parsed = substr($csv_parsed, 0, -2);

    $debugOutput = ob_get_contents();
    ob_end_clean();

    echo json_encode([
        'type'   => $type,
        'csv'    => $csv_parsed,
        'gridId' => $gridId
    ]);

} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $ex->getMessage()
    ], JSON_THROW_ON_ERROR);
}
