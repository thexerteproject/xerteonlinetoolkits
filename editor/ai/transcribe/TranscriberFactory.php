<?php

namespace transcribe;

require_once (str_replace('\\', '/', __DIR__) . "/AITranscribe.php");
require_once (str_replace('\\', '/', __DIR__) . "/MediaHandler.php");
require_once (str_replace('\\', '/', __DIR__) . "/RegistryHandler.php");
require_once (str_replace('\\', '/', __DIR__) . "/TranscriptManager.php");
require_once (str_replace('\\', '/', __DIR__) . "/../../../config.php");


function makeTranscriber(array $cfg)
{
    global $xerte_toolkits_site;
    $provider = isset($cfg['provider']) ? $cfg['provider'] : 'none';
    $baseDir = $cfg['basedir'];
    $adminEnabled = (bool)(isset($cfg['enabled']) ? $cfg['enabled'] : true);

    $transcriber = new UninitializedTranscribe($cfg['api_key'], $baseDir);

    if ($adminEnabled && $provider === 'openai' && !empty($cfg['api_key'])) {
        $transcriber = new OpenAITranscribe($cfg['api_key'], $baseDir);
    }

    if ($adminEnabled && $provider === 'gladia' && !empty($cfg['api_key'])) {
        $transcriber = new GladiaTranscribe($cfg['api_key'], $baseDir);
    }

    $mediaHandler = new MediaHandler($baseDir, $transcriber);
    $transcriptPath = $mediaHandler->returnMediaPath();

    if (!is_dir($transcriptPath)) {
        mkdir($transcriptPath, 0777, true);
    }
    $transcriptDir = realpath($transcriptPath);
    x_check_path_traversal($transcriptDir, $xerte_toolkits_site->users_file_area_full);

    $registryHandler = new RegistryHandler($transcriptDir);
    $transcriptMgr = new TranscriptManager($registryHandler, $mediaHandler);

    return $transcriptMgr;
}