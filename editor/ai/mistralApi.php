<?php

class mistralApi extends BaseAiApi
{
    protected function POST_request($prompt, $payload, $url, $type) {
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->mistral_key;

        $payload["messages"][max(sizeof($payload["messages"])-1, 0)]["content"] = $prompt;
        $new_payload = json_encode($payload);
		
		$payload_str = print_r($payload, true);
		file_put_contents("./ai_payloads.txt", $payload_str, FILE_APPEND);

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", 'Accept: application/json']);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $new_payload);

        $result = curl_exec($curl);

        curl_close($curl);

        $resultConform = $this->clean_result($result);
        $resultConform = json_decode($resultConform);

        if ($resultConform->error) {
            return (object) ["status" => "error", "message" => "error on api call with type:" . $result->error->type];
        }
        //if (!$this->conform_to_model($resultConform)){
        //    return (object) ["status" => "error", "message" => "answer does not match model"];
        //}
        return $resultConform;
    }

    protected function buildQueries(array $inputs): array
    {
        $apiKey = $this->xerte_toolkits_site->mistral_key;
        // 1. Minimal payload
        $payload = [
            'model'  => 'mistral-small-latest',
            'messages'=> [
                [ 'role'=>'system', 'content'=><<<SYS
You are a query‐builder assistant.
Given user inputs (as JSON), output *strictly* a JSON object with two fields:
  • "frequency_query": a single query string for TF–IDF matching  
  • "vector_query":   a single query string for vector embedding similarity  
Do not wrap your response in any extra text.
SYS
                ],
                [ 'role'=>'user', 'content'=> json_encode($inputs, JSON_THROW_ON_ERROR) ]
            ],
            'response_format' => [
                'type'        => 'json_schema',    // ← corrected
                'json_schema' => [
                    'name'   => 'TwoQueries',        // ← required
                    'schema' => [
                        'type'                 => 'object',
                        'properties'           => [
                            'frequency_query'    => ['type'=>'string'],
                            'vector_query'       => ['type'=>'string'],
                        ],
                        'required'             => ['frequency_query','vector_query'],
                        'additionalProperties' => false,
                    ],
                    'strict' => false               // ← optional, but follows the examples
                ]
            ]
        ];

        // 2. Fire off with cURL
        $ch = curl_init('https://api.mistral.ai/v1/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey,
            ],
            CURLOPT_POSTFIELDS     => json_encode($payload, JSON_THROW_ON_ERROR),
        ]);

        $resp = curl_exec($ch);
        if ($resp === false) {
            throw new Exception('cURL error: ' . curl_error($ch));
        }
        curl_close($ch);

        // 3. Decode & return
        $decoded = json_decode($resp, true, 512, JSON_THROW_ON_ERROR);
        // If the model wrapped in a "choices" array, adjust accordingly:
        if (isset($decoded['choices'][0]['message']['content'])) {
            $decoded = json_decode($decoded['choices'][0]['message']['content'], true, 512, JSON_THROW_ON_ERROR);
        }
        return $decoded;
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
