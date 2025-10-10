<?php
//openai api master class
//file name must be $api . Api.php for example openaiApi.php when adding new api
//class name AiApi mandatory when adding new api
class pixabayApi
{

    function __construct() {
        require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
    }


    // Function to make a GET request to the Pixabay API
    private function GET_Pixabay($query, $aiParams, $perPage = 5, $page = 1)
    {
        $apiKey = $this->xerte_toolkits_site->pixabay_key;
        // Sanitize and URL-encode the query
        $query = urlencode(strip_tags($query));


        // Construct the URL with the query, perPage, and page parameters
        $url = "https://pixabay.com/api/?key={$apiKey}&q={$query}&per_page={$perPage}&page={$page}";

        // Append optional parameters if they are not "unmentioned"
        if (isset($aiParams->pixabayOrientation) && $aiParams->pixabayOrientation !== 'unmentioned') {
            $url .= "&orientation=" . urlencode($aiParams->pixabayOrientation);
        }
        if (isset($aiParams->pixabayColors) && $aiParams->pixabayColors !== 'unmentioned') {
            $url .= "&colors=" . urlencode($aiParams->pixabayColors);
        }
        if (isset($aiParams->pixabayType) && $aiParams->pixabayType !== 'unmentioned') {
            $url .= "&image_type=" . urlencode($aiParams->pixabayType);
        }

        // Initialize cURL
        $curl = curl_init();

        // Set cURL options
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

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

        // Check for API errors
        if (isset($resultDecoded->error)) {
            return (object)["status" => "error", "message" => "Error on API call: " . $resultDecoded->error];
        }

        return $resultDecoded;
    }

    private function rewritePrompt($query, $conversation = [])
    {
        // Your OpenAI API key
        $openAiKey = $this->xerte_toolkits_site->openai_key;

        // If it's the first time, initialize the conversation with the instructions and the first example
        if (empty($conversation)) {
            $conversation[] = [
                "role" => "user",
                "content" => "Given a sentence or paragraph, identify the primary nouns, verbs, and adjectives as core keywords, and treat other descriptive words as optional. Formulate a search query optimized for Pixabay's API using the following rules:\n\n1. **Core Keywords**: Extract and list the most important nouns, verbs, and adjectives.\n2. **Optional Keywords**: Identify secondary or descriptive words and combine them using the | operator.\n3. **Grouping**: Group core keywords together and add optional keywords within parentheses.\n4. **Exclusions**: Identify words that should be excluded from the search (if any) using the - operator.\n5. **Wildcard or Fuzzy Matching**: Apply wildcards (*) or fuzzy matching (~) to words that may have variations in spelling or form.\n\nFor example, try this sentence: \"An artist paints a beautiful, serene landscape with tall mountains, a flowing river, and vibrant wildflowers.\""
            ];

            $conversation[] = [
                "role" => "system",
                "content" => "artist paint landscape (beautiful | serene | vibrant) (mountain | river | wildflower)"
            ];
        }

        // Add the next user query to the conversation
        $conversation[] = ["role" => "user", "content" => "Great, now do the same for the following sentence: {$query}"];

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

    private function extractParameters($input){
        // Your OpenAI API key
        $openAiKey = $this->xerte_toolkits_site->openai_key;

        // If it's the first time, initialize the conversation with the instructions and the first example
        if (empty($conversation)) {
            $conversation[] = [
                "role" => "user",
                "content" => "Given input from a user, parse it for relevant information about the following and return a json detailing these pieces of information:
                orientation: horizontal, vertical (pick one)
                color:  accepts grayscale, transparent, red, orange, yellow, green, turquoise, blue, lilac, pink, white, gray, black, brown (pick one, or multiple based on description separated by commas)
                image_type: accepts photo, illustration, vector (pick one, only when explicitly specified)
                
                If something was not mentioned, then simply return 'unmentioned' for that field.
                
                To start with, parse this user prompt:
                'Show me a large photo of a golden sunset on the beach with beautiful red and yellow hues scintillating through the clouds and no people'"
            ];

            $conversation[] = [
                "role" => "system",
                "content" => "{
                  \"orientation\": \"unmentioned\",
                  \"color\": \"orange, red, yellow\",
                  \"image_type\": \"photo\",
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

    private function downloadImageFromPixabay($imageUrl, $saveTo)
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
            $aiQuery = $this->rewritePrompt($query)['prompt'];
        } else {
            $aiQuery = $query;
        }

        if (($overrideSettings === "true") || ($overrideSettings === true)){
            $aiParams = json_encode($settings);
            $aiParams = json_decode($aiParams);
        } else{
            $aiParams= json_decode($this->extractParameters($query)['prompt']);
        }

        // Make the GET request to Pixabay API
        $apiResponse = $this->GET_Pixabay($aiQuery, $aiParams, $settings['nri']);

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
        //$path = $target . "/media/pixabay";
        $path = $target . "/media";

        // Ensure the directory exists and is writable
        if (!is_dir($path)) {
            mkdir($path, 0777, true); // Create the directory if it doesn't exist
        }

        // Loop through each photo in the API response
        foreach ($apiResponse->hits as $photo) { // 'hits' is the array of images returned by Pixabay
            // URL of the original image
            $url = $photo->largeImageURL; // Use the 'largeImageURL' for the best quality image

            // Download the image and save it to the specified directory
            $downloadResult = $this->downloadImageFromPixabay($url, $path);

            // If the download was successful, add the image path to the results array
            if ($downloadResult->status === "success") {
                $downloadedPaths[] = $downloadResult->path;

                // Create a text file with the same name as the image to store credit information
                $authorName = $photo->user;
                $authorProfileUrl = "https://pixabay.com/users/" . $authorName . "-" . $photo->user_id; // Construct the profile URL
                $originalPhotoUrl = $photo->pageURL; // The original photo URL on Pixabay
                // HTML snippet for embedding
                $htmlEmbed = "<p>Photo by <a href=\"$authorProfileUrl\" target=\"_blank\">$authorName</a>. <a href=\"$originalPhotoUrl\" target=\"_blank\">View Photo</a>.</p>";
                $htmlEmbedPlainText = htmlspecialchars($htmlEmbed);
                $creditText = "Photo by $authorName, $authorProfileUrl\nOriginal Photo URL: $originalPhotoUrl\n" . "\n" . $htmlEmbed;;
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
