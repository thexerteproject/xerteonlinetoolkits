<?php
namespace transcribe;
use \Exception;

class RegistryHandler {
    private $path;
    private $data;

    public function __construct($path) {
        global $xerte_toolkits_site;

        // Check whether the file does not have path traversal
        x_check_path_traversal($path, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

        $registryPath = $path . DIRECTORY_SEPARATOR . "registry";
        $this->path = $path . DIRECTORY_SEPARATOR . "registry" . DIRECTORY_SEPARATOR . "transcript_registry.json";
        if (!is_dir($registryPath)) {
            mkdir($registryPath, 0777, true);
        }
        $this->path = $path . DIRECTORY_SEPARATOR . "registry" . DIRECTORY_SEPARATOR . "transcript_registry.json";
        $this->data = $this->load();
    }

    private function load() {
        if (!file_exists($this->path)) {
            return ['processed_videos' => []];
        }
        return json_decode(file_get_contents($this->path), true);
    }

    public function isProcessed($id) {
        return isset($this->data['processed_videos'][$id]);
    }

    public function get($id) {
        return isset($this->data['processed_videos'][$id])
            ? $this->data['processed_videos'][$id]
            : null;
    }

    public function set($id, $entry) {
        $this->data['processed_videos'][$id] = $entry;
        $this->save();
    }

    private function save() {
        file_put_contents($this->path, json_encode($this->data, JSON_PRETTY_PRINT));
    }

    public function generateIdentifier($source) {
        if (filter_var($source, FILTER_VALIDATE_URL)) {
            return hash('sha256', $this->normalizeUrl($source));
        } elseif (file_exists($source)) {
            return hash_file('sha256', $source);
        }
        throw new Exception("Invalid video source: $source");
    }

    private function normalizeUrl($url) {
        if (strpos($url, 'youtube.com') !== false || strpos($url, 'youtu.be') !== false) {
            parse_str(parse_url($url, PHP_URL_QUERY), $query);
            return isset($query['v'])
                ? $query['v']
                : basename(parse_url($url, PHP_URL_PATH));
        }
        return strtolower(trim($url));
    }
}