<?php
//openai api master class
//file name must be $api . Api.php for example openaiApi.php when adding new api
//class name AiApi mandatory when adding new api

require_once(dirname(__FILE__) . "/" . "BaseAiApi.php");

class openaiApi extends BaseAiApi
{
    protected function POST_request($prompt, $payload, $url, $type){
        $results = $this->POST_OpenAi_Assistant($prompt, $payload, $url);

        return $results;
    }

    protected function buildQueries(array $inputs): array
    {
        //todo remove
        return $this->safeExecute(function () use ($inputs){
            try {
                global $xerte_toolkits_site;
                $apiKey = $xerte_toolkits_site->openai_key;

                $payload = [
                    'model' => 'gpt-4o-mini',   // pick any model that supports Structured Outputs
                    'messages' => [
                        ['role' => 'developer', 'content' => <<<SYS
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
                            'name' => 'TwoQueries',
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'frequency_query' => ['type' => 'string'],
                                    'vector_query' => ['type' => 'string'],
                                ],
                                'required' => ['frequency_query', 'vector_query'],
                                'additionalProperties' => false,
                            ],
                            'strict' => false,
                        ],
                    ],
                ];


                $ch = curl_init('https://api.openai.com/v1/chat/completions');
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
                log_ai_request($resp, 'genai', 'openai');
                if ($resp === false) {
                    throw new \Exception('cURL error on create: ' . curl_error($ch));
                }

                $decoded = json_decode($resp, true, 512, JSON_THROW_ON_ERROR);



                if ($decoded['error'] ?? '') {
                    throw new \Exception('API error: ' . ($decoded['error']['type'] ?? '') . ' ' . ($decoded['error']['message'] ?? 'Unknown error'));
                }

                // Extract the generated JSON payload
                if (isset($decoded['choices'][0]['message']['content'])) {
                    // content is a JSON‐string with our two fields
                    $content = $decoded['choices'][0]['message']['content'];
                    $queries = json_decode(
                        $content,
                        true,
                        512,
                        JSON_THROW_ON_ERROR
                    );
                } else {
                    throw new \Exception('Unexpected response format: ' . $resp);
                }

                // Return the two queries
                return $queries;
            }
            finally {
                curl_close($ch);
            }
        });
    }

    protected function parseResponse($results): string
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

