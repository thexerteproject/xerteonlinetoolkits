<?php
namespace transcribe;
use \Exception;
use \CURLFile;

require_once __DIR__.'/../logging/log_ai_request.php';
/**
 * Abstract base class for AI-based transcription services.
 */
abstract class AITranscribe {
    protected $apiKey;
    protected $mediaPath;

    /**
     * Constructor accepts the API key.
     */
    public function __construct($apiKey, $basePath) {
        $this->apiKey = $apiKey;
        $this->mediaPath = $basePath . DIRECTORY_SEPARATOR . 'RAG' . DIRECTORY_SEPARATOR . 'transcripts';
        $this->sessionId = "token is busted";
    }

    /**
     * Each subclass must implement its own transcription method.
     */
    abstract public function transcribeAudioTimestamped($filePath);

    /**
     * @var string|null  Path to the last temp directory used for chunking.
     */
    protected $chunkTmpDir = null;

    /**
     * Format transcription segments with start/end timestamps.
     */
    protected function formatSegmentsWithTimestamps($vttContent, $secondsOnly = false)
    {
        $lines = preg_split('/\R/', $vttContent);
        $formattedText = '';
        $currentStart = $currentEnd = null;
        $currentText = '';

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip the WEBVTT header, cue indices or empty lines
            if ($line === '' || $line === 'WEBVTT' || preg_match('/^\d+$/', $line)) {
                continue;
            }

            // Timestamp line?
            if (preg_match(
                '/^(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/',
                $line,
                $m
            )) {
                // Flush previous cue
                if ($currentStart !== null) {
                    $formattedText .= $this->formatCueLine($currentStart, $currentEnd, $currentText, $secondsOnly);
                }

                // Start a new cue
                $currentStart = $m[1];
                $currentEnd   = $m[2];
                $currentText  = '';
                continue;
            }

            // Otherwise it’s cue text; accumulate (space-separated)
            $currentText .= ($currentText === '' ? '' : ' ') . $line;
        }

        // Flush the very last cue
        if ($currentStart !== null) {
            $formattedText .= $this->formatCueLine($currentStart, $currentEnd, $currentText, $secondsOnly);
        }

