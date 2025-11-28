<?php

/**
 * syncCorpus_status.php
 *
 * Frontend polls this to read the job state.
 *
 */

require_once __DIR__ . '/sync_job_store.php';

header('Content-Type: application/json');

$job_id = $_GET['job_id'] ?? '';
$baseURL = $_GET['baseURL'] ?? '';
$jobStore = new sync_job_store($baseURL);
$jobStore->sync_ensure_directories();
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

echo json_encode([
    'job_id' => $job['job_id'],
    'status' => $job['status'],     // queued|running|processed|error
    'stage' => $job['stage'] ?? null,
    'message' => $job['message'] ?? null,
    'progress' => $job['progress'] ?? null,
    'error' => $job['error'] ?? null,
    'updated_at' => $job['updated_at'] ?? null,
    'completion_info'=>$job['completion_info'] ?? null,
]);
