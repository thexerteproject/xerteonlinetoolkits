<?php
//openai api master class
//file name must be $api . Api.php for example openaiApi.php when adding new api
//class name AiApi mandatory when adding new api
class openaiApi
{
    //constructor must be like this when adding new api
    function __construct(string $api) {
        require_once (str_replace('\\', '/', __DIR__) . "/" . $api ."/load_preset_models.php");
        $this->preset_models = $openAI_preset_models;
        require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
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

        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;

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

    private function POST_OpenAi_Transcription($prompt, $settings, $uploadUrl)
    {

        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;

        //add user supplied prompt to payload
        $transcript = $this->transcribeAudioTimestamped($uploadUrl);
        //$transcript = $this->transcribeAudio($uploadUrl);
        $settings["payload"]["messages"][max(sizeof($settings["payload"]["messages"]) - 1, 0)]["content"] = $prompt;
        $settings["payload"]["messages"][max(sizeof($settings["payload"]["messages"]) - 1, 0)]["content"] .= "Use the following information as a source: " . $transcript;
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
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;

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
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
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
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
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

    //generates prompt for openai from preset prompts and user input
    //todo Timo rework to use wildcards
    private function generatePrompt($p, $type): string
    {
        $prompt = '';
        foreach ($this->preset_models->prompt_list[$type] as $prompt_part){
            if ($p[$prompt_part] == null){
                $prompt = $prompt . $prompt_part;
            } else {
                $prompt = $prompt . $p[$prompt_part];
            }
        }
        return $prompt;
    }

    private function fileUpload($finalPath){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $fileName = basename($finalPath);

        if (!file_exists($finalPath)) {
            echo "File does not exist: $finalPath";
            return;
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/files');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            $authorization,
            'Content-Type: multipart/form-data',
            //"OpenAI-Beta: assistants=v2"
        ]);

        // Define the POST fields, including the file in 'file' parameter
        // Use CURLFile for the file content, which effectively sends the file as a file object
        $curlFile = new CURLFile($finalPath, 'text/plain', $fileName);
        $postFields = ['file' => $curlFile, 'purpose' => 'assistants'];
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response !== false) {
            // Decode the JSON response into a PHP array
            $decodedResponse = json_decode($response, true);
            return $decodedResponse['id'];
        } else {
            // If cURL encountered an error
            $error = "cURL Error: " . curl_error($ch);
        }

    }
    //use to check if a vector storage is attached to an assistant
    private function vectorStorageAttached($assistantId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;

        $ch = curl_init('https://api.openai.com/v1/assistants/' . $assistantId);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            $authorization,
            'Content-Type: application/json',
            "OpenAI-Beta: assistants=v2"
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        $assistantData = json_decode($response, true);

        if (isset($assistantData['tools'])) {
            foreach ($assistantData['tools'] as $tool) {
                if ($tool['type'] === 'file_search' && isset($assistantData['tool_resources']['file_search']['vector_store_ids']) && !empty($assistantData['tool_resources']['file_search']['vector_store_ids'])) {
                    return $assistantData['tool_resources']['file_search']['vector_store_ids'][0];
                }
            }
        }

        return false;
    }

