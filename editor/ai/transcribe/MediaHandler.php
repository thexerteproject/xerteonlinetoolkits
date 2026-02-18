<?php
namespace transcribe;
use \Exception;

class MediaHandler {
    // Supported video hosts.
    protected $supportedHosts = ['youtube.com', 'youtu.be', 'vimeo.com'];
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

        //update supported hosts with info from supported embedding websites
        $jsPath = str_replace('\\', '/', __DIR__)
            . "/../../../modules/xerte/parent_templates/Nottingham/common_html5/js/popcorn/config/peertube_urls.js";

        $peertubeDomains = $this->getPeertubeDomainsFromJs($jsPath);

        $this->supportedHosts = array_values(array_unique(array_merge(
            $this->supportedHosts,
            $peertubeDomains
        )));
    }

    public function returnBasePath(){
        return $this->basePath;
    }

    public function returnMediaPath(){
        return $this->mediaPath;
    }

    /**
     * Extract hostnames from the optional Xerte PeerTube config JS file.
     * The JS is expected to contain something like:
     *   x_peertube_urls = ["https://video.example.org/videos/embed", ...];
     *
     * Returns an array of domains like: ["video.example.org", ...]
     */
    private function getPeertubeDomainsFromJs(string $jsPath): array
    {
        if (!is_file($jsPath) || !is_readable($jsPath)) {
            return [];
        }

        $js = file_get_contents($jsPath);
        if ($js === false || $js === '') {
            return [];
        }

        // Extract all quoted http(s) URLs
        if (!preg_match_all('/["\'](https?:\/\/[^"\']+)["\']/', $js, $m)) {
            return [];
        }

        $domains = [];
        foreach ($m[1] as $u) {
            $host = parse_url($u, PHP_URL_HOST);
            if (!$host) {
                continue;
            }

            $host = strtolower($host);
            //normalize
            $host = preg_replace('/^www\./i', '', $host);

            $domains[] = $host;
        }

        return array_values(array_unique($domains));
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
    private function isSupportedUrl($url) {
        $parsedUrl = parse_url($url);
        $host = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';
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
        global $xerte_toolkits_site;

        $fullPath = $this->basePath . '/' . ltrim($uploadPath, '/');
        x_check_path_traversal($fullPath, $xerte_toolkits_site->users_file_area_full, 'Path traversal detected');
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
    private function customEscapeshellarg($arg) {
        if (DIRECTORY_SEPARATOR == '\\') {
            return '"' . str_replace('"', '""', $arg) . '"';
        } else {
            return "'" . str_replace("'", "'\\''", $arg) . "'";
        }
    }

    /*
     * Language codes in Xerte do not always match those of yt-dlp, and yt-dlp often requires use of regex because of all the
     * regional differences. This function takes a xerte language code as input and turns it into a preference list which can
     * be passed as the language parameter.
     */
    private function xerteLocaleToYtdlpSubLang(string $locale): string
    {
        $locale = trim($locale);
        if ($locale === '') {
            // No locale => no preference (caller should omit --sub-langs if empty) but really this should not be called without a locale
            return '';
        }

        // Normalize underscore to hyphen
        $locale = str_replace('_', '-', $locale);

        // Split language-region
        $parts  = explode('-', $locale, 2);
        $lang   = strtolower($parts[0]);
        $region = isset($parts[1]) ? strtoupper($parts[1]) : null;

        $prefs = [];

        // Exact locale first (normalized casing)
        if ($region) {
            $prefs[] = $lang . '-' . $region;
        } else {
            $prefs[] = $lang;
        }

        // Base language next
        $prefs[] = $lang;

        // Special-case aliases (base + regex as well)
        if ($lang === 'nb') {
            $prefs[] = 'no';
            $prefs[] = 'no.*';
        }
        if ($lang === 'he') {
            $prefs[] = 'iw';
            $prefs[] = 'iw.*';
        }

        // Regex for any variant of the base language
        // Put it after the exact/base matches, so we still prefer specific codes first.
        $prefs[] = $lang . '.*';

        // De-duplicate while preserving order
        $prefs = array_values(array_unique($prefs));

        return implode(',', $prefs);
    }


    private function exec_yt_dlp($filename, $url, $lang = "", $auto = false) {
        if (!isset($_SESSION['toolkits_logon_username']) && php_sapi_name() !== 'cli') {
            die("Session is invalid or expired");
        }

        if ($filename !== "") {
            $outputPath = $this->mediaPath . '/' . $filename;
        }

        // Media download
        if ($lang == "") {
            $command = "yt-dlp -f best -o " . escapeshellarg($outputPath)
                . " " . escapeshellarg($url);

            _debug($command);
            exec($command, $output, $returnVar);
            _debug($output);

            if ($returnVar !== 0) {
                throw new Exception("Failed to download video: " . implode("\n", $output));
            }

            // There's no meaningful return, caller should already know the file name
            return null;
        }

        // Subtitles
        // Use base template so yt-dlp can append ".<lang>.<ext>"
        $outTemplate = $outputPath . '.%(ext)s';

        // Prefer vtt, fallback to srt
        $subFormat = "vtt/srt";

        //Default to english if lang is not found/available or is an unsupported langauge code
        $subLang = $this->xerteLocaleToYtdlpSubLang($lang);

        if ($auto) {
            $command = "yt-dlp --skip-download --write-auto-sub"
                . " --sub-lang " . escapeshellarg($lang)
                . " --sub-format " . escapeshellarg($subFormat)
                . " -o " . escapeshellarg($outTemplate)
                . " " . escapeshellarg($url);
        } else {
            $command = "yt-dlp --skip-download --write-sub"
                . " --sub-lang " . escapeshellarg($subLang)
                . " --sub-format " . escapeshellarg($subFormat)
                . " -o " . escapeshellarg($outTemplate)
                . " " . escapeshellarg($url);
        }

        _debug($command);
        exec($command, $output, $returnVar);
        _debug($output);

        if ($returnVar !== 0) {
            throw new Exception("Failed to download subtitles: " . implode("\n", $output));
        }

        // Find what was actually written. Prefer VTT.
        $vtt = glob($outputPath . '.*.vtt') ?: [];
        if (!empty($vtt)) {
            sort($vtt, SORT_STRING);
            return $vtt[0];
        }

        $srt = glob($outputPath . '.*.srt') ?: [];
        if (!empty($srt)) {
            sort($srt, SORT_STRING);
            return $srt[0];
        }

        throw new Exception("yt-dlp reported success but no subtitle file was found for base: " . $outputPath);
    }



    //ensure proper use of this function to prevent security risks by misuse of proc_open
    private function proc_open_ffmpeg($videoFilePath) {
        global $xerte_toolkits_site;

        if (!isset($_SESSION['toolkits_logon_username']) && php_sapi_name() !== 'cli'){
            die("Session is invalid or expired");
        }

        x_check_path_traversal($videoFilePath, $xerte_toolkits_site->users_file_area_full, "path traversal detected");

        $outputFileName = 'output_audio_' . uniqid() . '.mp3';
        $outputAudioPath = dirname($videoFilePath) . '/' . $outputFileName;

        //todo might break on linux, shouldnt
        $command = "ffmpeg -i " . escapeshellarg($videoFilePath)
            . " -q:a 0 -map a " . escapeshellarg($outputAudioPath) . " 2>&1";
        _debug($command);

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

            // Log everything
            _debug("ffmpeg exit code: " . $return_var);
            _debug("ffmpeg STDOUT:\n" . $stdout);
            _debug("ffmpeg STDERR:\n" . $stderr);


            if ($return_var != 0) {
                throw new Exception("Error extracting audio from video. FFmpeg output:\n");
            }

        } else {
            throw new Exception("Could not open process for FFmpeg.");
        }

        return $outputAudioPath;
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
    private function downloadVideo($input) {
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
        try {
            $this->exec_yt_dlp($uniqueFilename, $url, "", false);
        } catch (Exception $e) {
            throw $e;
        }
        return $this->mediaPath . '/' . $uniqueFilename;
    }

    /**
     * Download manually added subtitles (in English) from a video URL using yt-dlp.
     *
     * This function checks the video's metadata and if manually added subtitles are present,
     * downloads them into a temporary file and returns that file path.
     *
     * @param string $url The video URL.
     * @param string $lang Language code (default: 'en').
     * @return false|string The subtitle file path if found, or false otherwise.
     */
    private function downloadManualSubtitles($url, $lang = 'en') {
        // Use system temp files to store transcripts
        $subtitleBase= uniqid('subs_manual_', true);
        try {
            $subtitlePath = $this->exec_yt_dlp($subtitleBase, $url, $lang, false);
            return ($subtitlePath && file_exists($subtitlePath)) ? $subtitlePath : false;
        } catch (Exception $e) {
            return false;
        }
    }


    /**
     * (Optional) Download auto-generated subtitles.
     *
     * This is a fallback if manual subtitles are not available.
     *
     * @param string $url
     * @param string $lang
     * @return Exception|false Path to subtitles file or false.
     */
    public function downloadAutoSubtitles($url, $lang = 'en') {
        //todo alek this downloads twice, this one needs help
        $dummyFile = $this->downloadVideo($url);
        $mediaDir = dirname($dummyFile);
        if (file_exists($dummyFile)) {
            unlink($dummyFile);
        }
        $subtitleFilename = uniqid('subs_auto_', true) . '.srt';

        try {
            $this->exec_yt_dlp($subtitleFilename, $url, $lang, true);
        } catch (Exception $e) {
            //todo alek
            return $e;
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
    private function getMimeType($filePath) {
        global $xerte_toolkits_site;
        x_check_path_traversal($filePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');
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

        try {
            $outputAudioPath = $this->proc_open_ffmpeg($videoFilePath);
        } catch (Exception $e){
            throw $e;
        }
        return $outputAudioPath;

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

        if(!isset($_SESSION['toolkits_logon_id']) && php_sapi_name() !== 'cli'){
            die("Session ID not set");
        }

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
     * Note that the actual AI transcription is handled by an injected transcriber.
     *
     * @param string $input URL or file path.
     * @param string $lang Language code for subtitles (default "en").
     * @return string The final transcript.
     */
    public function getTranscript($input, $lang = 'en') {
        global $xerte_toolkits_site;

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
                // If manual subtitles exist, process their content and return.
                $responseFormat = pathinfo($manualSubs, PATHINFO_EXTENSION);
                $subContent = file_get_contents($manualSubs);
                if (in_array($responseFormat, ['json','verbose_json'], true)) {
                    return $this->transcriber->formatJsonSegments($subContent);
                }
                if ($responseFormat === 'vtt') {
                    return $this->transcriber->formatSegmentsWithTimestamps($subContent, true);
                }
            }
            // (Alternatively, you could try auto subtitles here, but currently we've decided the requirement is to use them only if manual subs do not exist.)
            // Fallback: Download video, extract audio, and transcribe.
            $downloadedVideo = null;
            $extractedAudio  = null;

            try {
                // 1) Download video (if this throws, nothing to clean up)
                $downloadedVideo = $this->downloadVideo($input);

                // 2) Extract audio (if this throws, clean up video)
                $extractedAudio = $this->extractAudio($downloadedVideo);

                // 3) Transcribe (if this throws, clean up both)
                $transcribedAudio = $this->transcriber->transcribeAudioTimestamped($extractedAudio);

                // Success: cleanup temp files we don't need anymore
                $this->deleteFile($downloadedVideo);
                $this->deleteFile($extractedAudio);

                return $transcribedAudio;

            } catch (Exception $e) {
                // Cleanup whatever was created so far
                if ($extractedAudio) {
                    $this->deleteFile($extractedAudio);
                }
                if ($downloadedVideo) {
                    $this->deleteFile($downloadedVideo);
                }

                throw $e;
            }
        }
        // Case 2: Input is a file path.
        else {
            $filePath = $this->prepareURL($input);

            // Check whether the file does not have path traversal
            x_check_path_traversal($filePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

            $mimeType = $this->getMimeType($filePath);
            //todo alek verify if there should be hardcoded here
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
                throw new Exception("Unsupported media type for transcription.");
            }
        }
    }
}
