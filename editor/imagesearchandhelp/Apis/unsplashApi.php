<?php
require_once __DIR__ . '/../BaseApi.php';
require_once __DIR__ . '/../Ai/AiChat.php';
use Ai\AiChat;

//TODO: Because the Unsplash API key is not currently active, this class hasn't been fully tested yet.
class unsplashApi extends BaseApi
{

    private function buildUnsplashUrl($query, $aiParams, $perPage = 3, $page = 1)
    {
        $query = urlencode($this->clean($query));
        $url = "https://api.unsplash.com/search/photos?query={$query}&per_page={$perPage}&page={$page}";


        // Unsplash accepts orientation: landscape | portrait | squarish
        if (isset($aiParams->orientation) && $aiParams->orientation !== 'unmentioned') {
            $url .= "&orientation=" . urlencode($aiParams->orientation);
        }
        // Unsplash color filter
        if (isset($aiParams->color) && $aiParams->color !== 'unmentioned') {
            $url .= "&color=" . urlencode($aiParams->color);
        }
        return $url;
    }


    private function GET_Unsplash($query, $aiParams, $perPage = 3, $page = 1)
    {
        $headers = [
            'Authorization: Client-ID ' . $xerte_toolkits_site->unsplash_key,
            'Content-Type: application/json',
        ];
        $url = $this->buildUnsplashUrl($query, $aiParams, $perPage, $page);
        $res = $this->httpGet($url, $headers);
        if (!$res->ok) {
            return (object)["status" => "error", "message" => $res->error ?? ("HTTP " . $res->status)];
        }
        if (isset($res->json->errors)) {
            return (object)["status" => "error", "message" => implode(', ', $res->json->errors)];
        }
        return $res->json;
    }


    private function extractParameters($input)
    {
        $chat = new AiChat($xerte_toolkits_site);


        $conversation = [];
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


        $conversation[] = ["role" => "user", "content" => "Great, now repeat the process and use the exact same format, making sure to return nothing but the json, for the following user input: {$input}"];


        $resp = $chat->complete($conversation, $this->aiProvider, [
            'model' => $this->providerModel,
            'max_tokens' => 160,
            'temperature' => 0.9,
        ]);


        if (!$resp['ok']) {
            return (object)["status" => "error", "message" => $resp['error']];
        }


        $rewrittenPrompt = trim($resp['content'] ?? '');
        $conversation[] = ["role" => "system", "content" => $rewrittenPrompt];


        return [
            "prompt" => $rewrittenPrompt,
            "conversation" => $conversation
        ];
    }

    private function rewritePrompt($query)
    {
        $chat = new AiChat($xerte_toolkits_site);
        $systemMessage = "You are an AI assistant. Rewrite the following user query to be more effective for image search when using an API like Unsplash.";
        $resp = $chat->complete([
            ["role" => "system", "content" => $systemMessage],
            ["role" => "user", "content" => $query],
        ], $this->aiProvider, [
            'model' => $this->providerModel,
            'max_tokens' => 160,
            'temperature' => 0.9,
        ]);


        if (!$resp['ok']) {
            return $query; // fallback
        }
        return trim($resp['content'] ?? $query);
    }

    private function downloadImageFromUnsplash($imageUrl, $saveTo)
    {
        $encodedName = basename(parse_url($imageUrl, PHP_URL_PATH));
        $decodedName = urldecode($encodedName);
        $dl = $this->downloadBinary($imageUrl, $saveTo, 'unsplash_', $decodedName);
        if ($dl->status !== 'success') {
            return (object)["status" => "error", "message" => $dl->message];
        }
        return (object)["status" => "success", "message" => "Image downloaded successfully.", "path" => $dl->path];
    }

    // Unsplash ToS: must report downloads via download_location
    private function trackUnsplashDownload($downloadLocationUrl)
    {
        $headers = [
            'Authorization: Client-ID ' . $xerte_toolkits_site->unsplash_key,
            'Content-Type: application/json',
        ];
        $res = $this->httpGet($downloadLocationUrl, $headers);
        if (!$res->ok) {
            return (object)["status" => "error", "message" => $res->error ?? ("HTTP " . $res->status)];
        }
        if (isset($res->json->errors)) {
            return (object)["status" => "error", "message" => implode(', ', $res->json->errors)];
        }
        return (object)["status" => "success", "message" => "Download tracked successfully."];
    }


    public function sh_request($query, $target, $interpretPrompt, $overrideSettings, $settings)
    {
        if(!isset($_SESSION['toolkits_logon_id'])) {
            die("Session ID not set");
        }

        $downloadedPaths = [];


        $aiQuery = ($interpretPrompt === 'true' || $interpretPrompt === true)
            ? $this->rewritePrompt($query)
            : $query;


        if ($overrideSettings === 'true' || $overrideSettings === true) {
            //todo again
            $aiParams = json_decode(json_encode($settings));
        } else {
            $tmp = $this->extractParameters($query);
            $aiParams = json_decode($tmp['prompt']); // match original calling shape
        }


        $perPage = isset($settings['nri']) ? (int)$settings['nri'] : 3;
        $apiResponse = $this->GET_Unsplash($aiQuery, $aiParams, $perPage);


        if (isset($apiResponse->status) && $apiResponse->status === 'error') {
            return (object)[
                'status' => 'error',
                'message' => $apiResponse->message,
                'paths' => $downloadedPaths,
            ];
        }


        $path = $target . "/media";
        $this->ensureDir($path);
        x_check_path_traversal($path, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

        foreach ($apiResponse->results ?? [] as $photo) {
            $url = $photo->urls->regular; // Use "regular" as in original


            $downloadResult = $this->downloadImageFromUnsplash($url, $path);
            if ($downloadResult->status === 'success') {
                $downloadedPaths[] = $downloadResult->path;


                // Report the download to Unsplash
                $downloadLocationUrl = $photo->links->download_location;
                $this->trackUnsplashDownload($downloadLocationUrl);


                // Credit file next to the image
                $authorName = $photo->user->name;
                $authorProfileUrl = $photo->user->links->html;
                $originalPhotoUrl = $photo->links->html;
                $creditText = "Photo by $authorName, $authorProfileUrl
                Original Photo URL: $originalPhotoUrl
                ";
                $infoFilePath = pathinfo($downloadResult->path, PATHINFO_FILENAME) . '.txt';
                file_put_contents($path . '/' . $infoFilePath, $creditText);
            } else {
                return (object)[
                    'status' => 'error',
                    'message' => 'Failed to download one or more images: ' . $downloadResult->message,
                    'paths' => $downloadedPaths,
                ];
            }
        }


        return (object)[
            'status' => 'success',
            'message' => 'All images downloaded successfully.',
            'paths' => $downloadedPaths,
        ];
    }

}

