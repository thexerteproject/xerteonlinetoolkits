<?php
require_once __DIR__ . '/../BaseApi.php';
require_once __DIR__ . '/../Ai/AiChat.php';
use Ai\AiChat;

class pexelsApi extends BaseApi
{
    /** Build Pexels URL with optional filters */
    private function buildPexelsUrl($query, $aiParams, $perPage = 3, $page = 1)
    {
        $query = urlencode($this->clean($query));
        $url = "https://api.pexels.com/v1/search?query={$query}&per_page={$perPage}&page={$page}";


        // Accept both legacy names and normalized ones
        $orientation = isset($aiParams->pexelsOrientation)
            ? $aiParams->pexelsOrientation
            : (isset($aiParams->orientation) ? $aiParams->orientation : 'unmentioned');

        $color = isset($aiParams->pexelsColor)
            ? $aiParams->pexelsColor
            : (isset($aiParams->color) ? $aiParams->color : 'unmentioned');

        $size = isset($aiParams->pexelsSize)
            ? $aiParams->pexelsSize
            : (isset($aiParams->size) ? $aiParams->size : 'unmentioned');


        if (!empty($orientation) && $orientation !== 'unmentioned') {
            $url .= "&orientation=" . urlencode($orientation);
        }
        if (!empty($color) && $color !== 'unmentioned') {
            $url .= "&colors=" . urlencode($color);
        }
        if (!empty($size) && $size !== 'unmentioned') {
            $url .= "&size=" . urlencode($size);
        }
        return $url;
    }

    private function getFromPexels($query, $aiParams, $perPage = 3, $page = 1)
    {
        global $xerte_toolkits_site;

        $headers = [
            'Authorization: ' . $xerte_toolkits_site->pexels_key,
            'Content-Type: application/json',
        ];
        $url = $this->buildPexelsUrl($query, $aiParams, $perPage, $page);
        $res = $this->httpGet($url, $headers);
        if (!$res->ok) {
            return (object) array(
                'status'  => 'error',
                'message' => isset($res->error) ? $res->error : ('HTTP ' . $res->status),
            );
        }
        if (isset($res->json->error)) {
            return (object)["status" => "error", "message" => "API error: " . $res->json->error];
        }
        return $res->json;
    }

    /**
     * Extracts {orientation,color,size} from natural language using any AI provider
     */
    private function extractParameters($input, array $options = [])
    {
        global $xerte_toolkits_site;
        $chat = new AiChat($xerte_toolkits_site);

        $conversation = [];
        $conversation[] = [
            'role' => 'user',
            'content' => "Given input from a user, parse it for relevant information about the following and return a JSON detailing these pieces of information:\n orientation: landscape, portrait, or square (pick one)\n size: small, medium, large (pick one)\n color: Accepts a hex color code (e.g., #ff0000) or a color name (e.g., red, orange). (pick one, which should best represent the average or most prominent color based on the input)\n\n If something was not mentioned, then simply return 'unmentioned' for that field.\n\n To start with, parse this user prompt:\n 'Show me a large photo of a golden sunset on the beach with beautiful red and yellow hues scintillating through the clouds and no people'"
        ];
        $conversation[] = [
            'role' => 'assistant',
            'content' => '{"orientation":"unmentioned","color":"orange","size":"large"}'
        ];
        $conversation[] = [
            'role' => 'user',
            'content' => "Great, now repeat the process and use the exact same format, making sure to return nothing but the json, for the following user input: {$input}"
        ];

        $resp = $chat->complete($conversation, $this->aiProvider, $options + ['max_tokens' => 160, 'temperature' => 0.2]);
        if (!$resp['ok']) {
            return (object)['status' => 'error', 'message' => $resp['error']];
        }

        $text = trim(isset($resp['content']) ? $resp['content'] : '');
        $text = preg_replace('/^```json|```$/m', '', $text);
        $decoded = json_decode($text);
        if (!$decoded) {
            return (object)['status' => 'error', 'message' => 'Failed to parse JSON from AI response.', 'raw' => $text];
        }
        return (object)['status' => 'success', 'params' => $decoded];
    }

    private function rewritePrompt($query, array $options = [])
    {
        global $xerte_toolkits_site;
        $chat = new AiChat($xerte_toolkits_site);
        $messages = [
            ['role' => 'system', 'content' => 'Rewrite the following user query to be more effective for stock-photo search APIs (Pexels/Unsplash). Keep it concise; preserve key nouns and adjectives.'],
            ['role' => 'user', 'content' => $query],
        ];
        $resp = $chat->complete($messages, $this->aiProvider, $options + ['max_tokens' => 160, 'temperature' => 0.7]);
        return $resp['ok']
            ? trim(isset($resp['content']) ? $resp['content'] : $query)
            : $query;
    }

    public function sh_request($query, $target, $interpretPrompt, $overrideSettings, $settings)
    {
        if(!isset($_SESSION['toolkits_logon_id'])) {
            die("Session ID not set");
        }

        $downloadedPaths = [];
        $baseDir = rtrim($target, '/\\') . '/media';
        $this->ensureDir($baseDir);

        global $xerte_toolkits_site;
        x_check_path_traversal($baseDir, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');


        $aiOptions = ['model' => $this->providerModel];

        $aiQuery = ($interpretPrompt === true || $interpretPrompt === 'true')
            ? $this->rewritePrompt($query, $aiOptions)
            : $query;


        if ($overrideSettings === false || $overrideSettings === 'false') {
            $aiParams = $settings;
        } else {
            $ex = $this->extractParameters($query, $aiOptions);
            if ($ex->status !== 'success') {
                return (object)[ 'status' => 'error', 'message' => $ex->message, 'paths' => $downloadedPaths ];
            }
            $aiParams = $ex->params;
        }

        $perPage = isset($settings['nri']) ? (int)$settings['nri'] : 3;
        $apiResponse = $this->getFromPexels($aiQuery, $aiParams, $perPage);

        if (isset($apiResponse->status) && $apiResponse->status === 'error') {
            return (object)[ 'status' => 'error', 'message' => $apiResponse->message, 'paths' => $downloadedPaths ];
        }

        $photos = (isset($apiResponse->photos) && is_array($apiResponse->photos))
            ? $apiResponse->photos
            : array();

        foreach ($photos as $photo) {
            $url = $photo->src->original;
            $encodedName = basename(parse_url($url, PHP_URL_PATH));
            $decodedName = urldecode($encodedName);
            $dl = $this->downloadBinary($url, $baseDir, '', $decodedName);
            if ($dl->status !== 'success') {
                return (object)[ 'status' => 'error', 'message' => $dl->message, 'paths' => $downloadedPaths ];
            }
            $downloadedPaths[] = $dl->path;


            // credit file next to image
            $authorName = $photo->photographer;
            $authorProfileUrl = $photo->photographer_url;
            $originalPhotoUrl = $photo->url;
            $creditText = "Photo by $authorName, $authorProfileUrl\nOriginal Photo URL: $originalPhotoUrl\n";
            $infoFilePath = pathinfo($dl->path, PATHINFO_FILENAME) . '.txt';
            file_put_contents($baseDir . '/' . $infoFilePath, $creditText);
        }


        return (object)[
            'status' => 'success',
            'message' => 'All images downloaded successfully.',
            'paths' => $downloadedPaths,
        ];
    }

}