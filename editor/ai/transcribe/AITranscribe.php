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
    protected function formatSegmentsWithTimestamps($segments) {
        $formattedText = '';
        foreach ($segments as $segment) {
            if (isset($segment['start'], $segment['end'], $segment['text'])) {
                $formattedText .= "S: {$segment['start']} E: {$segment['end']} Text: {$segment['text']}\n";
            }
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
            'response_format' => 'verbose_json',
            'timestamp_granularities' => ['segment']
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
        $url = "https://api.gladia.io/v2/transcription";
        $headers = [
            "x-gladia-key: " . $this->apiKey,
            "Content-Type: multipart/form-data"
        ];

        // Initiate the transcription job.
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_POST, true);

        $fileName = basename($filePath);
        // Use mime_content_type to determine the proper MIME type.
        $mimeType = mime_content_type($filePath);
        $cFile = new CURLFile($filePath, $mimeType, $fileName);

        // Set required parameters (you can extend this array with additional Gladia options).
        $postData = [
            'audio'    => $cFile,
            'language' => 'en'
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

        if (isset($response['result_url'])) {
            $resultUrl = $response['result_url'];
            // Poll the result URL until the transcription is done.
            $transcriptionResponse = $this->pollForResult($resultUrl, $headers);
            if (isset($transcriptionResponse['result']['segments'])) {
                return $this->formatSegmentsWithTimestamps($transcriptionResponse['result']['segments']);
            }
            if (isset($transcriptionResponse['result']['transcription'])) {
                return $transcriptionResponse['result']['transcription'];
            }
            return 'Transcription result not found.';
        }
        return 'Transcription initiation failed.';
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