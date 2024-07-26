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
        //if (!$this->conform_to_model($resultConform)){
        //    return (object) ["status" => "error", "message" => "answer does not match model"];
        //}
        return $resultConform;
    }

    private function GET_OpenAi_Run_Status($runId, $threadId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url = "https://api.openai.com/v1/threads/$threadId/runs/$runId";
        //start api interaction

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "OpenAI-Beta: assistants=v1"]);

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
            //"OpenAI-Beta: assistants=v1"
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
            "OpenAI-Beta: assistants=v1"
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
            "OpenAI-Beta: assistants=v1"
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
            "OpenAI-Beta: assistants=v1"
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
        $normalizedBasePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $basePath);
        $finalPath = $normalizedBasePath . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $uploadPath);
        $finalPath = realpath($finalPath);

        if ($uploadPath === false) {
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
        $transcriptFilePath = $directoryPath . DIRECTORY_SEPARATOR . $transcriptFileName;

        // Save the transcript to the constructed file path
        if (file_put_contents($transcriptFilePath, $transcript)) {
            return $transcriptFilePath;
        } else {
            return "Failed to save the transcript.";
        }
    }

    private function extractAudio($videoUrl) {
        // Generate a unique output file name
        $outputFileName = 'output_audio_' . uniqid() . '.mp3';
        $outputAudioPath = dirname($videoUrl) . DIRECTORY_SEPARATOR . $outputFileName;

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

    private function downloadVideo($input) {
        // Separate the file path and URL
        // Separate the file path and URL
        $pos = strpos($input, 'http');
        if ($pos === false) {
            throw new Exception("Invalid input format");
        }

        $filePath = substr($input, 0, $pos - 1);
        $url = substr($input, $pos);

        // Append /media to the file path
        $mediaPath = $this->prepareURL($filePath . '/media');

            // Handle URL case
            if ($this->isSupportedUrl($url)) {
                // Create a unique filename for the downloaded audio
                $uniqueFilename = uniqid('video_', true) . '.mp4';
                $outputPath = $mediaPath . DIRECTORY_SEPARATOR . $uniqueFilename;

                // Prepare the yt-dlp command
                $command = escapeshellcmd("yt-dlp -f best -o " . escapeshellarg($outputPath) . " " . escapeshellarg($url));

                // Execute the command
                $output = [];
                $returnVar = 0;
                exec($command, $output, $returnVar);

                // Check if the download was successful
                if ($returnVar !== 0) {
                    throw new Exception("Failed to download: " . implode("\n", $output));
                }
                $pos = strpos($outputPath, 'USER-FILES');
                $relativePath = substr($outputPath, $pos);
                return $relativePath;
            } else {
                throw new Exception("Unsupported URL");
            }
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
    public function ai_request($p, $type, $uploadUrl)
    {
        if (is_null($this->preset_models->type_list[$type]) or $type == "") {
            return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
        }

        if ($this->xerte_toolkits_site->openAI_key == "") {
            return (object) ["status" => "error", "message" => "there is no corresponding API key"];
        }

        $prompt = $this->generatePrompt($p, $type);

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

        if ($uploadUrl!=null){
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

            $filePath = $this->prepareURL($uploadUrl);
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
                }
            } else {
                // If the file does not fit any of the above categories
                echo "The file type is not supported.";
                // Optionally add code for handling other types of files or just leave as is / do nothing
                //TODO ALEK: add A sort of default behavior - if the file type is not yet supported, try uploading it anyway.
            }

        }
        elseif (isset($this->preset_models->type_list[$type]['payload']['assistant_id'])) {
            //If a file doesn't need to be uploaded (assuming the assistant has pre-made instructions or another reason), skip the upload step and call assisstant directly
            //only when the assistant is specifically specified/requested - i.e. learning objects
                /*$filePath = $this->prepareURL($uploadUrl);
                $fileId = "";
                $fileId = $this->fileUpload($filePath);
                if ($fileId!=""){
                    if (!$this->vectorStorageAttached($this->preset_models->type_list[$type]['payload']['assistant_id'])){
                        $vectorStorageId = $this->createVectorStorage();
                        $deleteVectorStorage = true; //if a vector storage is created, this signifies it should be deleted
                    }
                    else
                    {
                        $vectorStorageId = vectorStorageAttached($this->preset_models->type_list[$type]['payload']['assistant_id']);
                        $deleteVectorStorage = false; //if a vector storage already exists, this signifies to only delete the uploaded file and to not tamper with the rest
                    }
                    $vectorFileId = $this->createVectorStoreFile($fileId, $vectorStorageId);
                    $this->attachStorageToAssistant($this->preset_models->type_list[$type]['payload']['assistant_id'], $vectorStorageId);
                }*/
                $results[] = $this->POST_OpenAi_Assistant($prompt, $this->preset_models->type_list[$type]);
                /*if ($fileId!=""){
                    if ($deleteVectorStorage){
                        $detatchment = $this->detachStorageFromAssistant($this->preset_models->type_list[$type]['payload']['assistant_id'], $vectorStorageId);
                        $deletion = $this->deleteVectorStorage($vectorStorageId);
                    }
                    $delete = $this->deleteFile($fileId);
                }*/

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
        return $answer;
    }

}
