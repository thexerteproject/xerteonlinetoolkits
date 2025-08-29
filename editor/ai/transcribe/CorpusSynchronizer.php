<?php
namespace transcribe;
use \Exception;
class CorpusSynchronizer {
    private $transcriptDir;
    private $corpusDir;

    public function __construct($transcriptDir, $corpusDir) {
        $this->transcriptDir = rtrim($transcriptDir, '/');
        $this->corpusDir = rtrim($corpusDir, '/');
    }

    public function sync() {
        if (!is_dir($this->transcriptDir) || !is_dir($this->corpusDir)) {
            throw new Exception("Transcript or corpus directory does not exist.");
        }

        $files = scandir($this->transcriptDir);

        foreach ($files as $file) {
            if (in_array($file, ['.', '..'])) continue;

            $sourcePath = "{$this->transcriptDir}/{$file}";
            $destPath = "{$this->corpusDir}/{$file}";

            if (!is_file($sourcePath)) continue;

            if (!file_exists($destPath) || md5_file($sourcePath) !== md5_file($destPath)) {
                copy($sourcePath, $destPath);
                echo "Synced: {$file}\n";
            }
        }
    }
}