<?php
require_once __DIR__ . '/../BaseApi.php';
require_once __DIR__ . '/../Ai/AiChat.php';
use Ai\AiChat;
class pixabayApi extends BaseApi
{
    private function buildPixabayUrl($query, $aiParams, $perPage = 5, $page = 1)
    {
        global $xerte_toolkits_site;
        $apiKey = $xerte_toolkits_site->pixabay_key;
        $query = urlencode($this->clean($query));
        $url = "https://pixabay.com/api/?key={$apiKey}&q={$query}&per_page={$perPage}&page={$page}";

        if (isset($aiParams->pixabayOrientation) && $aiParams->pixabayOrientation !== 'unmentioned') {
            $url .= "&orientation=" . urlencode($aiParams->pixabayOrientation);
        }
        if (isset($aiParams->pixabayColors) && $aiParams->pixabayColors !== 'unmentioned') {
            $url .= "&colors=" . urlencode($aiParams->pixabayColors);
        }
        if (isset($aiParams->pixabayType) && $aiParams->pixabayType !== 'unmentioned') {
            $url .= "&image_type=" . urlencode($aiParams->pixabayType);
        }
        return $url;
    }

    private function GET_Pixabay($query, $aiParams, $perPage = 5, $page = 1)
    {
        if($perPage < 3){
            $perPage = 3;
        }

        $url = $this->buildPixabayUrl($query, $aiParams, $perPage, $page);
        $res = $this->httpGet($url);

        if (!$res->ok) {
            return (object) array(
                'status'  => 'error',
                'message' => isset($res->error) ? $res->error : ('HTTP ' . $res->status),
            );
        }

        if (isset($res->json->error)) {
            return (object)["status" => "error", "message" => "Error on API call: " . $res->json->error];
        }
        return $res->json;
    }

    private function rewritePrompt($query, $conversation = [])
    {
        global $xerte_toolkits_site;
        $chat = new AiChat($xerte_toolkits_site);


        if (empty($conversation)) {
            $conversation[] = [
                "role" => "user",
                "content" => "Given a sentence or paragraph, identify the primary nouns, verbs, and adjectives as core keywords, and treat other descriptive words as optional. Formulate a search query optimized for Pixabay's API using the following rules:


1. **Core Keywords**: Extract and list the most important nouns, verbs, and adjectives.
2. **Optional Keywords**: Identify secondary or descriptive words and combine them using the | operator.
3. **Grouping**: Group core keywords together and add optional keywords within parentheses.
4. **Exclusions**: Identify words that should be excluded from the search (if any) using the - operator.
5. **Wildcard or Fuzzy Matching**: Apply wildcards (*) or fuzzy matching (~) to words that may have variations in spelling or form.


For example, try this sentence: \"An artist paints a beautiful, serene landscape with tall mountains, a flowing river, and vibrant wildflowers.\""
            ];
            $conversation[] = [
                "role" => "system",
                "content" => "artist paint landscape (beautiful | serene | vibrant) (mountain | river | wildflower)"
            ];
        }

        $conversation[] = ["role" => "user", "content" => "Great, now respond in the exact same manner, writing only the query, for the following sentence: {$query}"];

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
                    orientation: horizontal, vertical (pick one)
                    color: accepts grayscale, transparent, red, orange, yellow, green, turquoise, blue, lilac, pink, white, gray, black, brown (pick one, or multiple based on description separated by commas)
                    image_type: accepts photo, illustration, vector (pick one, only when explicitly specified)
                    If something was not mentioned, then simply return 'unmentioned' for that field.
                    To start with, parse this user prompt:
                    'Show me a large photo of a golden sunset on the beach with beautiful red and yellow hues scintillating through the clouds and no people'"
            ];
            $conversation[] = [
                "role" => "system",
                "content" => "{
                \"pixabayOrientation\": \"unmentioned\",
                \"pixabayColors\": \"orange, red, yellow\",
                \"pixabayType\": \"photo\",
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

        $text = trim(isset($resp['content']) ? $resp['content'] : '');
        // Be forgiving: strip code fences if present
        $text = preg_replace('/^```json|```$/m', '', $text);
        $decoded = json_decode($text);
        if (!$decoded) {
            return (object)['status' => 'error', 'message' => 'Failed to parse JSON from AI response.', 'raw' => $text];
        }
        return (object)['status' => 'success', 'params' => $decoded];
    }

    private function downloadImageFromPixabay($imageUrl, $saveTo)
    {
        $encodedName = basename(parse_url($imageUrl, PHP_URL_PATH));
        //todo use this
        $decodedName = urldecode($encodedName);
        $dl = $this->downloadBinary($imageUrl, $saveTo, 'pixabay_');
        if ($dl->status !== 'success') {
            return (object)["status" => "error", "message" => $dl->message];
        }
        return (object)["status" => "success", "message" => "Image downloaded successfully.", "path" => $dl->path];
    }

    public function sh_request($query, $target, $interpretPrompt, $overrideSettings, $settings)
    {
        if(!isset($_SESSION['toolkits_logon_id'])) {
            die("Session ID not set");
        }
        $downloadedPaths = [];

        $aiQuery = ($interpretPrompt === 'true' || $interpretPrompt === true)
            ? $this->rewritePrompt($query)['prompt']
            : $query;

        if ($overrideSettings === 'false' || $overrideSettings === false) {
            //todo alek again?
            $aiParams = json_decode(json_encode($settings));
        } else {
            $tmp = $this->extractParameters($query);
            $aiParams = $tmp->params;
        }

        $perPage = isset($settings['nri']) ? (int)$settings['nri'] : 5;
        $apiResponse = $this->GET_Pixabay($aiQuery, $aiParams, $perPage);

        if (isset($apiResponse->status) && $apiResponse->status === 'error') {
            return (object)[
                'status' => 'error',
                'message' => $apiResponse->message,
                'paths' => $downloadedPaths,
            ];
        }

        $path = rtrim($target, '/') . "/media";
        $this->ensureDir($path);
        global $xerte_toolkits_site;
        x_check_path_traversal($path, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified', 'folder');

        $hits = (isset($apiResponse->hits) && is_array($apiResponse->hits))
            ? $apiResponse->hits
            : array();

        foreach ($hits as $photo) {
            $url = $photo->largeImageURL; // best quality
            $downloadResult = $this->downloadImageFromPixabay($url, $path);
            if ($downloadResult->status === 'success') {
                $downloadedPaths[] = $downloadResult->path;

                // Credits + HTML snippet
                $authorName = $photo->user;
                $authorProfileUrl = "https://pixabay.com/users/" . $authorName . "-" . $photo->user_id;
                $originalPhotoUrl = $photo->pageURL;
                $htmlEmbed = "<p>Photo by <a href=\"$authorProfileUrl\" target=\"_blank\">$authorName</a>. <a href=\"$originalPhotoUrl\" target=\"_blank\">View Photo</a>.</p>";
                $creditText = "Photo by $authorName, $authorProfileUrl
                Original Photo URL: $originalPhotoUrl
                $htmlEmbed";

                $infoFilePath = pathinfo($downloadResult->path, PATHINFO_FILENAME) . '.txt';
                file_put_contents($path . '/' . $infoFilePath, $creditText);
        } else {
                return (object)[
                'status' => 'error',
                'message' => 'Failed to download one or more images: ' . $downloadResult->message,
                'paths' => $downloadedPaths,];
            }
        }

        return (object)[
        'status' => 'success',
        'message' => 'All images downloaded successfully.',
        'paths' => $downloadedPaths,
        ];
    }
}