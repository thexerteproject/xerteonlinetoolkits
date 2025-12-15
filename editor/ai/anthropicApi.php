<?php

require_once(dirname(__FILE__) . "/" . "BaseAiApi.php");

class anthropicApi extends BaseAiApi
{
    protected function POST_request($prompt, $payload, $url, $type) {
        //todo remove safeExecute
        return $this->safeExecute(function () use ($prompt, $payload, $url, $type){

        global $xerte_toolkits_site;
        $authorization = "x-api-key: " . $xerte_toolkits_site->anthropic_key;

        $payload["messages"][max(sizeof($payload["messages"])-1, 0)]["content"] = $prompt;
            $flags = JSON_UNESCAPED_UNICODE;

            if (defined('JSON_INVALID_UTF8_SUBSTITUTE')) {
                // PHP  >= 7.2: use native flag
                $flags |= JSON_INVALID_UTF8_SUBSTITUTE;
                $new_payload = json_encode($payload, $flags);
            } else {
                // PHP 5.6: emulate SUBSTITUTE by cleaning strings first
                $cleanPayload = $this->json_utf8_substitute($payload);
                $new_payload  = json_encode($cleanPayload, $flags);
            }


        $curl = curl_init();
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "anthropic-version: 2023-06-01"]);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $new_payload);

        $result = curl_exec($curl);

        curl_close($curl);

        log_ai_request($result, 'genai', 'anthropic');

        $resultConform = $this->clean_result($result);
        $resultConform = json_decode($resultConform);

        if ($resultConform->type=="error") {
            $message = 'Unknown error';
            if (isset($resultConform->error) && isset($resultConform->error->message)) {
                $message = $resultConform->error->message;
            }
            throw new \Exception('API error: ' . $message);
        }

        return $resultConform;
        });
    }

    protected function parseResponse($results)
    {
        $answer = "";
        foreach ($results as $result) {
            if ($result->status) {
                return $result;
            }
            $answer = $answer . $result->content[0]->text;
        }
        return $answer;
    }

    protected function extract_json_object($text)
    {
        // Find the first "{" and last "}"
        $start = strpos($text, '{');
        $end   = strrpos($text, '}');

        if ($start === false || $end === false || $end < $start) {
            return null; // No JSON found
        }

        // Extract substring containing the JSON
        $json = substr($text, $start, $end - $start + 1);

        return trim($json);
    }

    protected function buildQueries(array $inputs)
    {
        //todo remove
        return $this->safeExecute(function () use ($inputs) {
            global $xerte_toolkits_site;
            $apiKey = $xerte_toolkits_site->anthropic_key;

            $payload = [
                'model' => 'claude-haiku-4-5-20251001',
                'max_tokens' => 4096,
                'messages' => [
                    ['role' => 'user', 'content' => <<<SYS
You are a query‐builder assistant.
Given my inputs (as JSON), output *strictly* a JSON object with two fields:
  • "frequency_query": a single query string for TF–IDF matching
  • "vector_query":   a single query string for vector embedding similarity
Do not wrap your response in any extra text, and do not add any extra text outside the brackets.
SYS
                    ],
                    ['role' => 'assistant', 'content' => 'Understood. Which inputs would you like me to process first?'],
                    ['role' => 'user', 'content' => json_encode($inputs)],
                ],
            ];

            $ch = curl_init('https://api.anthropic.com/v1/messages');
            try {
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST => true,
                    CURLOPT_HTTPHEADER => [
                        'Content-Type: application/json',
                        'x-api-key: ' . $apiKey,
                        'anthropic-version: 2023-06-01',
                    ],
                    CURLOPT_POSTFIELDS => json_encode($payload),
                ]);

                $resp = curl_exec($ch);
                log_ai_request($resp, 'genai', 'anthropic');

                if ($resp === false) {
                    throw new \Exception('cURL error: ' . curl_error($ch));
                }

                $decoded = json_decode($resp, true, 512);

                if ((isset($decoded['type']) ? $decoded['type'] : '') === 'error') {
                    $message = isset($decoded['error']['message'])
                        ? $decoded['error']['message']
                        : 'Unknown error';
                    throw new \Exception('API error: ' . $message);
                }

                if (isset($decoded['content'][0]['text'])) {
                    $decoded = $this->extract_json_object($this->total_clean_machine($decoded['content'][0]['text']));
                    $decoded = json_decode($decoded, true, 512);
                }

                return $decoded;
            } finally {
                curl_close($ch);
            }
        });
    }
}
