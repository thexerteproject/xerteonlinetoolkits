<?php

require_once __DIR__ . '/../BaseApi.php';
require_once __DIR__ . '/../Ai/AiChat.php';
use Ai\AiChat;

abstract class openaiImageApi extends BaseApi
{
    /** Child classes set these */
    protected $imageModel = '';
    protected $saveSubdir = '/media';

    protected $prefix = '';

    protected $rewriteSystemMessage = null;
    protected $rewriteMaxTokens = 500;
    protected $rewriteTemperature = 0.9;


    protected function rewritePrompt(string $query): string
    {
        global $xerte_toolkits_site;
        if (empty($this->rewriteSystemMessage)) {
            return $query; // no rewrite requested by subclass
        }
        $chat = new AiChat($xerte_toolkits_site);
        $messages = [
            ['role' => 'system', 'content' => $this->rewriteSystemMessage],
            ['role' => 'user', 'content' => $query],
        ];
        $resp = $chat->complete($messages, $this->aiProvider, [
            'model' => $this->providerModel,
            'max_tokens' => $this->rewriteMaxTokens,
            'temperature' => $this->rewriteTemperature,
        ]);
        return ($resp['ok'] && isset($resp['content'])) ? trim($resp['content']) : $query;
    }

    /** POST helper for OpenAI Images API */
    protected function postImagesGenerations(array $payload)
    {
        global $xerte_toolkits_site;
        //todo move over to dalle key
        $headers = [
            'Authorization: Bearer ' . $xerte_toolkits_site->openai_key,
            'Content-Type: application/json',
        ];
        return $this->httpPostJson('https://api.openai.com/v1/images/generations', $payload, $headers, 120);
    }


    /** Default generator expects URL-based results and downloads them. Subclasses can override. */
    protected function generateAndSave(string $prompt, array $settings, string $baseDir, string $size, array &$downloadedPaths)
    {
        $payload = [
            'prompt' => strip_tags($prompt),
            'model' => $this->imageModel,
            'size' => $size,
        ];

        $details = [
            'imagemodel'      => $this->imageModel, // model name for logs
            'imagesrequested' => 1,                // always defaults to 1 for dalle3
            'imagesize'       => $size,             // e.g. "1024x1024" (mapper will parse width/height)
        ];
        $res = $this->postImagesGenerations($payload);
        //Dalle3 is the only service which currently makes use of this; if more models are added, it may be necessary to pass which one for the log
        log_ai_request($res, 'imagegen', 'dalle3', $details);
        if (!$res->ok) {
            $msg = $res->json->error->message ?? ($res->error ?? ('HTTP ' . $res->status));
            return (object)['status' => 'error', 'message' => $msg];
        }
        foreach (($res->json->data ?? []) as $img) {
            if (!empty($img->url)) {
                $dl = $this->downloadBinary($img->url, $baseDir, $this->prefix);
                if ($dl->status !== 'success') {
                    return (object)[ 'status' => 'error', 'message' => $dl->message ];
                }
                $downloadedPaths[] = $dl->path;
            }
        }
        return (object)['status' => 'success'];
    }

    public function sh_request($query, $target, $interpretPrompt, $overrideSettings, $settings, $size = '1024x1024')
    {
        $downloadedPaths = [];
        // Build exact save path style per subclass
        $baseDir = rtrim($target, '/') . $this->saveSubdir;
        $this->ensureDir($baseDir);
        $finalPrompt = ($interpretPrompt === true || $interpretPrompt === 'true')
            ? $this->rewritePrompt($query)
            : $query;


        $gen = $this->generateAndSave($finalPrompt, (array)$settings, $baseDir, $size, $downloadedPaths);
        if ($gen->status === 'error') {
            return (object)[ 'status' => 'error', 'message' => $gen->message, 'paths' => $downloadedPaths ];
        }


        return (object)[
            'status' => 'success',
            'message' => 'Images downloaded successfully.',
            'paths' => $downloadedPaths,
        ];
    }
}