    private function createVectorStorage() {
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $ch = curl_init('https://api.openai.com/v1/vector_stores');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            $authorization,
            'Content-Type: application/json',
            "OpenAI-Beta: assistants=v2"
        ]);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'name' => 'learning_object_creation_supplement'
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        $vectorStorageData = json_decode($response, true);
        return $vectorStorageData['id'];
    }

    //Creates a vector store file by converting an uploaded file to vector storage, effectively "attaching" said file
    private function createVectorStoreFile($fileId, $vectorStorageId) {
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $ch = curl_init("https://api.openai.com/v1/vector_stores/$vectorStorageId/files");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            $authorization,
            'Content-Type: application/json',
            "OpenAI-Beta: assistants=v2"
        ]);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['file_id' => $fileId]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        return $response;
    }

    //updates existing assistant with new info on which storage to access
    private function attachStorageToAssistant($assistantId, $vectorStorageId) {
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $ch = curl_init("https://api.openai.com/v1/assistants/$assistantId");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            $authorization,
            'Content-Type: application/json',
            'OpenAI-Beta: assistants=v2'
        ]);
        curl_setopt($ch, CURLOPT_POST, 1); // Use POST method as per the API documentation
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'tool_resources' => [
                'file_search' => [
                    'vector_store_ids' => [$vectorStorageId]
                ]
            ]
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        return $response;
    }

    private function detachStorageFromAssistant($assistantId, $vectorStorageId) {
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;

        // Fetch the current tool_resources configuration
        $ch = curl_init("https://api.openai.com/v1/assistants/$assistantId");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            $authorization,
            'Content-Type: application/json',
            'OpenAI-Beta: assistants=v2'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $assistantData = json_decode($response, true);
        curl_close($ch);

        if (!isset($assistantData['tool_resources']['file_search']['vector_store_ids'])) {
            throw new Exception("Vector storage not found in assistant's tool resources.");
        }

        // Remove the vector_storage_id from the list
        $vectorStoreIds = $assistantData['tool_resources']['file_search']['vector_store_ids'];
        $vectorStoreIds = array_filter($vectorStoreIds, function($id) use ($vectorStorageId) {
            return $id !== $vectorStorageId;
        });

        // Update the assistant with the modified tool_resources
        $ch = curl_init("https://api.openai.com/v1/assistants/$assistantId");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            $authorization,
            'Content-Type: application/json',
            'OpenAI-Beta: assistants=v2'
        ]);
        curl_setopt($ch, CURLOPT_POST, 1); // Use POST method as per the API documentation
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'tool_resources' => [
                'file_search' => [
                    'vector_store_ids' => array_values($vectorStoreIds)
                ]
            ]
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        return $response;
    }

    private function deleteVectorStorage($vectorStorageId)
    {
        $url = "https://api.openai.com/v1/vector_stores/$vectorStorageId";
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: application/json",
            'OpenAI-Beta: assistants=v2'
        ]);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
        $result = curl_exec($curl);
        curl_close($curl);

        return $result;
    }

    private function attachFile ($fileId, $assistantId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url ="https://api.openai.com/v1/assistants/$assistantId/files";

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: application/json",
            "OpenAI-Beta: assistants=v2"
        ]);
        curl_setopt($curl, CURLOPT_POST, true);
        $postData = json_encode(['file_id' => $fileId]);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);
        $result = curl_exec($curl);
        if (curl_errno($curl)) {
            echo 'Error:' . curl_error($curl);
        }
        curl_close($curl);
        return $result;

    }

    // Delete a file from the specified assistant.
    private function detatchFile ($fileId, $assistantId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url ="https://api.openai.com/v1/assistants/$assistantId/files/$fileId";

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
    //Delete a file from the openAI storage in general. Note that this method doesn't remove the file from the assistant by default.
    private function deleteFile ($fileId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url = "https://api.openai.com/v1/files/$fileId";
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: application/json",
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

    private function deleteThread($threadId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
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

    private function transcribeAudio($filePath){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url = "https://api.openai.com/v1/audio/transcriptions";

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: multipart/form-data"
        ]);
        curl_setopt($curl, CURLOPT_POST, 1);

        // Prepare the file
        $basePath = __DIR__ . '/../../'; // Moves up from ai -> editor -> xot

        // Normalize the directory separators to the current operating system's preference
        $normalizedBasePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $basePath);

        // Append the $filePath to the normalized base path
        $finalPath = $normalizedBasePath . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $filePath);
        $finalPath = realpath($finalPath);

        $fileName = basename($finalPath);

        $cFile = new CURLFile($finalPath, 'audio/mpeg', $fileName);
        $postData = [
            'file' => $cFile,
            'model' => 'whisper-1',
            'response_format' => 'json' // Ensure response format is JSON for parsing
        ];

        curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);

        $result = curl_exec($curl);
        if (curl_errno($curl)) {
            echo 'Error:' . curl_error($curl);
        } else {
            // Parse the JSON response to extract the 'text' field
            $response = json_decode($result, true); // Decode as array
            if (isset($response['text'])) {
                $result = $response['text']; // Update $result to just the transcribed text
            } else {
                $result = 'Transcription failed or no text found.';
            }
        }
        curl_close($curl);
        return $this->removeSpecialCharacters($result); // Return just the transcribed text
    }
    private function prepareURL($uploadPath){
        $basePath = __DIR__ . '/../../'; // Moves up from ai -> editor -> xot
        $finalPath = realpath($basePath . $uploadPath);

        if ($finalPath === false) {
            throw new Exception("File does not exist: $finalPath");
        }

        return $finalPath;
    }
    private function transcribeAudioTimestamped($filePath){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url = "https://api.openai.com/v1/audio/transcriptions";

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: multipart/form-data"
        ]);
        curl_setopt($curl, CURLOPT_POST, 1);
        $fileName = basename($filePath);
        $cFile = new CURLFile($filePath, 'audio/mpeg', $fileName);

        // Specify the request for a verbose JSON response with segment timestamps
        $postData = [
            'file' => $cFile,
            'model' => 'whisper-1',
            'response_format' => 'verbose_json', // Ensure verbose JSON format for detailed timestamps
            'timestamp_granularities' => ['segment']
        ];

        $error=curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);

        $result = curl_exec($curl);
        if (curl_errno($curl)) {
            echo 'Error:' . curl_error($curl);
        } else {
            // Decode the JSON response to extract segments with their timestamps and text
            $response = json_decode($result, true); // Decode as array
            if(isset($response['segments'])) {
                $result = $this->formatSegmentsWithTimestamps($response['segments']);
            } else {
                $result = 'Transcription failed or no segments found.';
            }
        }
        curl_close($curl);
        return $result; // Return formatted string with timestamps and text
    }

    private function saveAsTextFile($transcript, $audioFilePath) {
        // Extract the directory path from the audio file path
        $directoryPath = dirname($audioFilePath);

        // Construct the path for the transcript file
        $transcriptFileName = 'transcription_result.txt';
        $transcriptFilePath = $directoryPath . '/' . $transcriptFileName;

        // Save the transcript to the constructed file path
        if (file_put_contents($transcriptFilePath, $transcript)) {
            return $transcriptFilePath;
        } else {
            return "Failed to save the transcript.";
        }
    }
    private function describeImage($filePath){
        // Read and encode the image in Base64
        $imageData = base64_encode(file_get_contents($filePath));

        // Prepare the authorization header
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;

        // Define the API URL
        $url = "https://api.openai.com/v1/chat/completions";

        // Prepare the payload with the Base64 image data
        $payload = json_encode([
            "model" => "gpt-4o-mini",
            "messages" => [
                [
                    "role" => "user",
                    "content" => [
                        [
                            "type" => "text",
                            "text" => "What’s in this image?"
                        ],
                        [
                            "type" => "image_url",
                            "image_url" => [
                                "url" => "data:image/jpeg;base64," . $imageData
                            ]
                        ]
                    ]
                ]
            ],
            "max_tokens" => 300
        ]);

        // Initialize cURL session
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: application/json"
        ]);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);

        // Execute the request and capture the response
        $result = curl_exec($curl);

        // Check if cURL executed without errors
        if ($result === false) {
            $error = curl_error($curl);
            curl_close($curl);
            throw new Exception("cURL Error: $error");
        }

        // Close cURL session
        curl_close($curl);

        // Decode the response and return only the description text
        $decodedResponse = json_decode($result, true);
        $descriptionOnly = $decodedResponse['choices'][0]['message']['content'] ?? null;

        return $descriptionOnly;
    }
    private function extractAudio($videoUrl) {
        // Generate a unique output file name
        $outputFileName = 'output_audio_' . uniqid() . '.mp3';
        $outputAudioPath = dirname($videoUrl) . '/' . $outputFileName;

        // Command to extract audio
        $command = "ffmpeg -i \"$videoUrl\" -q:a 0 -map a \"$outputAudioPath\" 2>&1";

        // Descriptor specification
        $descriptors = [
            0 => ["pipe", "r"],  // stdin
            1 => ["pipe", "w"],  // stdout
            2 => ["pipe", "w"]   // stderr
        ];

        // Open the process
        $process = proc_open($command, $descriptors, $pipes);

        if (is_resource($process)) {
            // Close the stdin pipe
            fclose($pipes[0]);

            // Initialize variables to store the output
            $stdout = '';
            $stderr = '';

            // Read stdout and stderr incrementally
            while (!feof($pipes[1]) || !feof($pipes[2])) {
                if (!feof($pipes[1])) {
                    $stdout .= fread($pipes[1], 1024);
                }
                if (!feof($pipes[2])) {
                    $stderr .= fread($pipes[2], 1024);
                }
            }

            // Close the stdout and stderr pipes
            fclose($pipes[1]);
            fclose($pipes[2]);

            // Get the return status
            $return_var = proc_close($process);

            // Debugging output
            if ($return_var != 0) {
                echo "FFmpeg Error:\n" . $stderr;
                throw new Exception("Error extracting audio from video. FFmpeg output:\n" . $stderr);
            }

            // Return the URL to the output audio file
            return $outputAudioPath;
        } else {
            throw new Exception("Could not open process for FFmpeg.");
        }
    }

    private function formatSegmentsWithTimestamps($segments) {
        $formattedText = '';
        foreach ($segments as $segment) {
            if (isset($segment['start'], $segment['end'], $segment['text'])) {
                $formattedText .= "S: {$segment['start']} E: {$segment['end']} Text: {$segment['text']}\n";
            }
        }
        return $this->removeSpecialCharacters($formattedText);
    }

    private function removeSpecialCharacters($string) {
        $charactersToRemove = array('"', "'", "/", "\\");
        $cleanedString = str_replace($charactersToRemove, '', $string);
        return $cleanedString;
    }

    private function deleteLocalFile($filePath) {
        if (file_exists($filePath)) {
            if (unlink($filePath)) {
                return "File deleted successfully.";
            } else {
                return "Error: Could not delete the file.";
            }
        } else {
            return "Error: File does not exist.";
        }
    }

    private function isUrl($input) {
        // Separate the file path and URL
        $pos = strpos($input, 'http');
        if ($pos === false) {
            return false;
        }
        $filePath = substr($input, 0, $pos - 1);
        $url = substr($input, $pos);
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    private function isSupportedUrl($url) {
        $parsedUrl = parse_url($url);
        $host = $parsedUrl['host'] ?? '';

        $supportedHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'video.dlearning.nl'];

        foreach ($supportedHosts as $supportedHost) {
            if (strpos($host, $supportedHost) !== false) {
                return true;
            }
        }

        return false;
    }

   private function custom_escapeshellarg($arg) {
        if (DIRECTORY_SEPARATOR == '\\') {
            // Windows
            return '"' . str_replace('"', '""', $arg) . '"';
        } else {
            // Unix-based
            return "'" . str_replace("'", "'\\''", $arg) . "'";
        }
    }


    private function downloadVideo($input) {
        // Regular expression to match the URL portion
        $pattern = '/(https?:\/\/\S+)/';

        // Check if a URL is present in the input
        if (preg_match($pattern, $input, $matches)) {
            $url = $matches[0]; // Extracted URL
            $filePath = str_replace($url, '', $input); // Remove the URL from the input
            $filePath = rtrim($filePath, '/'); // Trim any trailing slash that might be left
        }

        // Append /media to the file path
        $mediaPath = $this->prepareURL($filePath . '/media');
        //$mediaPath = $filePath . '/media';

            // Handle URL case
            if ($this->isSupportedUrl($url)) {
                // Create a unique filename for the downloaded audio
                $uniqueFilename = uniqid('video_', true) . '.mp4';
                $outputPath = $mediaPath . '/' . $uniqueFilename;
                // Prepare the yt-dlp command
                $command = ("yt-dlp -f best -o " . $this->custom_escapeshellarg($outputPath) . " " . $this->custom_escapeshellarg($url));
                _debug($command);
                // Execute the command
                $output = [];
                $returnVar = 0;
                exec($command, $output, $returnVar);

                // Check if the download was successful
                if ($returnVar !== 0) {
                    echo "Download failed:".$output;
                    throw new Exception("Failed to download: " . implode("\n", $output));
                }
                $pos = strpos($outputPath, 'USER-FILES');
                $relativePath = substr($outputPath, $pos);
                return $relativePath;
            } else {
                throw new Exception("Unsupported URL");
            }
    }

    private function stripXMLTagsFromFile($filePath, $contextScope) {
        // Load the XML from the file into DOMDocument
        $dom = new DOMDocument();
        if (!file_exists($filePath)) {
            return (object)["status" => "error", "message" => "error when locating data.xml file, checked file path:" . $filePath];
            //return "File not found!";
        }

        $dom->load($filePath, LIBXML_NOCDATA);
        if ($contextScope == "full"){
            // Traverse through the elements and extract text
            $textContent = $this->extractTextAndAttributes($dom->documentElement);
        } else {
            // Limit only nodes of the linkID in the scope and extract text
            $this->filterNodes($dom, $contextScope);
            $textContent = $this->extractTextAndAttributes($dom->documentElement);
        }
        return trim($textContent);
    }

    private function filterNodes(&$dom, $linkID) {
        if (empty($linkID)) {
            throw new InvalidArgumentException("The linkID parameter cannot be empty.");
        }

        $xpath = new DOMXPath($dom);

        // Find the node(s) with the specified linkID attribute
        $nodesToKeep = $xpath->query("//*[@linkID='" . $linkID . "']");

        if ($nodesToKeep->length === 0) {
            throw new InvalidArgumentException("No nodes found with the specified linkID: " . $linkID);
        }

        // Create a new DOMDocument to hold the filtered nodes
        $newDom = new DOMDocument();
        $newRoot = $newDom->createElement("root"); // Create a new root element
        $newDom->appendChild($newRoot);

        foreach ($nodesToKeep as $node) {
            // Import the node and its children into the new DOMDocument
            $importedNode = $newDom->importNode($node, true);
            $newRoot->appendChild($importedNode);
        }

        // Clear the original DOM and replace it with the filtered structure
        $dom->loadXML($newDom->saveXML());
    }

    private function extractTextAndAttributes($node, $parentTag = '') {
        $allowedAttributes = [
            'name', 'text', 'goals', 'audience', 'prereq', 'howto', 'summary', 'nextsteps', 'pageintro', 'tip', 'side1', 'side2', 'txt', 'instruction', 'prompt', 'answer', 'intro', 'feedback', 'unit', 'question', 'hint', 'label', 'passage', 'initialtext', 'initialtitle', 'suggestedtext', 'suggestedtitle', 'generalfeedback', 'instructions', 'p1', 'p2', 'title', 'introduction', 'wrongtext', 'wordanswer', 'words', 'url', 'targetnew', 'linkid',
        ];

        $text = "";

        // If the node is an element node, add the tag name and attributes
        if ($node->nodeType == XML_ELEMENT_NODE) {
            $text .= ucfirst($node->nodeName) . ": ";

            // If the node has attributes, add them to the text
            if ($node->hasAttributes()) {
                foreach ($node->attributes as $attr) {
                    if(in_array(strtolower($attr->name), $allowedAttributes)){
                        $text .= ucfirst($attr->name) . " = '" . $attr->value . "' ";
                    }
                }
            }
            $text .= "\n"; // New line after attributes
        }

        // If the node has text content, add it to the text
        if ($node->nodeType == XML_TEXT_NODE || $node->nodeType == XML_CDATA_SECTION_NODE) {
            // Trim to avoid extra newlines for empty text nodes
            $text .= trim($node->nodeValue) . "\n";
        }

        // If the node has child elements, recursively extract their text and attributes
        if ($node->hasChildNodes()) {
            foreach ($node->childNodes as $child) {
                $text .= $this->extractTextAndAttributes($child, $node->nodeName); // Recursive call
            }
        }

        return $text;
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
    public function ai_request($p, $type, $uploadUrl, $textSnippet, $baseUrl, $useContext, $contextScope, $modelTemplate)
    {
        if (is_null($this->preset_models->type_list[$type]) or $type == "") {
            return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
        }

        if ($this->xerte_toolkits_site->openAI_key == "") {
            return (object) ["status" => "error", "message" => "there is no corresponding API key"];
        }

        $prompt = $this->generatePrompt($p, $type);

        //if useContext is on, prepare the messages to be spliced into the array, including the filtered xml
        if ($useContext=='true') {
            $baseUrl = rtrim($baseUrl, '/'); // Trim any trailing slash that might be left
            $xmlLoc = $this->prepareURL($baseUrl . "/data.xml");

            $data = $this->stripXMLTagsFromFile($xmlLoc, $contextScope, $type);

            $new_messages = array(
                array(
                    'role' => 'user',
                    'content' => 'Great job! That\'s a great example of what I need. Now, I am going to send you the context of the learning object you are generating these XMLs for. In the future, please generate the learning object based on what is already in the provided context',
                ),
                array(
                    'role' => 'assistant',
                    'content' => 'Understood. I\'m happy to help you with your task. Please provide the current context of the learning object. Once you do, we can proceed to generating new XML objects using the exact same structure I used in my previous message, this time taking the new context into account.',
                ),
                array(
                    'role' => 'user',
                    'content' => 'Ok. Remember, when you generate the new XML, it should do so with the context here in mind! I\'ve gathered the data from the other xml elements in the document for you. Here it is:' . $data,
                ),
                array(
                    'role' => 'assistant',
                    'content' => 'Great! Now that we know the context of the whole learning object better, I can proceed with generating a new XML with the exact same XML structure as the first one I made, but with content adapted to the context. Please specify any of the other requirements for the XML, and I will return the XML directly with no additional commentary, so that you can immediately use my message as the XML.',
                ),
            );

            if (isset($this->preset_models->type_list[$type]['payload']['assistant_id'])){
                // Insert the new messages into the original $settings array
                array_splice($this->preset_models->type_list[$type]['payload']['thread']['messages'], 2, 0, $new_messages);
            }else{
                array_splice($this->preset_models->type_list[$type]['payload']['messages'], 2, 0, $new_messages);
            }
        }


        $results = array();

       /* $block_size = 6;
        if (in_array($type, $this->preset_models->multi_run) and isset($p['nrq']) and $p['nrq'] > $block_size){

            $nrq_remaining = $p['nrq'];

            while ($nrq_remaining > $block_size) {
                $prompt = preg_replace('/'.$p['nrq'].'/', strval($block_size), $prompt, 1);

                $results[] = $this->POST_OpenAi($prompt, $this->preset_models->type_list[$type]);
                $tempxml = simplexml_load_string(end($results)->choices[0]->message->content);
                foreach ($tempxml->children() as $child){
                    $prompt = $prompt . $child->attributes()->prompt . " ; ";
                }

                $nrq_remaining = $nrq_remaining - $block_size;
            }
            $prompt = preg_replace('/'.strval($block_size).'/', strval($nrq_remaining), $prompt, 1);
        }*/

        $linkSource = $this->isUrl($uploadUrl);

        if (($uploadUrl!=null) || ($textSnippet!=null)){
            if ($linkSource){
                try {
                    $uploadUrl = $this->downloadVideo($uploadUrl);
                } catch (Exception $e) {
                    // Store exception
                    $errorUpload = $e->getMessage();
                }
            }


            $videoMimeTypes = ['video/mp4', 'video/avi', 'video/mpeg', 'video/quicktime', 'application/octet-stream'];
            $audioMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
            $imageMimeTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/bmp',
                'image/tiff',
                'image/svg+xml',
                'image/x-icon', // for .ico files
                'application/octet-stream' // occasionally used for binary image uploads
            ];
            $textMimeTypes = [
                'application/pdf',          // PDF
                'text/plain',               // TXT
                'application/msword',       // DOC
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
                'application/rtf',          // RTF
                'application/vnd.oasis.opendocument.text', // ODT
                'application/vnd.ms-excel', // XLS
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
                'text/csv',                 // CSV
                'application/vnd.ms-powerpoint', // PPT
                'application/vnd.openxmlformats-officedocument.presentationml.presentation' // PPTX
            ];

            if ($textSnippet != null) {
                $baseUrl = rtrim($baseUrl, '/'); // Trim any trailing slash that might be left
                // Define the file name and path
                $fileNameSnippet = "snippetFile.txt";
                $filePathSnippet = $this->prepareURL($baseUrl . '/media');
                $finalPathSnippet = $filePathSnippet . '/' . $fileNameSnippet;
                $filePath = $finalPathSnippet;
                file_put_contents($finalPathSnippet, $textSnippet);
            } else {
                $filePath = $this->prepareURL($uploadUrl);
            }


            // Get MIME type of the file
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            //$mimeType = finfo_file($finfo, $filePath);
            $mimeType = mime_content_type($filePath);
            finfo_close($finfo);

            // Check against each category
            if (in_array($mimeType, $videoMimeTypes)) {
                // If it's a video file
                $extractedAudio = $this->extractAudio($filePath);
                if (isset($this->preset_models->type_list[$type]['payload']['assistant_id'])) {
                    // assistant_id exists, meaning we're dealing with an assistant request which can but doesn't have to include a file upload
                    $transcription = $this->saveAsTextFile($this->transcribeAudioTimestamped($extractedAudio),$extractedAudio);
                    if($transcription!=null){
                        $fileId = "";
                        $fileId = $this->fileUpload($transcription);
                        if ($fileId!=""){
                            if (!$this->vectorStorageAttached($this->preset_models->type_list[$type]['payload']['assistant_id'])){
                                $vectorStorageId = $this->createVectorStorage();
                                $deleteVectorStorage = true; //if a vector storage is created, this signifies it should be deleted
                            }
                            else
                            {
                                $vectorStorageId = $this->vectorStorageAttached($this->preset_models->type_list[$type]['payload']['assistant_id']);
                                $deleteVectorStorage = false; //if a vector storage already exists, this signifies to only delete the uploaded file and to not tamper with the rest
                            }
                            $vectorFileId = $this->createVectorStoreFile($fileId, $vectorStorageId);
                            $this->attachStorageToAssistant($this->preset_models->type_list[$type]['payload']['assistant_id'], $vectorStorageId);
                        }
                    }
                    $results[] = $this->POST_OpenAi_Assistant($prompt, $this->preset_models->type_list[$type]);
                    if ($fileId!=""){
                        if ($deleteVectorStorage){
                            $detatchment = $this->detachStorageFromAssistant($this->preset_models->type_list[$type]['payload']['assistant_id'], $vectorStorageId);
                            $deletion = $this->deleteVectorStorage($vectorStorageId);
                        }
                        $delete = $this->deleteFile($fileId);
                        $deletelocal = $this->deleteLocalFile($transcription);
                        if ($linkSource){
                        $deletelocal = $this->deleteLocalFile($filePath);
                        }
                    }
                }
                else{ //this is a redundancy left if we don't want to use the openAI assistant.\
                    //If the payload doesn't use it, we instead default to supplying the transcript with the prompt instead of as an uploaded file
                    $results[]=$this->POST_OpenAi_Transcription($prompt, $this->preset_models->type_list[$type], $extractedAudio);
                }
                $deletedAudio = $this->deleteLocalFile($extractedAudio);
            } elseif (in_array($mimeType, $audioMimeTypes)) {
                if (isset($this->preset_models->type_list[$type]['payload']['assistant_id'])) {
                    // assistant_id exists, meaning we're dealing with an assistant request which can but doesn't have to include a file upload
                    $transcription = $this->saveAsTextFile($this->transcribeAudioTimestamped($filePath),$filePath);
                    if($transcription!=null){
                        $fileId = "";
                        $fileId = $this->fileUpload($transcription);
                        if ($fileId!=""){
                            if (!$this->vectorStorageAttached($this->preset_models->type_list[$type]['payload']['assistant_id'])){
                                $vectorStorageId = $this->createVectorStorage();
                                $deleteVectorStorage = true; //if a vector storage is created, this signifies it should be deleted
                            }
                            else
                            {
                                $vectorStorageId = $this->vectorStorageAttached($this->preset_models->type_list[$type]['payload']['assistant_id']);
                                $deleteVectorStorage = false; //if a vector storage already exists, this signifies to only delete the uploaded file and to not tamper with the rest
                            }
                            $vectorFileId = $this->createVectorStoreFile($fileId, $vectorStorageId);
                            $this->attachStorageToAssistant($this->preset_models->type_list[$type]['payload']['assistant_id'], $vectorStorageId);
                        }
                    }
                    $results[] = $this->POST_OpenAi_Assistant($prompt, $this->preset_models->type_list[$type]);
                    if ($fileId!=""){
                        if ($deleteVectorStorage){
                            $detatchment = $this->detachStorageFromAssistant($this->preset_models->type_list[$type]['payload']['assistant_id'], $vectorStorageId);
                            $deletion = $this->deleteVectorStorage($vectorStorageId);
                        }
                        $delete = $this->deleteFile($fileId);
                        $deletelocal = $this->deleteLocalFile($transcription);
                    }
                }
                else{ //this is a redundancy left if we don't want to use the openAI assistant.\
                    //If the payload doesn't use it, we instead default to supplying the transcript with the prompt instead of as an uploaded file
                    $results[]=$this->POST_OpenAi_Transcription($prompt, $this->preset_models->type_list[$type], $filePath);
                }
                // Add code for handling audio files here
            } elseif (in_array($mimeType, $textMimeTypes)) {
                if (isset($this->preset_models->type_list[$type]['payload']['assistant_id'])) {
                    // assistant_id exists, meaning we're dealing with an assistant request which can but doesn't have to include a file upload
                        $fileId = "";
                        $fileId = $this->fileUpload($filePath);
                        if ($fileId!=""){
                            $attachedVectorStore = $this->vectorStorageAttached($this->preset_models->type_list[$type]['payload']['assistant_id']);
                            if ($attachedVectorStore === false){
                                $vectorStorageId = $this->createVectorStorage();
                                $deleteVectorStorage = true; //if a vector storage is created, this signifies it should be deleted
                            }
                            else
                            {
                                $vectorStorageId = $attachedVectorStore;
                                $deleteVectorStorage = false; //if a vector storage already exists, this signifies to only delete the uploaded file and to not tamper with the rest
                            }
                            $vectorFileId = $this->createVectorStoreFile($fileId, $vectorStorageId);
                            $this->attachStorageToAssistant($this->preset_models->type_list[$type]['payload']['assistant_id'], $vectorStorageId);
                        }
                    $results[] = $this->POST_OpenAi_Assistant($prompt, $this->preset_models->type_list[$type]);
                    if ($fileId!=""){
                        if ($deleteVectorStorage){
                            $detatchment = $this->detachStorageFromAssistant($this->preset_models->type_list[$type]['payload']['assistant_id'], $vectorStorageId);
                            $deletion = $this->deleteVectorStorage($vectorStorageId);
                        }
                        $delete = $this->deleteFile($fileId);
                    }
                    if ($textSnippet!=null){
                        $deleteLocal = $this->deleteLocalFile($finalPathSnippet );
                    }
                }
            } elseif (in_array($mimeType, $imageMimeTypes)) {
                // If it's an image file, we: 1. Get description. 2. Add description to prompt. 3. In pages such as text page, request description, otherwise use as context.
                $imageDescription = $this->describeImage($filePath);
                $prompt = $prompt . " The following is a description of an image I am using as a source for this content. Please make use of the image description as CONTENT when creating the xml: [IMAGE DESCRIPTION: START]\n" . $imageDescription . "\n [IMAGE DESCRIPTION: END]";
                $results[] = $this->POST_OpenAi_Assistant($prompt, $this->preset_models->type_list[$type]);
            } else {
                // If the file does not fit any of the above categories
                $results[]=["status" => "error", "message" => "The file type is not supported."];
            }

        }
        elseif (isset($this->preset_models->type_list[$type]['payload']['assistant_id'])) {
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
        #move to frontend or change it here -> this is for things that generate children, need options for 1) not generating and 2) for both top level + generating
        //$answer = str_replace(["<". $type .">", "</". $type .">"], "", $answer);

        //todo change if lop level is changed
        //return "<". $type ." >" . $answer. "</". $type .">";
        $answer = $this->removeBracketsAndContent($answer);
        $answer = $this->cleanXmlCode($answer);
        $answer = $this->cleanJsonCode($answer);
        $answer = preg_replace('/&(?!#\d+;|amp;|lt;|gt;|quot;|apos;)/', '&amp;', $answer);
        return $answer;
    }

}
