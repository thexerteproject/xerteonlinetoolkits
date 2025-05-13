<?php
/**
 * Abstract base class for AI-based transcription services.
 */
abstract class AITranscribe {
    protected $apiKey;

    /**
     * Constructor accepts the API key.
     */
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    /**
     * Each subclass must implement its own transcription method.
     */
    abstract public function transcribeAudioTimestamped($filePath);

    /**
     * Format transcription segments with start/end timestamps.
     */
    protected function formatSegmentsWithTimestamps($vttContent) {
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
                    $formattedText .= "S: {$currentStart} E: {$currentEnd} Text: {$currentText}\n";
                }
                // Start a new cue
                $currentStart = $m[1];
                $currentEnd   = $m[2];
                $currentText  = '';
                continue;
            }

            // Otherwise it’s cue text; accumulate (space‑separated)
            $currentText .= ($currentText === '' ? '' : ' ') . $line;
        }

        // Flush the very last cue
        if ($currentStart !== null) {
            $formattedText .= "S: {$currentStart} E: {$currentEnd} Text: {$currentText}\n";
        }

        return $this->removeSpecialCharacters($formattedText);
    }

    /**
     * Remove specific special characters from a string.
     */
    protected function removeSpecialCharacters($string) {
        $charactersToRemove = ['"', "'", "/", "\\"];
        return str_replace($charactersToRemove, '', $string);
    }

    /**
     * Save the transcript to a text file in the same directory as the audio file.
     */
    public function saveAsTextFile($transcript, $audioFilePath) {
        $directoryPath = dirname($audioFilePath);
        $transcriptFilePath = $directoryPath . '/transcription_result.txt';
        if (file_put_contents($transcriptFilePath, $transcript)) {
            return $transcriptFilePath;
        }
        return "Failed to save the transcript.";
    }

    /**
     * Delete a local file.
     */
    public function deleteLocalFile($filePath) {
        if (file_exists($filePath)) {
            if (unlink($filePath)) {
                return "File deleted successfully.";
            } else {
                return "Error: Could not delete the file.";
            }
        }
        return "Error: File does not exist.";
    }
}

/**
 * OpenAI transcription implementation.
 */
class OpenAITranscribe extends AITranscribe {
    public function transcribeAudioTimestamped($filePath) {
        $authorization = "Authorization: Bearer " . $this->apiKey;
        $url = "https://api.openai.com/v1/audio/transcriptions";

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: multipart/form-data"
        ]);
        curl_setopt($curl, CURLOPT_POST, true);

        $fileName = basename($filePath);
        $cFile = new CURLFile($filePath, 'audio/mpeg', $fileName);

        // Set up request data for a verbose response with segment timestamps.
        $postData = [
            'file' => $cFile,
            'model' => 'whisper-1',
            'response_format' => 'vtt',
            //'timestamp_granularities' => ['segment']
        ];
        curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);

        $result = curl_exec($curl);
        if (curl_errno($curl)) {
            $error = 'Error: ' . curl_error($curl);
            curl_close($curl);
            return $error;
        }
        curl_close($curl);
        $response = json_decode($result, true);
        if (isset($response['segments'])) {
            return $this->formatSegmentsWithTimestamps($response['segments']);
        }
        return 'Transcription failed or no segments found.';
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
        // Step 1: Upload the file to get the audio_url
        $uploadUrl = "https://api.gladia.io/v2/upload";
        $uploadHeaders = [
            "x-gladia-key: " . $this->apiKey,
            "Content-Type: multipart/form-data"
        ];

        $fileName = basename($filePath);
        $mimeType = mime_content_type($filePath);
        $cFile = new CURLFile($filePath, $mimeType, $fileName);

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
            return $error;
        }
        curl_close($curl);

        $uploadResponse = json_decode($uploadResult, true);
        if (!isset($uploadResponse['audio_url'])) {
            return 'File upload failed.';
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
            "audio_url"       => $audioUrl,
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
            return $error;
        }
        curl_close($curl);

        $transcriptionResponse = json_decode($transcriptionResult, true);
        if (!isset($transcriptionResponse['result_url'])) {
            return 'Transcription initiation failed.';
        }
        $resultUrl = $transcriptionResponse['result_url'];

        // Poll for the final json result.
        $finalResult = $this->pollForResult($resultUrl, $transcriptionHeaders);
        if (isset($finalResult['result']['transcription']['subtitles'])) {
            //return the vtt subtitles
            return $this->formatSegmentsWithTimestamps($finalResult['result']['transcription']['subtitles'][0]['subtitles']);
        }
        if (isset($finalResult['result']['transcription'])) {
            return $finalResult['result']['transcription'];
        }
        return 'Transcription result not found.';
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
}