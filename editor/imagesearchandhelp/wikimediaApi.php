<?php
//openai api master class
//file name must be $api . Api.php for example openaiApi.php when adding new api
//class name AiApi mandatory when adding new api
class wikimediaApi
{
    function __construct() {
        require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
    }

// Function to make a GET request to the Wikimedia Commons API
    private function GET_Wikimedia($query, $aiParams, $perPage = 5, $page = 1)
    {
        // Sanitize and URL-encode the query
        $query = urlencode(strip_tags($query));

        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
        $filteredPages = [];
        $tries = 0;
        $maxTries = 10;
        $offset = ($page - 1) * $perPage;

        while (count($filteredPages) < $perPage && $tries < $maxTries) {
            // Construct the URL with the query, perPage, and offset
            $url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=search"
                . "&iiprop=url|user|canonicaltitle"
                . "&gsrsearch={$query}"
                . "&gsrlimit={$perPage}"
                . "&gsrnamespace=6"
                . "&gsroffset={$offset}";

            if (isset($aiParams->width) && $aiParams->width !== 'unmentioned') {
                $url .= "&iiurlwidth=" . urlencode($aiParams->width);
            }
            if (isset($aiParams->height) && $aiParams->height !== 'unmentioned') {
                $url .= "&iiurlheight=" . urlencode($aiParams->height);
            }

            // Initialize cURL
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec($curl);

            if (curl_errno($curl)) {
                $error_msg = curl_error($curl);
                curl_close($curl);
                return (object)["status" => "error", "message" => "cURL error: " . $error_msg];
            }

            curl_close($curl);
            $resultDecoded = json_decode($result, true);

            if (isset($resultDecoded['error'])) {
                return (object)["status" => "error", "message" => "Error on API call: " . $resultDecoded['error']['info']];
            }

            $pages = $resultDecoded['query']['pages'] ?? [];

            // Filter pages by extension
            foreach ($pages as $page) {
                $url = $page['imageinfo'][0]['url'] ?? '';
                $ext = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
                if (in_array($ext, $allowedExtensions)) {
                    $filteredPages[$page['pageid']] = $page;
                    if (count($filteredPages) >= $perPage) {
                        break;
                    }
                }
            }

            $offset += $perPage;
            $tries++;
        }

        // Return in same format as before
        return [
            'batchcomplete' => '',
            'query' => ['pages' => $filteredPages]
        ];
    }

    private function rewritePrompt($query, $conversation = [])
    {
        // Your OpenAI API key
        $openAiKey = $this->xerte_toolkits_site->openai_key;

        // If it's the first time, initialize the conversation with the instructions and the first example
        if (empty($conversation)) {
            $conversation[] = [
                "role" => "user",
                "content" => "Given a sentence or paragraph, identify the primary nouns, verbs, and adjectives as core keywords, and treat other descriptive words as optional. Formulate a search query optimized for Wikimedia Commons' API using the following rules:\n\n1. **Core Keywords**: Extract and list the most important nouns, verbs, and adjectives.\n2. **Optional Keywords**: Identify secondary or descriptive words and combine them using the | operator.\n3. **Grouping**: Group core keywords together and add optional keywords within parentheses.\n4. **Exclusions**: Identify words that should be excluded from the search (if any) using the - operator.\n5. **Wildcard or Fuzzy Matching**: Apply wildcards (*) or fuzzy matching (~) to words that may have variations in spelling or form. Finally, if technical details such as '1080p', width or height of an image are mentioned, make sure to remove them. \n\nFor example, try this sentence: \"An artist paints a beautiful, serene landscape with tall mountains, a flowing river, and vibrant wildflowers.\""
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
            width: a number representing the pixels (for example, 640)
            height: a number representing the pixels (for example, 640)
            
            If something was not mentioned, then simply return 'unmentioned' for that field.
            
            To start with, parse this user prompt:
            'Show me a large photo of a golden sunset on the beach with beautiful red and yellow hues scintillating through the clouds and no people 1080p wide'"
            ];

            $conversation[] = [
                "role" => "system",
                "content" => "{
              \"height\": \"unmentioned\",
              \"width\": \"1080\",
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

    private function downloadImageFromWikimedia($imageUrl, $saveTo)
    {
        // Initialize cURL
        $curl = curl_init($imageUrl);

        // Set cURL options
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true); // Follow redirects, if any
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // Skip SSL verification (if needed)
        curl_setopt($curl, CURLOPT_TIMEOUT, 120); // Set a timeout for the request

        // Set a User-Agent to mimic a browser request
        curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36');

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
        $encodedName = basename(parse_url($imageUrl, PHP_URL_PATH));
        $decodedName = urldecode($encodedName);
        $savePath = $saveTo . '/' . $decodedName;

        // Write the image data to a file
        if (file_put_contents($savePath, $imageData) === false) {
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
        if (($interpretPrompt === "true") || ($interpretPrompt === true)) {
            $aiQuery = $this->rewritePrompt($query)['prompt'];
        } else {
            $aiQuery = $query;
        }

        if (($overrideSettings === "true") || ($overrideSettings === true)) {
            $aiParams = json_encode($settings);
            $aiParams = json_decode($aiParams);
        } else {
            $aiParams = json_decode($this->extractParameters($query)['prompt']);
        }

        // Make the GET request to Wikimedia Commons API
        $apiResponse = $this->GET_Wikimedia($aiQuery, $aiParams, $settings['nri']);

        // If there's an error, return it with an empty array for the paths
        if (isset($apiResponse['status']) && $apiResponse['status'] === "error") {
            return (object)[
                "status" => "error",
                "message" => $apiResponse['message'],
                "paths" => $downloadedPaths
            ];
        }

        // Get the current date and time for folder naming
        $dateTime = date('d-m-Y_Hi');

        // Specify the directory to save images, including date and time
        $path = $target . "/media/wikimedia";
        $path = $target . "/media";

        // Ensure the directory exists and is writable
        if (!is_dir($path)) {
            mkdir($path, 0777, true); // Create the directory if it doesn't exist
        }

        // Loop through each image in the API response
        if (isset($apiResponse['query']['pages'])) {
            foreach ($apiResponse['query']['pages'] as $page) {
                if (isset($page['imageinfo'][0]['url'])) {
                    // URL of the image
                    $url = $page['imageinfo'][0]['url'];

                    // Download the image and save it to the specified directory
                    $downloadResult = $this->downloadImageFromWikimedia($url, $path);

                    // If the download was successful, add the image path to the results array
                    if ($downloadResult->status === "success") {
                        $downloadedPaths[] = $downloadResult->path;

                        // Create a text file with the same name as the image to store credit information
                        $authorName = $page['imageinfo'][0]['user'];
                        $imageTitle = $page['title'];
                        $imageUrl = $url;

                        // HTML snippet for embedding
                        $htmlEmbed = "<p>Image by <a href=\"https://commons.wikimedia.org/wiki/User:$authorName\" target=\"_blank\">$authorName</a> on Wikimedia Commons. <a href=\"$imageUrl\" target=\"_blank\">View Image</a>.</p>";
                        $htmlEmbedPlainText = htmlspecialchars($htmlEmbed);
                        $creditText = "Image by $authorName, https://commons.wikimedia.org/wiki/User:$authorName\nImage Title: $imageTitle\nOriginal Image URL: $imageUrl\n" . "\n" . $htmlEmbed;;
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
