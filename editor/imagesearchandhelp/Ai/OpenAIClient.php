<?php

namespace Ai;
use \Exception;
use \CURLFile;

class OpenAIClient implements AiClientInterface
{
    private $apiKey;


    public function __construct(string $apiKey)
    {
        $this->apiKey = $apiKey;
    }


    public function chat(array $messages, array $options = []): array
    {
        $payload = [
            'model' => !empty($options['model']) ? $options['model'] : 'gpt-4o-mini',
            'messages' => $messages,
            'max_tokens' => $options['max_tokens'] ?? 400,
            'temperature' => $options['temperature'] ?? 0.7,
        ];


        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json'
            ],
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_TIMEOUT => 60,
        ]);
        $raw = curl_exec($ch);
        if ($raw === false) {
            $err = curl_error($ch);
            curl_close($ch);
            return ['ok' => false, 'error' => 'cURL error: ' . $err];
        }
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $json = json_decode($raw, true);
        if ($status < 200 || $status >= 300) {
            $msg = $json['error']['message'] ?? ('HTTP ' . $status);
            return ['ok' => false, 'error' => $msg, 'raw' => $json];
        }
        $content = $json['choices'][0]['message']['content'] ?? null;
        return ['ok' => true, 'content' => $content, 'raw' => $json];
    }
}