        return $this->removeSpecialCharacters($formattedText);
    }

    /**
     * Helper: format a single cue line either as hh:mm:ss.mmm or seconds with 1 decimal.
     */
    protected function formatCueLine($start, $end, $text, $secondsOnly)
    {
        if ($secondsOnly) {
            $startSec = $this->timestampToSeconds($start);
            $endSec   = $this->timestampToSeconds($end);

            // Always 1 decimal place, e.g. 3.3, 76.9, 120.0
            return sprintf("S: %.1f E: %.1f Text: %s\n", $startSec, $endSec, $text);
        }

        // The original timestamps
        return "S: {$start} E: {$end} Text: {$text}\n";
    }

    /**
     * Convert "HH:MM:SS.mmm" to seconds (float), rounded to 1 decimal.
     */
    protected function timestampToSeconds($timestamp)
    {
        // Split into H, M, S.mmm
        list($h, $m, $s) = explode(':', $timestamp);

        $seconds = ((int) $h) * 3600
            + ((int) $m) * 60
            + (float) $s; // handles the .mmm part

        // Round to 1 decimal place as requested
        return round($seconds, 1);
    }

    /**
     * Provide safe escapeshell argument handling.
     *
     * @param string $arg
     * @return string Escaped argument.
     */
    protected function customEscapeshellarg($arg) {
        if (DIRECTORY_SEPARATOR == '\\') {
            return '"' . str_replace('"', '""', $arg) . '"';
        } else {
            return "'" . str_replace("'", "'\\''", $arg) . "'";
        }
    }

    /**
     * Remove specific special characters from a string.
     */
    protected function removeSpecialCharacters($string) {
        $charactersToRemove = ['"', "'", "/", "\\"];
        return str_replace($charactersToRemove, '', $string);
    }


    /**
     * Format the JSON 'segments' array into timestamped text.
     *
     * @param array $segments  Each element has 'start', 'end', and 'text' keys.
     * @return string
     */
    protected function formatJsonSegments(array $segments)
    {
        $out = '';
        foreach ($segments as $seg) {
            // Format seconds.fraction to H:i:s.ms
            $fmt = function($sec) {
                $h = floor($sec / 3600);
                $m = floor(($sec % 3600) / 60);
                $s = $sec % 60;
                return sprintf('%02d:%02d:%06.3f', $h, $m, $s);
            };
            $start = $fmt($seg['start']);
            $end   = $fmt($seg['end']);
            $text  = trim($seg['text']);
            $out  .= "S: {$start} E: {$end} Text: {$text}\n";
        }
        return $this->removeSpecialCharacters($out);
    }

    protected function shiftVttTimestamps($vtt, $offsetSeconds)
    {
        // Callback to shift each HH:MM:SS.mmm timestamp by $offsetSeconds
        return preg_replace_callback(
            '/(\d{2}):(\d{2}):(\d{2}\.\d{3})/',
            function($m) use ($offsetSeconds) {
                list(, $h, $mi, $s_ms) = $m;
                $total = ((int)$h)*3600 + ((int)$mi)*60 + (float)$s_ms + $offsetSeconds;
                $H = floor($total/3600);
                $M = floor(($total%3600)/60);
                $S = $total - ($H*3600) - ($M*60);
                return sprintf('%02d:%02d:%06.3f', $H, $M, $S);
            },
            $vtt
        );
    }

    /**
     * If the given file exceeds $maxBytes, uses FFmpeg to split it into
     * $segmentSeconds‐long chunks (copied, not re‑encoded), stored in a
     * temporary directory. Otherwise, returns the single original file.
     *
     * @param string $filePath        Absolute path to the source file.
     * @param int    $maxBytes        Max allowed size in bytes before splitting. Default 25 MB.
     * @param int    $segmentSeconds  Length in seconds of each chunk. Default 900s.
     * @return string[]               List of file paths to process.
     * @throws \RuntimeException      On failure to create temp dir or if FFmpeg returns non‐zero.
     */
    protected function prepareChunkedFiles(
        $filePath,
        $maxBytes       = 25 * 1024 * 1024,
        $segmentSeconds = 900
    )  {
        global $xerte_toolkits_site;

        // Check whether the file does not have path traversal
        x_check_path_traversal($filePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

        //reset previous tempdir
        $this->chunkTmpDir = null;

        // If file is too big, split into segments
        if (\filesize($filePath) > $maxBytes) {
            // create a temp directory for this run
            //todo alek double check if chunck are stored and handled in the userfiles instead of temp
            $tmpDir = $this->mediaPath . DIRECTORY_SEPARATOR . 'whisper_chunks_' . \uniqid();
            if (!\mkdir($tmpDir, 0777, true) && !\is_dir($tmpDir)) {
                throw new \RuntimeException("Unable to create temp directory: {$tmpDir}");
            }

            // remember it for cleanup()
            $this->chunkTmpDir = $tmpDir;

            $ext     = \pathinfo($filePath, PATHINFO_EXTENSION);
            $pattern = $tmpDir . DIRECTORY_SEPARATOR . "chunk_03d.{$ext}";
            //todo alek this part is broken.
            $this->exec_chunk($filePath, $segmentSeconds, $pattern);

            // collect and sort the generated chunks
            $chunks = \glob($tmpDir . DIRECTORY_SEPARATOR . "chunk_*.{$ext}") ?: [];
            \sort($chunks);
            return $chunks;
        }

        // file under threshold: just return it without altering the temp dir
        return [ $filePath ];
    }

    /**
     * Remove any leftover chunk files from the last call to prepareChunkedFiles().
     * Safe to call even if nothing was split.
     */
    protected function cleanupChunkedFiles()
    {
        if ($this->chunkTmpDir && \is_dir($this->chunkTmpDir)) {
            //todo handle errs/warnings
            foreach (\glob($this->chunkTmpDir . DIRECTORY_SEPARATOR . '*') as $file) {
                unlink($file);
            }
            rmdir($this->chunkTmpDir);
            $this->chunkTmpDir = null;
        }
    }

    //use with care uses exec
    protected function exec_chunk($filePath, $segmentSeconds, $pattern) {
        // build and run the ffmpeg command
        $cmd = \sprintf(
            'ffmpeg -i %s -f segment -segment_time %d -c copy %s 2>&1',
            $this->customEscapeshellarg($filePath),
            $segmentSeconds,
            $this->customEscapeshellarg($pattern)
        );

        \exec($cmd, $outputLines, $returnCode);
        if ($returnCode !== 0) {
            $output = \implode("\n", $outputLines);
            throw new \RuntimeException("FFmpeg split failed (exit code {$returnCode}):\n{$output}");
        }

    }

}


