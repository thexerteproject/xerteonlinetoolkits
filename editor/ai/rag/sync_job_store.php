<?php

/**
 * sync_job_store.php
 *
 * File-based job storage. One JSON per job.
 *
 */

require_once (str_replace('\\', '/', __DIR__) . "/../../../config.php");
if (!isset($_SESSION['toolkits_logon_username']) && php_sapi_name() !== 'cli')
{
    die("Session ID not set.");
}
class sync_job_store
{
    // Max number of background workers we allow at once.
    const SYNC_MAX_CONCURRENT_WORKERS = 4;

    // Public route for polling job status (relative path is fine).
    const SYNC_STATUS_ROUTE = '/syncCorpus_status.php?job_id=';

    // (Optional) Approved domains for URL inputs. Empty array = allow all.
    const SYNC_APPROVED_DOMAINS = [
        'youtube.com',
        'youtu.be',
        'vimeo.com',
        'video.dlearning.nl'
    ];

    private $baseUserDir;
    private $sync_data_dir;
    private $sync_job_dir;
    private $sync_input_dir;
    private $sync_upload_dir;

    public function __construct($baseUrl, $syncDataDir = null)
    {
        global $xerte_toolkits_site;
        $this->baseUserDir = $xerte_toolkits_site->root_file_path . $baseUrl . 'RAG';
        if ($syncDataDir!==null){
            $this->sync_data_dir = $syncDataDir;
        } else {
            $this->sync_data_dir = $this->baseUserDir . '/data';
        }
        $this->sync_job_dir = $this->sync_data_dir . '/jobs';
        //$sync_input_dir = $sync_job_dir . '/input';
        $this->sync_upload_dir = $this->sync_data_dir . '/uploads';
    }

    public function get_max_concurrent(){
        return self::SYNC_MAX_CONCURRENT_WORKERS;
    }

    //TODO: security mess--make sure this is verified, as well as above, before we run mkdir, so that end users cannot
    //create folders willy-nilly.
    public function get_data_dir(){
        return $this->sync_data_dir;
    }
    // Ensure required folders exist.
    function sync_ensure_directories(): void
    {
        foreach ([$this->sync_data_dir, $this->sync_job_dir, $this->sync_upload_dir] as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
        }
    }

// a unique job id
function sync_generate_job_id(): string
{
    return bin2hex(random_bytes(16));
}

// Path to a job's JSON file.
function sync_job_path(string $job_id): string
{
    return $this->sync_job_dir . '/' . $job_id . '.json';
}

// Create a new job record (queued).
function sync_job_create(string $job_id, array $fields = [], ?string $input_json = null): array
{
    $job = array_merge([
        'job_id' => $job_id,
        'status' => 'queued',   // queued|running|processed|error
        'stage' => 'queued',   // end-user friendly stage name
        'message' => 'Queued',
        'progress' => 0,          // 0..100 (rough)
        'error' => null,
        'completion_info' =>[ //The original output of syncCorpus, passed along for maintaining error messaging client-side
            'success' => null,
            'error' => null,
        ],
        'created_at' => gmdate('c'),
        'updated_at' => gmdate('c'),
    ], $fields);

    $path = $this->sync_job_path($job_id);
    $tmp = $path . '.tmp';
    file_put_contents($tmp, json_encode($job, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    rename($tmp, $path);

    // If we got input JSON, save it to its own file
    if ($input_json !== null) {
        $input_path = dirname($path) . "/{$job_id}_input.json";
        file_put_contents($input_path, $input_json);
        // record that location in the job file, so worker can find it
        $job['input_path'] = $input_path;
        $job['sync_data_dir'] = $this->sync_data_dir;
        file_put_contents($path, json_encode($job, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    return $job;
}

// Read a job record.
function sync_job_read(string $job_id): ?array
{
    $p = $this->sync_job_path($job_id);
    if (!is_file($p)) return null;
    return json_decode(file_get_contents($p), true);
}

// Update selected fields (atomic write).
function sync_job_update(string $job_id, array $patch): array
{
    $cur = $this->sync_job_read($job_id) ?? ['job_id' => $job_id];
    $new = array_merge($cur, $patch, ['updated_at' => gmdate('c')]);

    $p = $this->sync_job_path($job_id);
    $tmp = $p . '.tmp';
    file_put_contents($tmp, json_encode($new, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    rename($tmp, $p);
    return $new;
}

// Count jobs currently marked "running". Helps to cap concurrency.
function sync_count_running_jobs(): int
{
    $count = 0;
    foreach (glob($this->sync_job_dir . '/*.json') as $file) {
        $j = json_decode(@file_get_contents($file), true);
        if (is_array($j) && ($j['status'] ?? '') === 'running') {
            $count++;
        }
    }
    return $count;
}

// Basic domain allowlist check for URL inputs.
function sync_is_domain_allowed(string $url): bool
{
    if (empty(self::SYNC_APPROVED_DOMAINS)) return true; // no restrictions
    $host = parse_url($url, PHP_URL_HOST);
    if (!$host) return false;
    $host = strtolower($host);
    foreach (self::SYNC_APPROVED_DOMAINS as $allowed) {
        if ($host === strtolower($allowed) || str_ends_with($host, '.' . strtolower($allowed))) {
            return true;
        }
    }
    return false;
}

/** Save the original HTTP payload JSON for this job */
function sync_job_save_input_json(string $job_id, string $rawJson): void
{
    $path = $this->sync_job_input_path($job_id);
    $tmp = $path . '.tmp';
    file_put_contents($tmp, $rawJson);
    rename($tmp, $path);
}
}