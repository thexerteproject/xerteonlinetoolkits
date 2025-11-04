<?php

require_once(dirname(__FILE__) . "/" . "BaseAiApi.php");

class mistralApi extends BaseAiApi
{
    protected function POST_request($prompt, $payload, $url, $type)
    {
        //todo remove
        return $this->safeExecute(function () use ($prompt, $payload, $url, $type) {
            global $xerte_toolkits_site;
            $authorization = "Authorization: Bearer " . $xerte_toolkits_site->mistral_key;

            $payload["messages"][max(sizeof($payload["messages"]) - 1, 0)]["content"] = $prompt;
            $new_payload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", 'Accept: application/json']);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $new_payload);

            $result = curl_exec($curl);
            curl_close($curl);

            log_ai_request($result, 'genai', 'mistral');

            $resultConform = $this->clean_result($result);
            $resultConform = json_decode($resultConform);

            if (isset($resultConform->detail)) {
                $message = is_string($resultConform->detail)
                    ? $resultConform->detail
                    : json_encode($resultConform->detail); // just in case it's structured
                throw new Exception('API error: ' . $message);
            }
            return $resultConform;
        });
    }

    protected function buildQueries(array $inputs): array
    {
        return $this->safeExecute(function () use ($inputs) {
            try {
                global $xerte_toolkits_site;
                $apiKey = $xerte_toolkits_site->mistral_key;

                $payload = [
                    'model' => 'mistral-small-latest',
                    'messages' => [
                        ['role' => 'system', 'content' => <<<SYS
You are a query‐builder assistant.
Given user inputs (as JSON), output *strictly* a JSON object with two fields:
  • "frequency_query": a single query string for TF–IDF matching  
  • "vector_query":   a single query string for vector embedding similarity  
Do not wrap your response in any extra text.
SYS
                        ],
                        ['role' => 'user', 'content' => json_encode($inputs, JSON_THROW_ON_ERROR)]
                    ],
                    'response_format' => [
                        'type' => 'json_schema',
                        'json_schema' => [
                            'name' => 'TwoQueries',        // required
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'frequency_query' => ['type' => 'string'],
                                    'vector_query' => ['type' => 'string'],
                                ],
                                'required' => ['frequency_query', 'vector_query'],
                                'additionalProperties' => false,
                            ],
                            'strict' => false               // optional, but follows the doc examples
                        ]
                    ]
                ];

                $ch = curl_init('https://api.mistral.ai/v1/chat/completions');
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST => true,
                    CURLOPT_HTTPHEADER => [
                        'Content-Type: application/json',
                        'Authorization: Bearer ' . $apiKey,
                    ],
                    CURLOPT_POSTFIELDS => json_encode($payload, JSON_THROW_ON_ERROR),
                ]);

                $resp = curl_exec($ch);
                log_ai_request($resp, 'genai', 'mistral');

                if ($resp === false) {
                    throw new Exception('cURL error: ' . curl_error($ch));
                }

                $decoded = json_decode($resp, true, 512, JSON_THROW_ON_ERROR);

                if (isset($decoded['detail'])) {
                    $message = is_string($decoded['detail'])
                        ? $decoded['detail']
                        : json_encode($decoded['detail']); // just in case it's structured
                    throw new Exception('API error: ' . $message);
                }

                // If the model wrapped in a "choices" array, adjust accordingly:
                if (isset($decoded['choices'][0]['message']['content'])) {
                    $decoded = json_decode($decoded['choices'][0]['message']['content'], true, 512, JSON_THROW_ON_ERROR);
                }
                return $decoded;
            } finally {
                curl_close($ch);
            }
        });
    }


    protected function parseResponse($results) : string
    {
        $answer = "";
        foreach ($results as $result) {
            // Ensure choices exist and contain at least one response
            if (isset($result->choices) && is_array($result->choices) && count($result->choices) > 0) {
                $choice = $result->choices[0];

                // Concatenate content in case of streaming or partial responses
                $answer .= $choice->message->content;
            }
        }
        return $answer;
    }
}
