<?php

/**
 * syncCorpus_start.php
 *
 * Called by the frontend ONCE to start a job.
 * - Creates a job record (queued).
 * - Spawns the background worker (PHP-CLI) and returns 202 with job_id.
 */

require_once __DIR__ . '/sync_job_store.php';
require_once (str_replace('\\', '/', __DIR__) . "/../../../config.php");

header('Content-Type: application/json');

global $xerte_toolkits_site;

if(!isset($_SESSION['toolkits_logon_id'])){
    die("Session ID not set.");
}
ob_start();
$raw = file_get_contents('php://input');
$decodedInput = json_decode(x_clean_input_json($raw),true);

$baseUrl = x_clean_input($decodedInput['baseURL'], 'string');


$jobStore=new sync_job_store($baseUrl);

$user_id = isset($_SESSION['toolkits_logon_username']) ? $_SESSION['toolkits_logon_username'] : null;
$workspace_id = isset($_SESSION['XAPI_PROXY']) ? $_SESSION['XAPI_PROXY'] : null;


// Avoid starting more than N background workers.
if ($jobStore->sync_count_running_jobs() >= $jobStore->get_max_concurrent()) {
    http_response_code(503);
    echo json_encode(['error' => 'System busy, please try again shortly']);
    exit;
}

/*
 * Create the job record.
 */

$job_id = $jobStore->sync_generate_job_id();
$jobStore->sync_job_create($job_id, [
    'status' => 'queued',
    'stage' => 'queued',
    'message' => 'Preparing to start processing...',
    'progress' => 0,
    'user_id' => $user_id,
    'workspace_id' => $workspace_id,
    //'source_type' => $sourceType,
    //'source_value' => $sourceValue,
], $raw);


$phpBin = 'php';
//$phpBin = 'C:\\xampp\\php\\php.exe'; //can replace binaries with this when debugging on xamp-based installs, if just php is not working.
$dataDir = $xerte_toolkits_site->root_file_path . $baseUrl . 'RAG/data';
$script = __DIR__ . '/syncCorpus.php';
$cmd = escapeshellarg($phpBin) . ' ' . escapeshellarg($script) . ' ' . escapeshellarg($job_id) . ' ' . escapeshellarg($dataDir);

$nullDev = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ? 'NUL' : '/dev/null';

$spec = [
    0 => ['file', $nullDev, 'r'],  // STDIN: pipe so we can send $raw
    1 => ['file', $nullDev, 'w'],  // STDOUT: discard
    2 => ['file', $nullDev, 'w'],  // STDERR: discard
];

// Use $_SERVER instead of $_ENV to ensure we keep system vars; relevant only for debugging on installs using xampp.
/*$env = array_merge($_SERVER, [
    'XDEBUG_MODE'    => 'debug',
    'XDEBUG_CONFIG'  => 'client_host=127.0.0.1 client_port=9003 idekey=PHPSTORM',
    'PHP_IDE_CONFIG' => 'serverName=cli-worker',
]);*/

$proc = proc_open($cmd, $spec, $pipes, __DIR__/*, $env*/); // include $env here when debugging;

if (is_resource($proc)) {
    //sleep(1); // give Xdebug time to connect
    foreach ($pipes as $p) {
        if (is_resource($p)) fclose($p);
    }
} else {
    $jobStore->sync_job_update($job_id, ['status' => 'error', 'stage' => 'spawn', 'message' => 'Failed to spawn worker']);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to start job']);
    exit;
}

$debugOutput = ob_get_contents();
ob_end_clean();

echo json_encode([
    'success' => true,
    'job_id' =>  $job_id,
]);

