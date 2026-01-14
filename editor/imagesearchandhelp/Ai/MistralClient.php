<?php

namespace Ai;
require_once __DIR__.'/../../ai/logging/log_ai_request.php';

class MistralClient implements AiClientInterface
{
    private $apiKey;

    public function __construct($apiKey)
    {
        $this->apiKey = $apiKey;
        $this->actor = array('user_id'=>$_SESSION['toolkits_logon_username'],'workspace_id'=>$_SESSION['XAPI_PROXY']);
        //$this->sessionId = $_SESSION['token'];
        $this->sessionId = "token is busted";
    }


    public function chat(array $messages, array $options = [])
    {
        if(!isset($_SESSION['toolkits_logon_id'])) {
            die("Session ID not set");
        }

        $payload = [
            'model' => !empty($options['model']) ? $options['model'] : 'mistral-large-latest',
            'messages' => $messages,
            'temperature' => isset($options['temperature']) ? $options['temperature'] : 0.7,
            'max_tokens'  => isset($options['max_tokens'])  ? $options['max_tokens']  : 400,
        ];


        $ch = curl_init('https://api.mistral.ai/v1/chat/completions');
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
        log_ai_request($raw, 'genai', 'mistral');
        if ($raw === false) {
            $err = curl_error($ch);
            curl_close($ch);
            return ['ok' => false, 'error' => 'cURL error: ' . $err];
        }
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $json = json_decode($raw, true);
        if ($status < 200 || $status >= 300) {
            $msg = (isset($json['error']['message']) && $json['error']['message'] !== '')
                ? $json['error']['message']
                : ('HTTP ' . $status);
            return ['ok' => false, 'error' => $msg, 'raw' => $json];
        }
        $content = isset($json['choices'][0]['message']['content'])
            ? $json['choices'][0]['message']['content']
            : null;
        return ['ok' => true, 'content' => $content, 'raw' => $json];
    }
}