//    //general class for interactions with the openai API
//    //this should only be called if the user passed all checks
//   private function POST_OpenAi($prompt, $payload, $url)
//    {
//        global $xerte_toolkits_site;
//
//        $authorization = "Authorization: Bearer " . $xerte_toolkits_site->openai_key;
//
//        //add user supplied prompt to payload
//        $payload["messages"][max(sizeof($payload["messages"])-1, 0)]["content"] = $prompt;
//        $new_payload = json_encode($payload);
//
//		$payload_str = print_r($payload, true);
//		file_put_contents("./ai_payloads.txt", $payload_str, FILE_APPEND);
//        //start api interaction
//        $curl = curl_init();
//        curl_setopt($curl, CURLOPT_POST, 1);
//        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
//        curl_setopt($curl, CURLOPT_URL, $url);
//        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json"]);
//        curl_setopt($curl, CURLOPT_POSTFIELDS, $new_payload);
//
//        $result = curl_exec($curl);
//        log_ai_request($result, 'genai', 'openai', $this->actor, $this->sessionId);
//
//        curl_close($curl);
//
//
//        $resultConform = $this->clean_result($result);
//        $resultConform = json_decode($resultConform);
//
//        if ($resultConform->error) {
//            return (object)["status" => "error", "message" => "error on api call with type:" . $result->error->type];
//        }
//        //if (!$this->conform_to_model($resultConform)){
//        //    return (object) ["status" => "error", "message" => "answer does not match model"];
//        //}
//        return $resultConform;
//    }

    private function POST_OpenAi_Assistant($prompt, $payload, $url)
    {
        return $this->safeExecute(function () use ($prompt, $payload, $url) {
            global $xerte_toolkits_site;
            $authorization = "Authorization: Bearer " . $xerte_toolkits_site->openai_key;

            //add user supplied prompt to payload
            $payload['thread']["messages"][max(sizeof($payload["thread"]["messages"]) - 1, 0)]["content"] = $prompt;
            $new_payload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

            $payload_str = print_r($payload, true);
            file_put_contents("./ai_payloads.txt", $payload_str, FILE_APPEND);

            //start api interaction
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "OpenAI-Beta: assistants=v2"]);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $new_payload);

            $result = curl_exec($curl);
            curl_close($curl);

            $resultArray = json_decode($result, true);// Decode to array for easier handling
            if ($resultArray['error'] ?? '') {
                throw new \Exception('API error: ' . ($resultArray['error']['type'] ?? '') . ' ' . ($resultArray['error']['message'] ?? 'Unknown error'));
            }

            if (isset($resultArray['id']) && isset($resultArray['thread_id'])) {
                $runId = $resultArray['id'];
                $threadId = $resultArray['thread_id'];
                $startTime = time();
                //todo move to async function to free up server resources
                do {
                    sleep(5); // Wait for 5 seconds before checking status
                    $result = $this->GET_OpenAi_Run_Status($runId, $threadId);

                    $status = $result->status;

                    if (in_array($status, ['completed', 'failed', 'cancelled'])) {
                        break; // Exit loop if terminal status is reached
                    }
                } while (time() - $startTime < 160); // Continue if less than 30 seconds have passed
                // Optionally handle timeout scenario here
            }

            if (in_array($status, ['completed'])) {
                // If run is completed, retrieve the last message
                $lastMessageContent = $this->GET_last_message_from_thread($threadId);
                log_ai_request($result, 'genai', 'openaiassistant');
            }

            $resultConform = $this->clean_result($lastMessageContent);
            $resultConform = json_decode($resultConform);

            $thread = $this->deleteThread($threadId);

            return $resultConform;
        });
    }

    private function GET_OpenAi_Run_Status($runId, $threadId){
        global $xerte_toolkits_site;
        $authorization = "Authorization: Bearer " . $xerte_toolkits_site->openai_key;
        $url = "https://api.openai.com/v1/threads/$threadId/runs/$runId";
        //start api interaction

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "OpenAI-Beta: assistants=v2"]);

        $result = curl_exec($curl);
        curl_close($curl);

        $resultConform = $this->clean_result($result);
        $resultConform = json_decode($resultConform);

        return $resultConform;
    }

    private function GET_last_message_from_thread($threadId) {
        global $xerte_toolkits_site;
        $authorization = "Authorization: Bearer " . $xerte_toolkits_site->openai_key;
        $url = "https://api.openai.com/v1/threads/$threadId/messages";

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "OpenAI-Beta: assistants=v2"]);

        $result = curl_exec($curl);
        curl_close($curl);

        if (!$result) {
            return (object) ["status" => "error", "message" => "Failed to fetch messages"];
        }

        $messages = json_decode($result, true);
        if (isset($messages['data']) && count($messages['data']) > 0) {
            $lastMessage = $messages['data'][0]['content'][0]['text']['value'];
            $formattedResult = [
                "id" => "filler", // or a relevant ID
                "object" => "chat.completion",
                "created" => time(),
                "model" => "filler-model",
                "choices" => [
                    [
                        "index" => 0,
                        "message" => [
                            "role" => "assistant",
                            "content" => $lastMessage // Use the last message directly here
                        ],
                        "logprobs" => null,
                        "finish_reason" => "filler-reason"
                    ]
                ],
                "usage" => [
                    "prompt_tokens" => 1,
                    "completion_tokens" => 1,
                    "total_tokens" => 1
                ],
                "system_fingerprint" => null
            ];
        }else {
            return "error: no message found"; // Return error message if no data is found
        }
        $formattedResult = json_encode($formattedResult);
        return $formattedResult;
    }

    private function deleteThread($threadId){
        global $xerte_toolkits_site;
        $authorization = "Authorization: Bearer " . $xerte_toolkits_site->openai_key;
        $url = "https://api.openai.com/v1/threads/$threadId";
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: application/json",
            "OpenAI-Beta: assistants=v2"
        ]);

        // Specify that this is a DELETE request
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");

        $result = curl_exec($curl);
        if (curl_errno($curl)) {
            echo 'Error:' . curl_error($curl);
        }
        curl_close($curl);
        return $result;
    }

}
