<?php

namespace rag;

class OpenAIRAG extends BaseRAG
{
    private $apiKey;

    public function __construct($apiKey, $encodingDirectory, $chunkSize = 2048)
    {
        parent::__construct($encodingDirectory, $chunkSize);
        $this->apiKey = $apiKey;
    }

    protected function supportsProviderEmbeddings(): bool { return true; }

    /* Retrieve an embedding for a single piece of text (OpenAI) */
    protected function getEmbedding($text)
    {
        $url = "https://api.openai.com/v1/embeddings";
        $payload = json_encode([
            "model" => "text-embedding-3-small",
            "input" => $text
            // Optionally: "dimensions" => 1536, // or 512/1024 if you choose to reduce dims -- not recommended
            // "encoding_format" => "float",     // default is float, we use the same across all embedding models
        ]);

        $headers = [
            "Authorization: Bearer " . $this->apiKey,
            "Content-Type: application/json"
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        log_ai_request($response, 'encoding', 'openaienc');
        if ($response === false) {
            $err = curl_error($ch);
            curl_close($ch);
            throw new \RuntimeException('cURL error: ' . $err);
        }
        curl_close($ch);

        $decoded = json_decode($response, true);
        if (isset($decoded['error'])) {
            throw new \RuntimeException('OpenAI error: ' . ($decoded['error']['message'] ?? 'unknown'));
        }

        $emb = $decoded["data"][0]["embedding"] ?? [];
        if (empty($emb)) {
            throw new \RuntimeException('Embedding failed.');
        }

        return $emb;
    }

    /* Retrieve embeddings in batches (OpenAI) */
    protected function getEmbeddings(array $texts): array
    {
        // For OpenAI, the limit is per-input (~8191 tokens for embeddings).
        // We use a simple per-item safety check plus a count-based batcher.
        $approxTokens = function (string $s): int {
            // Rough heuristic: ~4 chars per token, similar to mistral
            return (int)ceil(strlen($s) / 4);
        };

        $maxTokensPerItem = 8000;   // conservative under the ~8191 limit
        $maxItemsPerBatch = 1000;   // conservative; Azure allows up to 2048 inputs per request; we rarely cross over that

        $url = "https://api.openai.com/v1/embeddings";
        $headers = [
            "Authorization: Bearer " . $this->apiKey,
            "Content-Type: application/json"
        ];

        // Build batches
        $batches = [];
        $current = [];
        foreach ($texts as $text) {
            if ($approxTokens($text) > $maxTokensPerItem) {
                throw new \RuntimeException('One input exceeds the max tokens for embeddings; please chunk earlier.');
            }
            $current[] = $text;
            if (count($current) >= $maxItemsPerBatch) {
                $batches[] = $current;
                $current = [];
            }
        }
        if (!empty($current)) {
            $batches[] = $current;
        }

        // Call API for each batch
        $all = [];
        foreach ($batches as $batch) {
            $payload = json_encode([
                "model" => "text-embedding-3-small",
                "input" => $batch
                // Optionally: "dimensions" => 1536,
            ]);

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

            $response = curl_exec($ch);
            log_ai_request($response, 'encoding', 'openaienc');
            if ($response === false) {
                $err = curl_error($ch);
                curl_close($ch);
                throw new \RuntimeException('cURL error: ' . $err);
            }
            curl_close($ch);

            $decoded = json_decode($response, true);
            if (isset($decoded['error'])) {
                throw new \RuntimeException('OpenAI error: ' . ($decoded['error']['message'] ?? 'unknown'));
            }

            if (isset($decoded["data"])) {
                // OpenAI preserves order: data[i] corresponds to input[i]
                foreach ($decoded["data"] as $row) {
                    $all[] = $row["embedding"] ?? [];
                }
            }
        }

        if (empty($all)) {
            throw new \RuntimeException('Embedding failed.');
        }

        return $all;
    }
}
