<?php
require_once __DIR__ . '/../BaseApi.php';
require_once __DIR__ . '/../Ai/AiChat.php';
use Ai\AiChat;
class wikimediaApi extends BaseApi
{
//TODO: with the current headers, the api returns an error/warning; as such I haven't been able to test every functionality
    private function GET_Wikimedia($query, $aiParams, $perPage = 5, $page = 1)
    {
        $query = urlencode($this->clean($query));


        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
        $filteredPages = [];
        $tries = 0;
        $maxTries = 10;
        $offset = ($page - 1) * $perPage;


        while (count($filteredPages) < $perPage && $tries < $maxTries) {
            $url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=search"
                . "&iiprop=url|user|canonicaltitle|descriptionurl|extmetadata"
                . "&gsrsearch={$query}"
                . "&gsrlimit={$perPage}"
                . "&gsrnamespace=6"
                . "&gsroffset={$offset}";


            if (isset($aiParams['wikimediaWidth']) && $aiParams['wikimediaWidth'] !== 'unmentioned') {
                $url .= "&iiurlwidth=" . urlencode($aiParams['wikimediaWidth']);
            }
            if (isset($aiParams['wikimediaHeight']) && $aiParams['wikimediaHeight'] !== 'unmentioned') {
                $url .= "&iiurlheight=" . urlencode($aiParams['wikimediaHeight']);
            }


            $res = $this->httpGet($url);
            if (!$res->ok) {
                return [
                    'status'  => 'error',
                    'message' => isset($res->error) ? $res->error : ('HTTP ' . $res->status),
                ];
            }


            $resultDecoded = json_decode($res->raw, true); // assoc arrays like the original
            if (isset($resultDecoded['error'])) {
                return ["status" => "error", "message" => "Error on API call: " . $resultDecoded['error']['info']];
            }


            $pages = isset($resultDecoded['query']['pages'])
                ? $resultDecoded['query']['pages']
                : [];


            foreach ($pages as $page) {
                $imgUrl = isset($page['imageinfo'][0]['url'])
                    ? $page['imageinfo'][0]['url']
                    : '';
                $ext = strtolower(pathinfo(parse_url($imgUrl, PHP_URL_PATH), PATHINFO_EXTENSION));
                if (in_array($ext, $allowedExtensions, true)) {
                    $filteredPages[$page['pageid']] = $page;
                    if (count($filteredPages) >= $perPage) {
                        break;
                    }
                }
            }


            $offset += $perPage;
            $tries++;
        }


        return [
            'batchcomplete' => '',
            'query' => ['pages' => $filteredPages]
        ];
    }


    private function rewritePrompt($query, $conversation = [])
    {
        global $xerte_toolkits_site;
        $chat = new AiChat($xerte_toolkits_site);


        if (empty($conversation)) {
            $conversation[] = [
                "role" => "user",
                "content" => "Given a sentence or paragraph, identify the primary nouns, verbs, and adjectives as core keywords, and treat other descriptive words as optional. Formulate a search query optimized for Wikimedia Commons' API using the following rules:


                1. **Core Keywords**: Extract and list the most important nouns, verbs, and adjectives.
                2. **Optional Keywords**: Identify secondary or descriptive words and combine them using the | operator.
                3. **Grouping**: Group core keywords together and add optional keywords within parentheses.
                4. **Exclusions**: Identify words that should be excluded from the search (if any) using the - operator.
                5. **Wildcard or Fuzzy Matching**: Apply wildcards (*) or fuzzy matching (~) to words that may have variations in spelling or form. Finally, if technical details such as '1080p', width or height of an image are mentioned, make sure to remove them.
                
                
                For example, try this sentence: \"An artist paints a beautiful, serene landscape with tall mountains, a flowing river, and vibrant wildflowers.\""
            ];


            $conversation[] = [
                "role" => "system",
                "content" => "artist paint landscape (beautiful | serene | vibrant) (mountain | river | wildflower)"
            ];
        }


        $conversation[] = ["role" => "user", "content" => "Great, now do the same for the following sentence: {$query}"];


        $resp = $chat->complete($conversation, $this->aiProvider, [
            'model' => $this->providerModel,
            'max_tokens' => 160,
            'temperature' => 0.9,
        ]);


        if (!$resp['ok']) {
            return (object)["status" => "error", "message" => $resp['error']];
        }


        $rewrittenPrompt = trim(isset($resp['content']) ? $resp['content'] : '');
        $conversation[] = ["role" => "system", "content" => $rewrittenPrompt];


        return [
            "prompt" => $rewrittenPrompt,
            "conversation" => $conversation
        ];
    }

    private function extractParameters($input)
    {
        global $xerte_toolkits_site;
        $chat = new AiChat($xerte_toolkits_site);


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


        $conversation[] = ["role" => "user", "content" => "Great, now repeat the process and use the exact same format, making sure to return nothing but the json, for the following user input: {$input}"];


        $resp = $chat->complete($conversation, $this->aiProvider, [
            'model' => $this->providerModel,
            'max_tokens' => 160,
            'temperature' => 0.9,
        ]);


        if (!$resp['ok']) {
            return (object)["status" => "error", "message" => $resp['error']];
        }


        $rewrittenPrompt = trim(isset($resp['content']) ? $resp['content'] : '');
        $conversation[] = ["role" => "system", "content" => $rewrittenPrompt];


        return [
            "prompt" => $rewrittenPrompt,
            "conversation" => $conversation
        ];
    }

