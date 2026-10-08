<?php

namespace Ai;

require_once __DIR__ . '/../../ai/logging/log_ai_request.php';

class GeminiClient implements AiClientInterface
{
    private $apiKey;
    private $actor;
    private $sessionId;

    public function __construct($apiKey)
    {
        $this->apiKey = $apiKey;

        $this->actor = array(
            'user_id' => $_SESSION['toolkits_logon_username'],
            'workspace_id' => $_SESSION['XAPI_PROXY']
        );

        //$this->sessionId = $_SESSION['token'];
        $this->sessionId = "token is busted";
    }

    public function chat(array $messages, array $options = array())
    {
        if (!isset($_SESSION['toolkits_logon_id'])) {
            die("Session ID not set");
        }

        $converted = array();
        $systemInstructions = array();

        foreach ($messages as $m) {
            $role = isset($m['role'])
                ? $m['role']
                : 'user';

            $content = isset($m['content'])
                ? $m['content']
                : '';

            /*
             * Gemini accepts system instructions separately from the
             * conversation input.
             */
            if ($role === 'system') {
                $systemInstructions[] = (string)$content;
                continue;
            }

            /*
             * Convert the common user/assistant message structure into
             * Gemini Interactions API steps.
             */
            $converted[] = array(
                'type' => $role === 'assistant'
                    ? 'model_output'
                    : 'user_input',
                'content' => array(
                    array(
                        'type' => 'text',
                        'text' => (string)$content
                    )
                )
            );
        }

        $generationConfig = array(
            'max_output_tokens' => isset($options['max_tokens'])
                ? (int)$options['max_tokens']
                : 400
        );

        /*
         * Leave Gemini's default temperature unchanged unless the caller
         * explicitly supplies one.
         */
        if (isset($options['temperature'])) {
            $generationConfig['temperature'] =
                (float)$options['temperature'];
        }

        $payload = array(
            'model' => !empty($options['model'])
                ? $options['model']
                : 'gemini-3.6-flash',

            'input' => $converted,

            'generation_config' => $generationConfig,

            /*
             * The full conversation is supplied with each request, so
             * server-side interaction storage is not needed.
             */
            'store' => false
        );

        if (!empty($systemInstructions)) {
            $payload['system_instruction'] = implode(
                "\n\n",
                $systemInstructions
            );
        }

        $encodedPayload = json_encode(
            $payload,
            JSON_UNESCAPED_UNICODE
        );

        if ($encodedPayload === false) {
            return array(
                'ok' => false,
                'error' => 'Unable to encode Gemini request payload'
            );
        }

        $ch = curl_init(
            'https://generativelanguage.googleapis.com/v1beta/interactions'
        );

        curl_setopt_array(
            $ch,
            array(
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => array(
                    'x-goog-api-key: ' . $this->apiKey,
                    'Content-Type: application/json'
                ),
                CURLOPT_POSTFIELDS => $encodedPayload,
                CURLOPT_TIMEOUT => 60
            )
        );

        $raw = curl_exec($ch);

        log_ai_request(
            $raw,
            'genai',
            'gemini'
        );

        if ($raw === false) {
            $err = curl_error($ch);
            curl_close($ch);

            return array(
                'ok' => false,
                'error' => 'cURL error: ' . $err
            );
        }

        $status = (int)curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );

        curl_close($ch);

        $json = json_decode($raw, true);

        if (!is_array($json)) {
            return array(
                'ok' => false,
                'error' => 'Invalid JSON returned by Gemini',
                'raw' => $raw
            );
        }

        /*
         * Gemini HTTP errors generally contain:
         *
         * error.code
         * error.message
         * error.status
         */
        if ($status < 200 || $status >= 300) {
            $msg = isset($json['error']['message'])
                ? $json['error']['message']
                : 'HTTP ' . $status;

            return array(
                'ok' => false,
                'error' => $msg,
                'raw' => $json
            );
        }

        /*
         * Also check for a logical API error in case one is returned with
         * an otherwise successful HTTP status.
         */
        if (isset($json['error'])) {
            $msg = isset($json['error']['message'])
                ? $json['error']['message']
                : 'Unknown Gemini API error';

            return array(
                'ok' => false,
                'error' => $msg,
                'raw' => $json
            );
        }

        if (
            isset($json['status']) &&
            $json['status'] !== 'completed' &&
            $json['status'] !== 'incomplete'
        ) {
            return array(
                'ok' => false,
                'error' => 'Gemini interaction status: ' .
                    $json['status'],
                'raw' => $json
            );
        }

        /*
         * Gemini returns generated text inside:
         *
         * steps[n].type = model_output
         * steps[n].content[n].type = text
         * steps[n].content[n].text
         */
        $content = '';

        if (
            isset($json['steps']) &&
            is_array($json['steps'])
        ) {
            foreach ($json['steps'] as $step) {
                if (
                    !is_array($step) ||
                    !isset($step['type']) ||
                    $step['type'] !== 'model_output'
                ) {
                    continue;
                }

                if (
                    !isset($step['content']) ||
                    !is_array($step['content'])
                ) {
                    continue;
                }

                foreach ($step['content'] as $contentBlock) {
                    if (
                        is_array($contentBlock) &&
                        isset($contentBlock['type']) &&
                        $contentBlock['type'] === 'text' &&
                        isset($contentBlock['text'])
                    ) {
                        $content .= $contentBlock['text'];
                    }
                }
            }
        }

        if ($content === '') {
            $content = null;
        }

        return array(
            'ok' => true,
            'content' => $content,
            'raw' => $json
        );
    }
}