/**
 * OpenAI transcription implementation.
 */
class OpenAITranscribe extends AITranscribe
{
    /**
     * Transcribe an audio file with optional timestamps or subtitle output.
     *
     * @param string $filePath               Path to the audio file (mp3, wav, m4a, etc.).
     * @param string $model                  Model to use: "whisper-1", "gpt-4o-transcribe", etc.
     * @param string $responseFormat         One of: "json", "verbose_json", "srt", "vtt", or "text".
     * @param string|null $timestampGranularities
     *                                      Comma‑separated "segment" and/or "word".
     *                                      Only used when $responseFormat === "verbose_json".
     *
     * @return string                        Transcription text, subtitle content, or formatted segments.
     */
    public function transcribeAudioTimestamped(
        $filePath,
        $model = 'whisper-1',
        $responseFormat = 'vtt',
        $timestampGranularities = 'segment'
    )  {
        global $xerte_toolkits_site;

        // Check whether the file does not have path traversal
        x_check_path_traversal($filePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

        // === CONFIG ===
        $maxBytes       = 25 * 1024 * 1024;   // 25MB limit
        $segmentSeconds = 900;                // 15‑minute chunks
        $apiUrl         = "https://api.openai.com/v1/audio/transcriptions";
        $authHeader     = "Authorization: Bearer " . $this->apiKey;


        $filesToProcess = $this->prepareChunkedFiles($filePath);

        // === STEP 2: Transcribe each chunk ===
        $allSegments = [];
        $allVtt      = '';
        $allText     = '';
        //offset is needed for multi-chunk transcription, to account for the fact that for each new transcription the time will
        //be reset to 0
        $offset   = 0;

        foreach ($filesToProcess as $i=>$chunk) {
            $ch = curl_init($apiUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,

                // === force brand‑new TCP/TLS each time ===
                CURLOPT_FORBID_REUSE   => true,
                CURLOPT_FRESH_CONNECT  => true,

                // === verbose for debugging ===
                CURLOPT_VERBOSE        => true,
                CURLOPT_STDERR         => fopen(__DIR__ . '/curl_debug.log', 'a+'),

                // SWITCH TO HTTP/1.0 HERE (no chunked encoding)
                CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_0,

                CURLOPT_HTTPHEADER     => [
                    $authHeader,
                    'Connection: close',
                    'Expect:',   // disable Expect: 100-continue
                ],
            ]);

            $cFile = new CURLFile($chunk, mime_content_type($chunk), basename($chunk));
            $payload = [
                'file'            => $cFile,
                'model'           => $model,
                'response_format' => $responseFormat,
            ];
            if ($responseFormat === 'verbose_json' && $timestampGranularities) {
                $payload['timestamp_granularities'] = $timestampGranularities;
            }
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

            $res = curl_exec($ch);


            log_ai_request($res, 'transcription', 'openai');
            if (curl_errno($ch)) {
                $err = curl_error($ch);
                curl_close($ch);
                throw new \RuntimeException("cURL error: $err");
            }
            curl_close($ch);

            if (in_array($responseFormat, ['json','verbose_json'], true)) {
                $j = json_decode($res, true);
                if (isset($j['segments'])) {
                    $allSegments = array_merge($allSegments, $j['segments']);
                } elseif (isset($j['text'])) {
                    $allText .= $j['text'];
                }
            } elseif ($responseFormat === 'vtt') {
                // 1) Strip extra headers from 2nd+ chunks:
                $chunkVtt = trim($res);
                if ($i > 0) {
                    // remove the leading "WEBVTT" and any blank line after it
                    $chunkVtt = preg_replace("/^WEBVTT.*?\\r?\\n\\r?\\n/s", '', $chunkVtt);
                }

                // 2) Shift every timestamp by the current offset
                $shifted = $this->shiftVttTimestamps($chunkVtt, $offset);

                // 3) Append (and ensure a blank line between chunks)
                $allVtt .= $shifted . "\n\n";

                // 4) Increase offset for the next chunk
                $offset += $segmentSeconds;
            } else {
                // srt or plain text
                $allText .= $res . "\n";
            }
        }

        // === STEP 3: Clean up temp chunks ===
        $this->cleanupChunkedFiles();

        // === STEP 4: Final formatting & return ===
        if (in_array($responseFormat, ['json','verbose_json'], true)) {
            return $this->formatJsonSegments($allSegments);
        }
        if ($responseFormat === 'vtt') {
            return $this->formatSegmentsWithTimestamps($allVtt, true);
        }
        // srt or plain text
        return trim($allText);
    }

}

