<?php

/**
 * syncCorpus_status.php
 *
 * Frontend polls this to read the job state.
 *
 */

require_once __DIR__ . '/sync_job_store.php';

header('Content-Type: application/json');

$job_id  = isset($_GET['job_id'])  ? $_GET['job_id']  : '';
$baseURL = isset($_GET['baseURL']) ? $_GET['baseURL'] : '';
$jobStore = new sync_job_store($baseURL);
if ($job_id === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing job_id']);
    exit;
}

$job = $jobStore->sync_job_read($job_id);
if (!$job) {
    http_response_code(404);
    echo json_encode(['error' => 'Job not found']);
    exit;
}

echo json_encode(array(
    'job_id' => $job['job_id'],
    'status' => $job['status'], // queued|running|processed|error
    'stage' => isset($job['stage']) ? $job['stage'] : null,
    'message' => isset($job['message']) ? $job['message'] : null,
    'progress' => isset($job['progress']) ? $job['progress'] : null,
    'error' => isset($job['error']) ? $job['error'] : null,
    'updated_at' => isset($job['updated_at']) ? $job['updated_at'] : null,
    'completion_info' => isset($job['completion_info']) ? $job['completion_info'] : null,
));

