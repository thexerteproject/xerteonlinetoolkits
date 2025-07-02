<?php
//openai api master class
//file name must be $api . Api.php for example openaiApi.php when adding new api
//class name AiApi mandatory when adding new api

use rag\MistralRAG;

class openaiApi
{
    //constructor must be like this when adding new api
    function __construct(string $api) {
        global $xerte_toolkits_site;
        require_once (str_replace('\\', '/', __DIR__) . "/" . $api ."/load_preset_models.php");
        $this->preset_models = $openAI_preset_models;
        require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
        require_once (str_replace('\\', '/', __DIR__) . "/rag/BaseRAG.php");
        require_once (str_replace('\\', '/', __DIR__) . "/rag/MistralRAG.php");
    }
    //check if answer conforms to model
    private function clean_gpt_result($answer)
    {
        //TODO idea: if not correct drop until last closed xml and close rest manually?

        //TODO ensure answer contains no html and xml has no data fields aka remove spaces
        //IMPORTANT GPT really wants to add \n into answers
        $tmp = str_replace('\n', "", $answer);
        $tmp = preg_replace('/\s+/', ' ', $tmp);
        $tmp = str_replace('> <', "><", $tmp);
        return $tmp;
    }

    //general class for interactions with the openai API
    //this should only be called if the user passed all checks
   private function POST_OpenAi($prompt, $settings)
    {

        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openai_key;

        //add user supplied prompt to payload
        $settings["payload"]["messages"][max(sizeof($settings["payload"]["messages"]) - 1, 0)]["content"] = $prompt;
        $payload = json_encode($settings["payload"]);

        //start api interaction
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $settings["url"]);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json"]);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);

        $result = curl_exec($curl);

        curl_close($curl);


        $resultConform = $this->clean_gpt_result($result);
        $resultConform = json_decode($resultConform);

