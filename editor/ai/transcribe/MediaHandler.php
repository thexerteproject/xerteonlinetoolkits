<?php
namespace transcribe;
use \Exception;
class MediaHandler {
    // Supported video hosts. //todo get from management
    protected $supportedHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'video.dlearning.nl'];
    protected $basePath;

    /**
     * Constructor.
     *
     * @param string $basePath The base file directory for user media.
     */
    public function __construct($basePath, $transcriber) {
        global $xerte_toolkits_site;

        // Check whether the file does not have path traversal
        x_check_path_traversal($basePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

        $this->basePath = rtrim($basePath, '/');
        $this->transcriber = $transcriber;
        //We set this to the designated folder for transcript-related content
        $this->mediaPath = $this->basePath . DIRECTORY_SEPARATOR . 'RAG' . DIRECTORY_SEPARATOR . 'transcripts';
        if (!file_exists($this->mediaPath)) {
            mkdir($this->mediaPath, 0777, true);
        }
    }

    public function returnBasePath(){
        return $this->basePath;
    }

    public function returnMediaPath(){
        return $this->mediaPath;
    }

    /* ----------------------------
       URL / File Path Helpers
       ---------------------------- */

    /**
     * Check if the provided input contains a valid URL.
     *
     * This function looks for the first occurrence of "http" to detect a URL.
     *
     * @param string $input
     * @return bool True if input contains a URL.
     */
    public function isUrl($input) {
        $pos = strpos($input, 'http');
        if ($pos === false) {
            return false;
        }
        $url = substr($input, $pos);
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    /**
     * Check if the URL comes from a supported host.
     *
     * @param string $url
     * @return bool
     */
    public function isSupportedUrl($url) {
        $parsedUrl = parse_url($url);
        $host = $parsedUrl['host'] ?? '';
        foreach ($this->supportedHosts as $supportedHost) {
            if (strpos($host, $supportedHost) !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * Prepare a full file path based on the base path and a relative upload path.
     *
     * @param string $uploadPath
     * @return string Full path (real path).
     * @throws Exception if the path does not exist.
     */
    public function prepareURL($uploadPath) {

        if (strpos($uploadPath, '..') !== false) {
            die("Invalid path — traversal attempt detected!");
        }

        $fullPath = $this->basePath . '/' . ltrim($uploadPath, '/');
        $finalPath = realpath($fullPath);
        if ($finalPath === false) {
            throw new Exception("File or directory does not exist: " . $fullPath);
        }
        return $finalPath;
    }

    /**
     * Provide safe escapeshell argument handling.
     *
     * @param string $arg
     * @return string Escaped argument.
     */
    public function customEscapeshellarg($arg) {
        if (DIRECTORY_SEPARATOR == '\\') {
            return '"' . str_replace('"', '""', $arg) . '"';
        } else {
            return "'" . str_replace("'", "'\\''", $arg) . "'";
        }
    }

    /* ----------------------------
       Video Download and Subtitle Retrieval
       ---------------------------- */

    /**
     * Downloads the video for a given input containing a URL.
     *
     * It extracts the URL from the input, prepares a media folder based on the local part,
     * and downloads the video using yt-dlp.
     *
     * @param string $input A string containing a file path, URL or a file path followed by a URL (legacy).
     * @return string Path to the downloaded video.
     * @throws Exception if download fails or the URL is unsupported.
     */
    public function downloadVideo($input) {
        $pattern = '/(https?:\/\/\S+)/';
        if (preg_match($pattern, $input, $matches)) {
            $url = $matches[0];
            $filePath = str_replace($url, '', $input);
            $filePath = rtrim($filePath, '/');
        } else {
            throw new Exception("No valid URL found in input.");
        }

        if (!$this->isSupportedUrl($url)) {
            throw new Exception("Unsupported URL: " . $url);
        }
        $uniqueFilename = uniqid('video_', true) . '.mp4';
        $outputPath = $this->mediaPath . '/' . $uniqueFilename;
        $command = "yt-dlp -f best -o " . $this->customEscapeshellarg($outputPath)
            . " " . $this->customEscapeshellarg($url);
        exec($command, $output, $returnVar);
        if ($returnVar !== 0) {
            throw new Exception("Failed to download video: " . implode("\n", $output));
        }
        return $outputPath;
    }

    /**
     * Download manually added subtitles (in English) from a video URL using yt-dlp.
     *
     * This function checks the video's metadata and if manually added subtitles are present,
     * downloads them into a temporary file and returns that file path.
     *
     * @param string $url The video URL.
     * @param string $lang Language code (default: 'en').
     * @return mixed The subtitle file path if found, or false otherwise.
     */
    public function downloadManualSubtitles($url, $lang = 'en') {
        // Use system temp files to store transcripts
        $mediaDir = sys_get_temp_dir();
        $subtitleFilename = uniqid('subs_manual_', true) . '.srt';
        $subtitlePath = $mediaDir . '/' . $subtitleFilename;

        // Prepare the yt-dlp command for downloading manual subtitles.
        $command = "yt-dlp --write-sub --sub-lang " . escapeshellarg($lang)
            . " --skip-download -o " . $this->customEscapeshellarg($subtitlePath)
            . " " . $this->customEscapeshellarg($url);
        exec($command, $output, $returnVar);

        if ($returnVar === 0 && file_exists($subtitlePath)) {
            return $subtitlePath;
        }
        return false;
    }

    /**
     * (Optional) Download auto-generated subtitles.
     *
     * This is a fallback if manual subtitles are not available.
     *
     * @param string $url
     * @param string $lang
     * @return mixed Path to subtitles file or false.
     */
    public function downloadAutoSubtitles($url, $lang = 'en') {
        $dummyFile = $this->downloadVideo($url);
        $mediaDir = dirname($dummyFile);
        if (file_exists($dummyFile)) {
            unlink($dummyFile);
        }
        $subtitleFilename = uniqid('subs_auto_', true) . '.srt';
        $subtitlePath = $mediaDir . '/' . $subtitleFilename;
        $command = "yt-dlp --write-auto-sub --sub-lang " . escapeshellarg($lang)
            . " --skip-download -o " . $this->customEscapeshellarg($subtitlePath)
            . " " . $this->customEscapeshellarg($url);
        exec($command, $output, $returnVar);
        if ($returnVar === 0 && file_exists($subtitlePath)) {
            return $subtitlePath;
        }
        return false;
    }

    /* ----------------------------
       MIME Type & File Type Handling
       ---------------------------- */

    /**
     * Determines the MIME type of a given file.
     *
     * @param string $filePath
     * @return string MIME type.
     */
    //todo ensure only files in proper directory are readable.
    public function getMimeType($filePath) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = mime_content_type($filePath);
        finfo_close($finfo);
        return $mimeType;
    }

    /* ----------------------------
       Audio Extraction & Transcript Saving
       ---------------------------- */

    /**
     * Extract audio from a video file using FFmpeg.
     *
     * @param string $videoFilePath
     * @return string Path to the extracted audio file.
     * @throws Exception if extraction fails.
     */
    public function extractAudio($videoFilePath) {
        global $xerte_toolkits_site;

        // Check whether the file does not have path traversal
        x_check_path_traversal($videoFilePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');


        $outputFileName = 'output_audio_' . uniqid() . '.mp3';
        $outputAudioPath = dirname($videoFilePath) . '/' . $outputFileName;
        $command = "ffmpeg -i " . $this->customEscapeshellarg($videoFilePath)
            . " -q:a 0 -map a " . $this->customEscapeshellarg($outputAudioPath) . " 2>&1";
        $descriptors = [
            0 => ["pipe", "r"],
            1 => ["pipe", "w"],
            2 => ["pipe", "w"]
        ];
        $process = proc_open($command, $descriptors, $pipes);
        if (is_resource($process)) {
            fclose($pipes[0]);
            $stdout = '';
            $stderr = '';
            while (!feof($pipes[1]) || !feof($pipes[2])) {
                if (!feof($pipes[1])) {
                    $stdout .= fread($pipes[1], 1024);
                }
                if (!feof($pipes[2])) {
                    $stderr .= fread($pipes[2], 1024);
                }
            }
            fclose($pipes[1]);
            fclose($pipes[2]);
            $return_var = proc_close($process);
            if ($return_var != 0) {
                throw new Exception("Error extracting audio from video. FFmpeg output:\n" . $stderr);
            }
            return $outputAudioPath;
        } else {
            throw new Exception("Could not open process for FFmpeg.");
        }
    }

    /**
     * Save a transcript string as a text file in the same directory as the media file.
     *
     * @param string $transcript
     * @param string $mediaFilePath
     * @return string Path to the saved transcript.
     */
    public function saveAsTextFile($transcript, $mediaFilePath) {
        global $xerte_toolkits_site;

        // Check whether the file does not have path traversal
        x_check_path_traversal($mediaFilePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

        $directoryPath = $mediaFilePath;
        $timestamp = date('Ymd_His');
        $transcriptFileName = "transcription_result_{$timestamp}.txt";
        $transcriptFilePath = $directoryPath . '/' . $transcriptFileName;
        if (file_put_contents($transcriptFilePath, $transcript)) {
            return $transcriptFilePath;
        } else {
            return "Failed to save the transcript.";
        }
    }

    /**
     * Delete a file from disk.
     *
     * @param string $filePath
     * @return boolean true if success, false if failed.
     */
    private function deleteFile($filePath) {
        global $xerte_toolkits_site;

        // Check whether the file does not have path traversal
        x_check_path_traversal($filePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

        if (is_file($filePath)) {
            return unlink($filePath);
        } else {
            // File does not exist or is not a file
            return false;
        }
    }


    /* ----------------------------
       High-Level: Get Transcript Workflow
       ---------------------------- */

    /**
     * Returns a transcript for the provided input.
     *
     * If the input is a URL, it first checks whether manually added subtitles exist.
     * If so, it returns the text from those subtitles. Otherwise, it falls back to
     * downloading the video, extracting the audio, and letting an AI transcriber create
     * a transcript.
     *
     * If the input is already a file path, it checks the MIME type and either:
     *   - For video files: extract audio and transcribe.
     *   - For audio files: transcribe directly.
     *
     * Note that the actual AI transcription is handled by an injected transcriber
     *
     * @param string $input URL or file path.
     * @param object $transcriber An instance of your AI transcription service.
     * @param string $lang Language code for subtitles (default "en").
     * @return string The final transcript.
     */
    public function getTranscript($input, $lang = 'en') {
        // Case 1: Input is a URL.
        if ($this->isUrl($input)) {
            // Extract the URL portion.
            preg_match('/(https?:\/\/\S+)/', $input, $matches);
            $url = $matches[0];
            if (!$this->isSupportedUrl($url)) {
                throw new Exception("Unsupported domain: " . $url);
            }
            // FIRST: Attempt to get manually added subtitles.
            $manualSubs = $this->downloadManualSubtitles($url, $lang);
            if ($manualSubs !== false) {
                // If manual subtitles exist, use their content and return.
                return file_get_contents($manualSubs);
            }
            // (Alternatively, you could try auto subtitles here, but currently we've decided the requirement is to use them only if manual subs do not exist.)
            // Fallback: Download video, extract audio, and transcribe.
            $downloadedVideo = $this->downloadVideo($input);
            $extractedAudio = $this->extractAudio($downloadedVideo);
            $transcribedAudio = $this->transcriber->transcribeAudioTimestamped($extractedAudio);
            $this->deleteFile($downloadedVideo);
            $this->deleteFile($extractedAudio);
            return $transcribedAudio;
        }
        // Case 2: Input is a file path.
        else {
            $filePath = $this->prepareURL($input);

            global $xerte_toolkits_site;

            // Check whether the file does not have path traversal
            x_check_path_traversal($filePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

            $mimeType = $this->getMimeType($filePath);
            $videoMimeTypes = ['video/mp4', 'video/avi', 'video/mpeg', 'video/quicktime', 'application/octet-stream'];
            $audioMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
            if (in_array($mimeType, $videoMimeTypes)) {
                $extractedAudio = $this->extractAudio($filePath);
                $transcribedAudio = $this->transcriber->transcribeAudioTimestamped($extractedAudio);
                $this->deleteFile($extractedAudio);
                return $transcribedAudio;
            } elseif (in_array($mimeType, $audioMimeTypes)) {
                return $this->transcriber->transcribeAudioTimestamped($filePath);
            } else {
                //throw new Exception("Unsupported media type for transcription: " . $mimeType);
                throw new Exception("Unsupported media type for transcription.");
            }
        }
    }
}