/**
 * Gladia transcription implementation.
 *
 * Note: The Gladia API is asynchronous.
 * After initiating a transcription job, you must poll the returned result URL until the status is "done."
 */
class GladiaTranscribe extends AITranscribe {
    public function transcribeAudioTimestamped($filePath) {
        global $xerte_toolkits_site;

        // Check whether the file does not have path traversal
        x_check_path_traversal($filePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');


        $filesToProcess = $this->prepareChunkedFiles($filePath);
        $allVtt      = '';
        //offset is needed for multi-chunk transcription, to account for the fact that for each new transcription the time will
        //be reset to 0
        $offset   = 0;
        $maxBytes       = 25 * 1024 * 1024;   // 25MB limit
        $segmentSeconds = 900;                // 15‑minute chunks

        foreach ($filesToProcess as $i=>$chunk) {
            // Step 1: Upload the file to get the audio_url
            $uploadUrl = "https://api.gladia.io/v2/upload";
            $uploadHeaders = [
                "x-gladia-key: " . $this->apiKey,
                "Content-Type: multipart/form-data"
            ];

            $fileName = basename($chunk);
            $mimeType = mime_content_type($chunk);
            $cFile = new CURLFile($chunk, $mimeType, $fileName);

            $uploadData = [
                'audio' => $cFile
            ];

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_URL, $uploadUrl);
            curl_setopt($curl, CURLOPT_HTTPHEADER, $uploadHeaders);
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $uploadData);

            $uploadResult = curl_exec($curl);
            if (curl_errno($curl)) {
                $error = 'Upload Error: ' . curl_error($curl);
                curl_close($curl);
                throw new Exception($error);
            }
            curl_close($curl);

            $uploadResponse = json_decode($uploadResult, true);
            if (!isset($uploadResponse['audio_url'])) {
                throw new Exception('Gladia: File upload failed.');
            }
            $audioUrl = $uploadResponse['audio_url'];

            // Step 2: Initiate the transcription using minimal parameters.
            $transcriptionUrl = "https://api.gladia.io/v2/pre-recorded";
            $transcriptionHeaders = [
                "x-gladia-key: " . $this->apiKey,
                "Content-Type: application/json"
            ];

            // Minimal payload: only the required audio_url and detect_language flag.
            $payload = json_encode([
                "audio_url" => $audioUrl,
                "detect_language" => true,
                "subtitles" => true,
                "subtitles_config" => [
                    "formats" => [
                        "vtt"
                    ],
                    "minimum_duration" => 1.0,
                    "maximum_duration" => 7.0,
                    "maximum_characters_per_row" => 32,
                    "maximum_rows_per_caption" => 2,
                    "style" => "default",
                ]
            ]);

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_URL, $transcriptionUrl);
            curl_setopt($curl, CURLOPT_HTTPHEADER, $transcriptionHeaders);
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);

            $transcriptionResult = curl_exec($curl);
            if (curl_errno($curl)) {
                $error = 'Transcription initiation Error: ' . curl_error($curl);
                curl_close($curl);
                throw new Exception($error);
            }
            curl_close($curl);

            $transcriptionResponse = json_decode($transcriptionResult, true);
            if (!isset($transcriptionResponse['result_url'])) {
                throw new Exception('Transcription initiation failed.');
            }
            $resultUrl = $transcriptionResponse['result_url'];
            $transcriptionId =  $transcriptionResponse['id'];

            // Poll for the final json result.
            $finalResult = $this->pollForResult($resultUrl, $transcriptionHeaders);

            if (isset($finalResult['result']['transcription']['subtitles'])) {
                $res = $finalResult['result']['transcription']['subtitles'][0]['subtitles'];
                // 1) Strip extra headers from 2nd+ chunks:
                log_ai_request($res, 'transcription', 'gladia');
                $chunkVtt = trim($res);
                if ($i > 0) {
                    // remove the leading "WEBVTT" and any blank line after it
                    $chunkVtt = preg_replace("/^WEBVTT.*?\\r?\\n\\r?\\n/s", '', $chunkVtt);
                }

                // 2) Shift every timestamp by the current offset
                $shifted = $this->shiftVttTimestamps($chunkVtt, $offset);

                // 3) Append (and ensure a blank line between chunks)
                $allVtt .= $shifted . "\n\n";

                // 4) Increase offset for the next chunk
                $offset += $segmentSeconds;

            }

            $this->deleteGladiaTranscription($transcriptionId);
        }
        $this->cleanupChunkedFiles();

        return $this->formatSegmentsWithTimestamps($allVtt, true);
    }

    /**
     * Poll the Gladia result URL until the status is "done".
     */
    protected function pollForResult($resultUrl, $headers) {
        while (true) {
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_URL, $resultUrl);
            curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
            $pollResult = curl_exec($curl);
            curl_close($curl);

            $pollResponse = json_decode($pollResult, true);
            if (isset($pollResponse['status']) && $pollResponse['status'] === 'done') {
                return $pollResponse;
            }
            // Wait 1 second before polling again.
            sleep(1);
        }
    }

    /**
     * Delete a pre‑recorded transcription from Gladia.
     *
     * @param string $transcriptionId  The {id} returned when you created the transcription.
     * @return bool                    True if deletion succeeded.
     * @throws \RuntimeException       On HTTP errors or cURL failures.
     */
    protected function deleteGladiaTranscription($transcriptionId)
    {
        $url = "https://api.gladia.io/v2/pre-recorded/{$transcriptionId}";

        $ch = \curl_init($url);
        \curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST  => 'DELETE',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'x-gladia-key: ' . $this->apiKey,
            ],
        ]);

        $response   = \curl_exec($ch);
        $curlErrno  = \curl_errno($ch);
        $curlError  = \curl_error($ch);
        $httpStatus = \curl_getinfo($ch, CURLINFO_HTTP_CODE);
        \curl_close($ch);

        if ($curlErrno) {
            throw new \RuntimeException("cURL error deleting transcription: {$curlError}");
        }

        if ($httpStatus < 200 || $httpStatus >= 300) {
            throw new \RuntimeException(
                "Gladia delete failed (HTTP {$httpStatus}): " . ($response ?: 'no response body')
            );
        }

        return true;
    }
}

//Serves as a fallback for when no transcription service is enabled
class UninitializedTranscribe extends AITranscribe {
    public function transcribeAudioTimestamped($filePath){
    throw new Exception("Transcription service not enabled. Audio files, video files and video links, cannot be used for retrieval at this time. Please contact your administrator to enable a transcription service.");
    }
}

