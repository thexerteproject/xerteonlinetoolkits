<?php
namespace transcribe;
use \Exception;

class TranscriptManager {
    private $registry;
    private $mediaHandler;

    public function __construct(RegistryHandler $registry, MediaHandler $mediaHandler) {
        $this->registry = $registry;
        $this->mediaHandler = $mediaHandler;
    }

    public function appendBase($uploadPath) {
        $fullPath = $this->mediaHandler->returnBasePath() . '/' . ltrim($uploadPath, '/');

        global $xerte_toolkits_site;

        // Check whether the file does not have path traversal
        x_check_path_traversal($fullPath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

        $finalPath = realpath($fullPath);
        if ($finalPath === false) {
            throw new Exception("File or directory does not exist: " . $uploadPath);
        }
        return $finalPath;
    }

    private function normalize_path(string $path): string
    {
        // 1) turn backslashes into forward-slashes
        $p = str_replace('\\', '/', $path);

        // 2) collapse multiple slashes into one
        $p = preg_replace('#/+#', '/', $p);

        return $p;
    }

    private function toRelativeRagPath(string $fullPath): string
    {
        // Normalize all separators to forward slashes for storage
        $normalized = str_replace(['\\', '/'], '/', $fullPath);

        $anchor = 'RAG/transcripts';

        $pos = stripos($normalized, $anchor);

        if ($pos !== false) {
            $relative = substr($normalized, $pos);
            return $relative;
        }

        // Fallback: if RAG is not found, return the full path
        return basename($fullPath);
    }

    public function process($fileSource) {
        if (!$this->mediaHandler->isUrl($fileSource)){
            $source = $this->appendBase($this->normalize_path(urldecode($fileSource))); //if source is not a URL, but a partial file path, append to full file path.
        }else{
            $source = $fileSource; //if source is URL, it can stay like that.
        }

        $mediaDir = $this->mediaHandler->returnMediaPath();

        $id = $this->registry->generateIdentifier($source);

        if ($this->registry->isProcessed($id)) {
            echo "Already processed: $source\n";
            return $this->registry->get($id);
        }

        echo "Processing: $source\n";
        $transcript = $this->mediaHandler->getTranscript($fileSource);
        $transcriptPath = $this->mediaHandler->saveAsTextFile($transcript, $mediaDir);

        $entry = [
            'source' => $source,
            'transcript_path' => $this->toRelativeRagPath($transcriptPath),
            'processed_at' => date('c')
        ];
        $this->registry->set($id, $entry);

        return $entry;
    }
}