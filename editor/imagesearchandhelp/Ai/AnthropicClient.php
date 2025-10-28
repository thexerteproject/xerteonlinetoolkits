<?php

namespace Ai;
use \Exception;
use \CURLFile;

require_once __DIR__.'/../../ai/logging/log_ai_request.php';
class AnthropicClient implements AiClientInterface
{
    private $apiKey;
    private array $actor;
    private string $sessionId;


    public function __construct(string $apiKey)
    {
        $this->apiKey = $apiKey;
        $this->actor = array('user_id'=>$_SESSION['toolkits_logon_username'],'workspace_id'=>$_SESSION['XAPI_PROXY']);
        //$this->sessionId = $_SESSION['token'];
        $this->sessionId = "token is busted";
    }


    public function chat(array $messages, array $options = []): array
    {
        if(!isset($_SESSION['toolkits_logon_id'])) {
            die("Session ID not set");
        }

        $converted = [];
        foreach ($messages as $m) {
            if ($m['role'] === 'system') {
        // Prepend system text to first user message
                $converted[] = [
                    'role' => 'user',
                    'content' => [[ 'type' => 'text', 'text' => $m['content'] ]]
                ];
            } else {
                $converted[] = [
                    'role' => $m['role'],
                    'content' => [[ 'type' => 'text', 'text' => $m['content'] ]]
                ];
            }
        }


        $payload = [
            'model' => !empty($options['model']) ? $options['model'] : 'claude-3-5-sonnet-20241022',
            'max_tokens' => $options['max_tokens'] ?? 400,
            'temperature' => $options['temperature'] ?? 0.7,
            'messages' => $converted,
        ];


        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'x-api-key: ' . $this->apiKey,
                'anthropic-version: 2023-06-01',
                'content-type: application/json'
            ],
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_TIMEOUT => 60,
        ]);
        $raw = curl_exec($ch);
        log_ai_request($raw, 'genai', 'anthropic', $this->actor, $this->sessionId);
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
        // Anthropic returns content as an array of blocks
        $content = $json['content'][0]['text'] ?? null;
        return ['ok' => true, 'content' => $content, 'raw' => $json];
    }
}