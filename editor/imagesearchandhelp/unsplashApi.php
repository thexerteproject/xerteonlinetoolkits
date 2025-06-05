<?php
//openai api master class
//file name must be $api . Api.php for example openaiApi.php when adding new api
//class name AiApi mandatory when adding new api
class unsplashApi
{
    function __construct() {
        require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
    }

    // Function to make a GET request to the Unsplash API
    private function GET_Unsplash($query, $aiParams, $perPage = 3, $page = 1)
    {
        // Retrieve the Unsplash API key from the config
        $unsplashKey = $this->xerte_toolkits_site->unsplash_key;

        // Sanitize and URL-encode the query
        $query = urlencode(strip_tags($query));

        // Construct the Unsplash API URL with the query, perPage, and page parameters
        $url = "https://api.unsplash.com/search/photos?query={$query}&per_page={$perPage}&page={$page}";

        // Unsplash specific: append optional parameters for orientation and color, if provided
        if (isset($aiParams->orientation) && $aiParams->orientation !== 'unmentioned') {
            $url .= "&orientation=" . urlencode($aiParams->orientation);
        }
        if (isset($aiParams->color) && $aiParams->color !== 'unmentioned') {
            $url .= "&color=" . urlencode($aiParams->color);
        }

        // Initialize cURL
        $curl = curl_init();

        // Set cURL options
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            "Authorization: Client-ID {$unsplashKey}",
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
        if (isset($resultDecoded->errors)) {
            return (object)["status" => "error", "message" => "Error on API call: " . implode(', ', $resultDecoded->errors)];
        }

        return $resultDecoded;
    }

    private function extractParameters($input){
        // Your OpenAI API key
        $openAiKey = $this->xerte_toolkits_site->openai_key;

        // If it's the first time, initialize the conversation with the instructions and the first example
        if (empty($conversation)) {
            $conversation[] = [
                "role" => "user",
                "content" => "Given input from a user, parse it for relevant information about the following and return a json detailing these pieces of information:
                orientation: landscape, portrait, squarish (pick one)
                color: accepts black_and_white, black, white, yellow, orange, red, purple, magenta, green, teal, and blue.(pick one, which should best represent the average or most prominent color based on the input)
                
                If something was not mentioned, then simply return 'unmentioned' for that field.
                
                To start with, parse this user prompt:
                'Show me a large photo of a golden sunset on the beach with beautiful red and yellow hues scintillating through the clouds and no people'"
            ];

            $conversation[] = [
                "role" => "system",
                "content" => "{
                  \"orientation\": \"unmentioned\",
                  \"color\": \"orange\",
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
        $systemMessage = "You are an AI assistant. Rewrite the following user query to be more effective for image search when using an API like Unsplash.";

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

    private function downloadImage($imageUrl, $saveTo)
    {
        // Initialize cURL
        $curl = curl_init($imageUrl);

        // Set cURL options
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true); // Follow redirects, if any
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // Skip SSL verification (if needed)
        curl_setopt($curl, CURLOPT_TIMEOUT, 120); // Set a timeout for the request

        // Execute the cURL request and get the image data
        $imageData = curl_exec($curl);

        // Check for cURL errors
        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);
            return (object)["status" => "error", "message" => "cURL error: " . $error_msg];
        }

        // Get the HTTP status code
        $http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        // Check if the request was successful
        if ($http_status != 200) {
            return (object)["status" => "error", "message" => "Failed to download image. HTTP status code: " . $http_status];
        }

        // Save the image to the specified path
        $savePath = $saveTo . '/' . basename(parse_url($imageUrl, PHP_URL_PATH));

        // Write the image data to a file
        if (file_put_contents($savePath, $imageData) === false) {
            return (object)["status" => "error", "message" => "Failed to save image."];
        }

        return (object)["status" => "success", "message" => "Image downloaded successfully.", "path" => $savePath];
    }

    //function to meet requirements for Unsplash which dictate that downloads must be reported with this specific endpoint
    //also applies to embeds, using images in blogs, and other actions which semi-permanently or permanently fix an image to a page
    private function trackUnsplashDownload($downloadLocationUrl)
    {
        // Initialize cURL
        $curl = curl_init();

        // Set cURL options
        curl_setopt($curl, CURLOPT_URL, $downloadLocationUrl);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            "Authorization: Client-ID {$this->xerte_toolkits_site->unsplash_key}",
            "Content-Type: application/json"
        ]);

        // Execute cURL request
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

        // Check for API errors
        if (isset($resultDecoded->errors)) {
            return (object)["status" => "error", "message" => "Error on API call: " . implode(', ', $resultDecoded->errors)];
        }

        // Return success message
        return (object)["status" => "success", "message" => "Download tracked successfully."];
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
        $apiResponse = $this->GET_Unsplash($aiQuery, $aiParams, $settings['nri']);

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
        $path = $target . "/media/unsplash/" . $dateTime;

        // Ensure the directory exists and is writable
        if (!is_dir($path)) {
            mkdir($path, 0777, true); // Create the directory if it doesn't exist
        }
        // Loop through each photo in the API response
        foreach ($apiResponse->results as $photo) {
            // URL of the original image
            $url = $photo->urls->regular;

            // Download the image and save it to the specified directory
            $downloadResult = $this->downloadImage($url, $path);

            // If the download was successful, add the image path to the results array and report the download to unsplash
            if ($downloadResult->status === "success") {
                $downloadedPaths[] = $downloadResult->path;
                //report download to unsplash to comply with ToS
                $downloadLocationUrl = $photo->links->download_location;  // The download_location URL from Unsplash API response
                $downloadEventResult = $this->trackUnsplashDownload($downloadLocationUrl);

                // Create a text file with the same name as the image to store credit information
                $authorName = $photo->user->name;
                $authorProfileUrl = $photo->user->links->html;
                $originalPhotoUrl = $photo->links->html;  // The original photo URL
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
