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
        $finalPath = realpath($fullPath);
        if ($finalPath === false) {
            throw new Exception("File or directory does not exist: " . $fullPath);
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
            'transcript_path' => $transcriptPath,
            'processed_at' => date('c')
        ];
        $this->registry->set($id, $entry);

        return $entry;
    }
}