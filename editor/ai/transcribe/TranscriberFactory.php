<?php

namespace transcribe;
use \Exception;

require_once (str_replace('\\', '/', __DIR__) . "/AITranscribe.php");
require_once (str_replace('\\', '/', __DIR__) . "/MediaHandler.php");
require_once (str_replace('\\', '/', __DIR__) . "/CorpusSynchronizer.php");
require_once (str_replace('\\', '/', __DIR__) . "/RegistryHandler.php");
require_once (str_replace('\\', '/', __DIR__) . "/TranscriptManager.php");


function makeTranscriber(array $cfg): TranscriptManager
{
    $provider = $cfg['provider'] ?? 'none';
    $baseDir = $cfg['basedir'];
    $adminEnabled = (bool)($cfg['enabled'] ?? true);

    $transcriber = new UninitializedTranscribe($cfg['api_key']);

    if ($adminEnabled && $provider === 'openai' && !empty($cfg['api_key'])) {
        $transcriber = new OpenAITranscribe($cfg['api_key']);
    }

    if ($adminEnabled && $provider === 'gladia' && !empty($cfg['api_key'])) {
        $transcriber = new GladiaTranscribe($cfg['api_key']);
    }

    $mediaHandler = new MediaHandler($baseDir, $transcriber);
    $transcriptPath = $mediaHandler->returnMediaPath();

    if (!is_dir($transcriptPath)) {
    mkdir($transcriptPath, 0777, true);
    }
    $transcriptDir = realpath($transcriptPath);
    x_check_path_traversal($transcriptDir);

    $registryHandler = new RegistryHandler($transcriptDir);
    $transcriptMgr = new TranscriptManager($registryHandler, $mediaHandler, /*$corpusSync*/);

    return $transcriptMgr;
}