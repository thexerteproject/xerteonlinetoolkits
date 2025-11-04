<?php

namespace rag;

class MistralRAG extends BaseRAG
{
    private $apiKey;

    public function __construct($apiKey, $encodingDirectory, $chunkSize = 2048)
    {
        parent::__construct($encodingDirectory, $chunkSize);
        $this->apiKey = $apiKey;
    }

    protected function supportsProviderEmbeddings(): bool { return true; }

    /*Retrieve an embedding for a single piece of text*/
    protected function getEmbedding($text)
    {
        $url = "https://api.mistral.ai/v1/embeddings";
        $data = json_encode(["model" => "mistral-embed", "input" => $text]);

        $headers = [
            "Authorization: Bearer " . $this->apiKey,
            "Content-Type: application/json"
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        curl_close($ch);
        log_ai_request($response, 'encoding', 'mistralenc');

        $decoded = json_decode($response, true);
        $embeddings = $decoded["data"][0]["embedding"] ?? [];
        if (empty($embeddings)) {
            throw new Exception('Embedding failed.');
        }

        return $embeddings;
    }

    /*Retrieve embeddings in batches, in line with the maximum allowed token size of the mistral embed model
    In principle, the max token size is 16384. Since token size is only approximated, though, go with a lower number.*/
    protected function getEmbeddings(array $texts): array
    {
        $maxTokensPerBatch = 15000;
        $url = "https://api.mistral.ai/v1/embeddings";
        $headers = [
            "Authorization: Bearer " . $this->apiKey,
            "Content-Type: application/json"
        ];

        $batches = [];
        $currentBatch = [];
        $currentTokenCount = 0;

        foreach ($texts as $text) {
            $textTokenCount = strlen($text) / 4; // Approximate token count assumption
            if ($currentTokenCount + $textTokenCount > $maxTokensPerBatch && !empty($currentBatch)) {
                $batches[] = $currentBatch;
                $currentBatch = [];
                $currentTokenCount = 0;
            }
            $currentBatch[] = $text;
            $currentTokenCount += $textTokenCount;
        }
        if (!empty($currentBatch)) {
            $batches[] = $currentBatch;
        }

        $embeddings = [];
        foreach ($batches as $batch) {
            $data = json_encode(["model" => "mistral-embed", "input" => $batch]);

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

            $response = curl_exec($ch);
            curl_close($ch);

            log_ai_request($response, 'encoding', 'mistralenc');

            $decoded = json_decode($response, true);
            if (isset($decoded["data"])) {
                foreach ($decoded["data"] as $embedding) {
                    $embeddings[] = $embedding["embedding"] ?? [];
                }
            }
        }

        if (empty($embeddings)) {
            throw new Exception('Embedding failed.');
        }

        return $embeddings;
    }


}