        if ($resultConform->error) {
            return (object)["status" => "error", "message" => "error on api call with type:" . $result->error->type];
        }
        //if (!$this->conform_to_model($resultConform)){
        //    return (object) ["status" => "error", "message" => "answer does not match model"];
        //}
        return $resultConform;
    }

    private function POST_OpenAi_Assistant($prompt, $settings)
    {
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openai_key;

        //add user supplied prompt to payload
        $settings["payload"]["thread"]["messages"][max(sizeof($settings["payload"]["thread"]["messages"])-1, 0)]["content"] = $prompt;
        $payload = json_encode($settings["payload"]);

        //start api interaction
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $settings["url"]);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "OpenAI-Beta: assistants=v2"]);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);

        $result = curl_exec($curl);
        curl_close($curl);

        $resultArray = json_decode($result, true); // Decode to array for easier handling
        if (isset($resultArray['id']) && isset($resultArray['thread_id'])) {
            $runId = $resultArray['id'];
            $threadId = $resultArray['thread_id'];
            $startTime = time();
            do {
                sleep(5); // Wait for 5 seconds before checking status
                $status = $this->GET_OpenAi_Run_Status($runId, $threadId);
                if (in_array($status, ['completed', 'failed', 'cancelled'])) {
                    break; // Exit loop if terminal status is reached
                }
            } while (time() - $startTime < 160); // Continue if less than 30 seconds have passed
            // Optionally handle timeout scenario here
        }

        if (in_array($status, ['completed'])) {
            // If run is completed, retrieve the last message
            $lastMessageContent = $this->GET_last_message_from_thread($threadId);
        }

        $resultConform = $this->clean_gpt_result($lastMessageContent);
        $resultConform = json_decode($resultConform);

        $thread = $this->deleteThread($threadId);

        if ($resultConform->error) {
            return (object) ["status" => "error", "message" => "error on api call with type:" . $result->error->type];
        }
        return $resultConform;
    }

    private function GET_OpenAi_Run_Status($runId, $threadId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openai_key;
        $url = "https://api.openai.com/v1/threads/$threadId/runs/$runId";
        //start api interaction

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "OpenAI-Beta: assistants=v2"]);

        $result = curl_exec($curl);
        curl_close($curl);

        $resultConform = $this->clean_gpt_result($result);
        $resultConform = json_decode($resultConform);

        $status = $resultConform->status;

        return $status;
    }

    private function GET_last_message_from_thread($threadId) {
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openai_key;
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
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openai_key;
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

    //generates prompt for openai from preset prompts and user input
    //todo maybe add some validation for missing fields?
    //to help with pinpointing wrong/missing front end fields
    private function generatePrompt($p, $type, $globalInstructions): string {
        $prompt = '';
        foreach ($this->preset_models->prompt_list[$type] as $prompt_part) {
            if ($p[$prompt_part] == null) {
                $prompt .= $prompt_part;
            } else {
                $prompt .= $p[$prompt_part];
            }
        }

        // Append global instructions at the end if not empty
        if (!empty($globalInstructions)) {
            // Join the array into a single string with a newline between instructions
            $globalInstructionsStr = implode("\n", $globalInstructions);
            $prompt .= "\n" . $globalInstructionsStr;
        }

        return $prompt;
    }

    private function prepareURL($uploadPath){
        $basePath = __DIR__ . '/../../'; // Moves up from ai -> editor -> xot
        $finalPath = realpath($basePath . $uploadPath);

        if ($finalPath === false) {
            throw new Exception("File does not exist: $finalPath");
        }

        return $finalPath;
    }

    private function cleanXmlCode($xmlString) {
        // Check if the string starts with ```xml and remove it
        if (strpos($xmlString, "```xml") === 0) {
            $xmlString = substr($xmlString, strlen("```xml"));
            $xmlString = ltrim($xmlString); // Trim any leading whitespace after ```xml
        }

        // Check if the string ends with ``` and remove it
        if (substr($xmlString, -3) === "```") {
            $xmlString = substr($xmlString, 0, -3);
            $xmlString = rtrim($xmlString); // Trim any trailing whitespace before ```
        }

        return $xmlString;
    }

    private function cleanJsonCode($jsonString) {
        // Check if the string starts with ```json and remove it
        if (strpos($jsonString, "```json") === 0) {
            $jsonString = substr($jsonString, strlen("```json"));
            $jsonString = ltrim($jsonString); // Trim any leading whitespace after ```json
        }

        // Check if the string ends with ``` and remove it
        if (substr($jsonString, -3) === "```") {
            $jsonString = substr($jsonString, 0, -3);
            $jsonString = rtrim($jsonString); // Trim any trailing whitespace before ```
        }

        return $jsonString;
    }

    //meant to remove citations which openAI assistant will automatically add between chinese brackets
    //These will break the xml if not cleaned out.
    function removeBracketsAndContent($text) {
        // Define the regex pattern to match the brackets and the content inside
        $pattern = '/【.*?】/u';
        // Use preg_replace to remove the matched patterns
        $cleanedText = preg_replace($pattern, '', $text);
        // Return the cleaned text
        return $cleanedText;
    }

    //public function must be ai_request($p, $type) when adding new api
    //todo Timo maybe change this to top level object and extend with api functions?
    public function ai_request($p, $type, $baseUrl, $globalInstructions, $useCorpus = false, $fileList = null, $restrictCorpusToLo = false)
    {
        if (is_null($this->preset_models->type_list[$type]) or $type == "") {
            return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
        }

        if ($this->xerte_toolkits_site->openai_key == "") {
            return (object) ["status" => "error", "message" => "there is no corresponding API key"];
        }

        $prompt = $this->generatePrompt($p, $type, $globalInstructions);

        if ($useCorpus || $fileList != null || $restrictCorpusToLo){
            $apiKey = $this->xerte_toolkits_site->mistralenc_key;
            $encodingDirectory = $this->prepareURL($baseUrl);
            $rag = new MistralRAG($apiKey, $encodingDirectory);
            if ($rag->isCorpusValid()){
                $promptReference = x_clean_input($p['subject']);

                if ($restrictCorpusToLo){
                    $fileList = [$encodingDirectory . '/preview.xml'];
                    $weights = [
                        'embedding_cosine' => 0.3,
                        'embedding_euclidean' => 0.2,
                        'tfidf_cosine' => 0.3,
                        'tfidf_euclidean' => 0.2
                    ];
                    $context = $rag->getWeightedContext($promptReference, $fileList, $weights, 25);
                }else{
                    $context = $rag->getWeightedContext($promptReference, $fileList, '', 5);
                }

                $new_messages = array(
                    array(
                        'role' => 'user',
                        'content' => 'Great job! That\'s a great example of what I need. Now, I want to send you the context of the learning object you are generating these XMLs for. Bear in mind, the context can take different forms: transcripts or text. In the future, please generate the xml based on the context I will provide.',
                    ),
                    array(
                        'role' => 'assistant',
                        'content' => 'Understood. I\'m happy to help you with your task. Please provide the current context of the learning object. I will keep in mind that for transcripts, I dont have to include the timestamps in my response unless otherwise specified. Once you do, we can proceed to generating new XML objects using the exact same structure I used in my previous message, this time taking the new context into account.',
                    ),
                    array(
                        'role' => 'user',
                        'content' => 'Ok. Remember, when you generate the new XML, it should do so with the context here in mind! I\'ve compiled the data for you here: [START OF CONTEXT]' . $context[0]['chunk'] . $context[1]['chunk'] . $context[2]['chunk'] . $context[3]['chunk'] . $context[4]['chunk'] . " [END OF CONTEXT]",
                    ),
                    array(
                        'role' => 'assistant',
                        'content' => 'Great! Now that we know the context of the sort of information I am working with, I can proceed with generating a new XML with the exact same XML structure as the first one I made, but with content adapted to the context. Please specify any of the other requirements for the XML, and I will return the XML directly with no additional commentary, so that you can immediately use my message as the XML.',
                    ),
                );

                if (isset($this->preset_models->type_list[$type]['payload']['assistant_id'])){
                    // Insert the new messages into the original $settings array
                    array_splice($this->preset_models->type_list[$type]['payload']['thread']['messages'], 2, 0, $new_messages);
                }else{
                    array_splice($this->preset_models->type_list[$type]['payload']['messages'], 2, 0, $new_messages);
                }
            }
        }

        $results = array();

        if (isset($this->preset_models->type_list[$type]['payload']['assistant_id'])) {
                $results[] = $this->POST_OpenAi_Assistant($prompt, $this->preset_models->type_list[$type]);
        }
        else {
            //Post using non-assistant chat completion endpoint
            $results[] = $this->POST_OpenAi($prompt, $this->preset_models->type_list[$type]);
        }


        $answer = "";
        $total_tokens_used = 0;
        //if status is set something went wrong
        foreach ($results as $result) {
            if ($result->status) {
                return $result;
            }
            $total_tokens_used += $result->usage->total_tokens;
            $answer = $answer . $result->choices[0]->message->content;
        }

        $answer = $this->removeBracketsAndContent($answer);
        $answer = $this->cleanXmlCode($answer);
        $answer = $this->cleanJsonCode($answer);
        $answer = preg_replace('/&(?!#\d+;|amp;|lt;|gt;|quot;|apos;)/', '&amp;', $answer);
        return $answer;
    }

}
