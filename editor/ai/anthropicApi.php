<?php

class anthropicApi extends BaseAiApi
{
    protected function POST_request($prompt, $payload, $url, $type) {
        $authorization = "x-api-key: " . $this->xerte_toolkits_site->anthropic_key;

        $payload["messages"][max(sizeof($payload["messages"])-1, 0)]["content"] = $prompt;
        $new_payload = json_encode($payload);
		
		$payload_str = print_r($payload, true);
		file_put_contents("./ai_payloads.txt", $payload_str, FILE_APPEND);

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "anthropic-version: 2023-06-01"]);
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

    protected function parseResponse($results)
    {
        $answer = "";
        foreach ($results as $result) {
            if ($result->status) {
                return $result;
            }
            //todo change to work for anthropic method
            $answer = $answer . $result->content[0]->text;
        }
        return $answer;
    }

    protected function buildQueries(array $inputs): array
    {
        $apiKey = $this->xerte_toolkits_site->anthropic_key;
        // 1. Minimal payload
        $payload = [
            'model'  => 'claude-3-5-sonnet-20241022',
            'max_tokens' => 4096,
            'messages'=> [
                [ 'role'=>'user', 'content'=><<<SYS
You are a query‐builder assistant.
Given my inputs (as JSON), output *strictly* a JSON object with two fields:
  • "frequency_query": a single query string for TF–IDF matching  
  • "vector_query":   a single query string for vector embedding similarity  
Do not wrap your response in any extra text.
SYS
                ],
                [ 'role'=>'assistant', 'content'=> 'Understood. Which inputs would you like me to process first?' ],
                [ 'role'=>'user', 'content'=> json_encode($inputs, JSON_THROW_ON_ERROR) ]
            ]
        ];

        // 2. Fire off with cURL
        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'x-api-key: ' . $apiKey,
                'anthropic-version: 2023-06-01'
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
        if (isset($decoded['content'][0]['text'])) {
            $decoded = json_decode($decoded['content'][0]['text'], true, 512, JSON_THROW_ON_ERROR);
        }
        return $decoded;
    }
}
