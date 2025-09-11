<?php
//openai api master class
//file name must be $api . Api.php for example openaiApi.php when adding new api
//class name AiApi mandatory when adding new api
class pexelsApi
{
    function __construct() {
        require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
    }

    // Function to make a GET request to the Pexels API
    private function GET_Pexels($query, $aiParams, $perPage = 3, $page = 1)
    {
        $pexelsKey = $this->xerte_toolkits_site->pexels_key;

        // Sanitize and URL-encode the query
        $query = urlencode(strip_tags($query));


        // Construct the URL with the query, perPage, and page parameters
        $url = "https://api.pexels.com/v1/search?query={$query}&per_page={$perPage}&page={$page}";

        // Append optional parameters if they are not "unmentioned"
        if (isset($aiParams->orientation) && $aiParams->orientation !== 'unmentioned') {
            $url .= "&orientation=" . urlencode($aiParams->orientation);
        }
        if (isset($aiParams->color) && $aiParams->color !== 'unmentioned') {
            $url .= "&colors=" . urlencode($aiParams->color);
        }
        if (isset($aiParams->size) && $aiParams->size !== 'unmentioned') {
            $url .= "&size=" . urlencode($aiParams->size);
        }

        // Initialize cURL
        $curl = curl_init();

        // Set cURL options
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            "Authorization: {$pexelsKey}",
            "Content-Type: application/json"
        ]);

        // Execute cURL request and capture response
        $result = curl_exec($curl);

        // Check if there was an error with the cURL request
        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);
            return (object)["status" => "error", "message" => "cURL error: " . $error_msg];
        }

        // Close the cURL session
        curl_close($curl);

        // Decode the JSON response
        $resultDecoded = json_decode($result);

        // Check for API errors
        if (isset($resultDecoded->error)) {
            return (object)["status" => "error", "message" => "Error on API call: " . $resultDecoded->error];
        }

        return $resultDecoded;
    }

    private function extractParameters($input){
        $openAiKey = $this->xerte_toolkits_site->openai_key;

        // If it's the first time, initialize the conversation with the instructions and the first example
        if (empty($conversation)) {
            $conversation[] = [
                "role" => "user",
                "content" => "Given input from a user, parse it for relevant information about the following and return a json detailing these pieces of information:
                orientation: landscape, portrait, or square (pick one)
                size: small, medium, large (pick one)
                color: Accepts a hex color code (e.g., #ff0000) or a color name (e.g., red, orange). (pick one, which should best represent the average or most prominent color based on the input)
                
                If something was not mentioned, then simply return 'unmentioned' for that field.
                
                To start with, parse this user prompt:
                'Show me a large photo of a golden sunset on the beach with beautiful red and yellow hues scintillating through the clouds and no people'"
            ];

            $conversation[] = [
                "role" => "system",
                "content" => "{
                  \"orientation\": \"unmentioned\",
                  \"color\": \"orange\",
                  \"size\": \"large\",
                }"
            ];
        }

        // Add the next user query to the conversation
        $conversation[] = ["role" => "user", "content" => "Great, now repeat the process and use the exact same format, making sure to return nothing but the json, for the following user input: {$input}"];

        // Prepare the data for the API call
        $apiInput = [
            "model" => "gpt-4o",
            "messages" => $conversation,
            "max_tokens" => 160, // Adjust the token count as needed
            "temperature" => 0.9
        ];

        // Convert the input to JSON
        $data = json_encode($apiInput);

        // Initialize cURL
        $curl = curl_init();

        // Set cURL options
        curl_setopt($curl, CURLOPT_URL, "https://api.openai.com/v1/chat/completions");
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$openAiKey}",
            "Content-Type: application/json"
        ]);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

        // Execute cURL request and capture response
        $result = curl_exec($curl);

        // Check for cURL errors
        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);
            return (object)["status" => "error", "message" => "cURL error: " . $error_msg];
        }

        // Close the cURL session
        curl_close($curl);

        // Decode the JSON response
        $resultDecoded = json_decode($result);

        // Check if there's an error in the API response
        if (isset($resultDecoded->error)) {
            return (object)["status" => "error", "message" => "Error on API call: " . $resultDecoded->error->message];
        }

        // Extract the rewritten prompt from the API response
        $rewrittenPrompt = $resultDecoded->choices[0]->message->content;

        // Add the model's response to the conversation history
        $conversation[] = ["role" => "system", "content" => $rewrittenPrompt];

        // Return the rewritten prompt and the updated conversation
        return [
            "prompt" => trim($rewrittenPrompt),
            "conversation" => $conversation
        ];
    }

    private function rewritePrompt($query)
    {
        // Your OpenAI API key
        $openAiKey = $this->xerte_toolkits_site->openai_key;

        // The system message to instruct the AI how to rewrite the prompt
        $systemMessage = "You are an AI assistant. Rewrite the following user query to be more effective for image search APIs like Pexels.";

        // The full prompt to be sent to the API
        $apiInput = [
            "model" => "gpt-4o-mini",
            "messages" => [
                ["role" => "system", "content" => $systemMessage],
                ["role" => "user", "content" => $query]
            ],
            "max_tokens" => 160, // Adjust the token count as needed
            "temperature" => 0.9
        ];

        // Convert the input to JSON
        $data = json_encode($apiInput);

        // Initialize cURL
        $curl = curl_init();

        // Set cURL options
        curl_setopt($curl, CURLOPT_URL, "https://api.openai.com/v1/chat/completions");
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$openAiKey}",
            "Content-Type: application/json"
        ]);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

        // Execute cURL request and capture response
        $result = curl_exec($curl);

        // Check for cURL errors
        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);
            return (object)["status" => "error", "message" => "cURL error: " . $error_msg];
        }

        // Close the cURL session
        curl_close($curl);

        // Decode the JSON response
        $resultDecoded = json_decode($result);

        // Check if there's an error in the API response
        if (isset($resultDecoded->error)) {
            return (object)["status" => "error", "message" => "Error on API call: " . $resultDecoded->error->message];
        }

        // Extract the rewritten prompt from the API response
        $rewrittenPrompt = $resultDecoded->choices[0]->message->content;

        return trim($rewrittenPrompt);
    }

    private function downloadImageFromPexels($imageUrl, $saveTo)
    {
        // Get the image content from the URL
        $imageContent = file_get_contents($imageUrl);

        if ($imageContent === false) {
            return (object)["status" => "error", "message" => "Failed to download image."];
        }

        // Save the image to the specified path
        $encodedName = basename(parse_url($imageUrl, PHP_URL_PATH));
        $decodedName = urldecode($encodedName);
        $savePath = $saveTo . '/' . $decodedName;

        // Write the image content to a file
        if (file_put_contents($savePath, $imageContent) === false) {
            return (object)["status" => "error", "message" => "Failed to save image."];
        }

        return (object)["status" => "success", "message" => "Image downloaded successfully.", "path" => $savePath];
    }

    // Public function to handle the request and return image URLs
    public function sh_request($query, $target, $interpretPrompt, $overrideSettings, $settings)
    {
        // Initialize the results array to store downloaded file paths
        $downloadedPaths = [];

        // Rewrite the query for better image search results
        if (($interpretPrompt === "true")||($interpretPrompt === true)){
            $aiQuery = $this->rewritePrompt($query);
        } else {
            $aiQuery = $query;
        }

        if (($overrideSettings === "true") || ($overrideSettings === true)){
            $aiParams = json_encode($settings);
            $aiParams = json_decode($aiParams);
        } else{
            $aiParams= json_decode($this->extractParameters($query)['prompt']);
        }

        // Make the GET request to Pexels API
        $apiResponse = $this->GET_Pexels($aiQuery, $aiParams, $settings['nri']);

        // If there's an error, return it with an empty array for the paths
        if (isset($apiResponse->status) && $apiResponse->status === "error") {
            return (object)[
                "status" => "error",
                "message" => $apiResponse->message,
                "paths" => $downloadedPaths
            ];
        }

        // Get the current date and time for folder naming
        $dateTime = date('d-m-Y_Hi');

        // Specify the directory to save images, including date and time
        //$path = $target . "/media/pexels";
        $path = $target . "media";
        // Ensure the directory exists and is writable
        if (!is_dir($path)) {
            mkdir($path, 0777, true); // Create the directory if it doesn't exist
        }

        // Loop through each photo in the API response
        foreach ($apiResponse->photos as $photo) {
            // URL of the original image
            $url = $photo->src->original;

            // Download the image and save it to the specified directory
            $downloadResult = $this->downloadImageFromPexels($url, $path);

            // If the download was successful, add the image path to the results array
            if ($downloadResult->status === "success") {
                $downloadedPaths[] = $downloadResult->path;

                // Create a text file with the same name as the image to store credit information
                $authorName = $photo->photographer;
                $authorProfileUrl = $photo->photographer_url; // Construct the profile URL
                $originalPhotoUrl = $photo->url; // The original photo URL on Pexels
                $creditText = "Photo by $authorName, $authorProfileUrl\nOriginal Photo URL: $originalPhotoUrl\n";
                $infoFilePath = pathinfo($downloadResult->path, PATHINFO_FILENAME) . '.txt';
                file_put_contents($path . '/' . $infoFilePath, $creditText);
            } else {
                // If a download fails, include the error message but continue the process
                return (object)[
                    "status" => "error",
                    "message" => "Failed to download one or more images: " . $downloadResult->message,
                    "paths" => $downloadedPaths
                ];
            }
        }

        // Return a success status with the array of downloaded paths
        return (object)[
            "status" => "success",
            "message" => "All images downloaded successfully.",
            "paths" => $downloadedPaths
        ];
    }
}