    private function downloadImageFromWikimedia($imageUrl, $saveTo)
    {
        $curl = curl_init($imageUrl);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT => 120, //TODO: user agent must be more specific; stil unsure how exactly to call this
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
        ]);


        $imageData = curl_exec($curl);
        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);
            return (object)["status" => "error", "message" => "cURL error: " . $error_msg];
        }
        $http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        if ($http_status != 200) {
            return (object)["status" => "error", "message" => "Failed to download image. HTTP status code: " . $http_status];
        }


        $encodedName = basename(parse_url($imageUrl, PHP_URL_PATH));
        $decodedName = urldecode($encodedName);
        $savePath = rtrim($saveTo, '/') . '/' . $decodedName;


        if (file_put_contents($savePath, $imageData) === false) {
            return (object)["status" => "error", "message" => "Failed to save image."];
        }


        return (object)["status" => "success", "message" => "Image downloaded successfully.", "path" => $savePath];
    }

    public function sh_request($query, $target, $interpretPrompt, $overrideSettings, $settings)
    {
        if(!isset($_SESSION['toolkits_logon_id'])) {
            die("Session ID not set");
        }

        $downloadedPaths = [];

        $aiQuery = ($interpretPrompt === "true" || $interpretPrompt === true)
            ? $this->rewritePrompt($query)['prompt']
            : $query;

        if ($overrideSettings === "true" || $overrideSettings === true) {
            //todo again
            $aiParams = json_decode(json_encode($settings));
        } else {
            $tmp = $this->extractParameters($query);
            $aiParams = json_decode($tmp['prompt']);
        }

        $perPage = isset($settings['nri']) ? (int)$settings['nri'] : 5;
        $apiResponse = $this->GET_Wikimedia($aiQuery, $aiParams, $perPage);

        // Handle error either as array or object for robustness
        if ((is_object($apiResponse) && isset($apiResponse->status) && $apiResponse->status === 'error') ||
            (is_array($apiResponse) && isset($apiResponse['status']) && $apiResponse['status'] === 'error')) {
            $msg = is_object($apiResponse) ? $apiResponse->message : $apiResponse['message'];
            return (object)[
                'status' => 'error',
                'message' => $msg,
                'paths' => $downloadedPaths,
            ];
        }

        $path = rtrim($target, '/') . "/media";
        $this->ensureDir($path);

        global $xerte_toolkits_site;
        x_check_path_traversal($path, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified', 'folder');

        if (isset($apiResponse['query']['pages'])) {
            foreach ($apiResponse['query']['pages'] as $page) {
                if (isset($page['imageinfo'][0]['url'])) {
                    $url = $page['imageinfo'][0]['url'];
                    $downloadResult = $this->downloadImageFromWikimedia($url, $path);

                    if ($downloadResult->status === "success") {
                        $downloadedPaths[] = $downloadResult->path;

                        $imageInfo = $page['imageinfo'][0] ?? [];
                        $ext = $imageInfo['extmetadata'] ?? [];

                        $downloadedAt = (new DateTime('now'))->format(DateTimeInterface::ATOM);

                        // Prefer Artist from extmetadata; fallback to uploader user
                        $authorName = isset($ext['Artist']['value'])
                            ? trim(strip_tags($ext['Artist']['value']))
                            : ($imageInfo['user'] ?? 'Unknown');

                        $imageTitle = $page['title'] ?? '';
                        $originalImageUrl = $imageInfo['url'] ?? '';                 // direct file URL
                        $filePageUrl = $imageInfo['descriptionurl'] ?? $originalImageUrl; // Commons file page

                        $licenseUrl = $ext['LicenseUrl']['value'] ?? $filePageUrl;
                        $licenseName = isset($ext['LicenseShortName']['value'])
                            ? trim(strip_tags($ext['LicenseShortName']['value']))
                            : 'See file page';

                        $htmlEmbed =
                            "<p>Image by <a href=\"https://commons.wikimedia.org/wiki/User:$authorName\" target=\"_blank\">$authorName</a> on Wikimedia Commons. " .
                            "<a href=\"$filePageUrl\" target=\"_blank\">View Image</a>. " .
                            "<a href=\"$licenseUrl\" target=\"_blank\">License: $licenseName</a>.</p>";

                        $creditText =
                            "Image by $authorName, https://commons.wikimedia.org/wiki/User:$authorName\n" .
                            "Image Title: $imageTitle\n" .
                            "Original Image URL: $originalImageUrl\n" .
                            "File Page: $filePageUrl\n" .
                            "Downloaded at: $downloadedAt\n" .
                            "License: $licenseUrl\n" .
                            "\n" .
                            $htmlEmbed;
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
            }
        }

        return (object)[
            'status' => 'success',
            'message' => 'All images downloaded successfully.',
            'paths' => $downloadedPaths,
        ];
    }
}
