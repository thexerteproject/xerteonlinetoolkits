<?php
require_once __DIR__ . '/openaiImageApi.php';

class gptimage1Api extends openaiImageApi
{
    protected $imageModel = 'gpt-image-1';
    protected $saveSubdir = '/media';

    protected $rewriteSystemMessage = null;

    // Override to handle base64 results
    protected function generateAndSave($prompt, array $settings, $baseDir, $size, array &$downloadedPaths)
    {
            $payload = [
                'model' => $this->imageModel,
                'prompt' => $prompt,
                'n' => 1,
                'size' => $size,
            ];
            $res = $this->postImagesGenerations($payload);
            $details = [
            'imagemodel'      => $this->imageModel, // model name for logs
            'imagesrequested' => 1,                // always defaults to 1 for gpt1
            'imagesize'       => $size,             // e.g. "1024x1024" (mapper will parse width/height)
                ];
            log_ai_request($res, 'imagegen', 'gpt1', $details);
            if (!$res->ok) {
                if (isset($res->json) && isset($res->json->error) && isset($res->json->error->message)) {
                    $msg = $res->json->error->message;
                } elseif (isset($res->error)) {
                    $msg = $res->error;
                } else {
                    $msg = 'HTTP ' . $res->status;
                }

                return (object) ['status' => 'error', 'message' => $msg];
            }


        $i = 1;
        $data = (isset($res->json) && isset($res->json->data) && is_array($res->json->data))
            ? $res->json->data
            : array();

        foreach ($data as $img) {
            if (!empty($img->b64_json)) {
                $bin  = base64_decode($img->b64_json);
                $file = rtrim($baseDir, '/') . '/img_' . ($i++) . '.png';

                if (file_put_contents($file, $bin) === false) {
                    return (object) array(
                        'status'  => 'error',
                        'message' => 'Failed to save image #' . ($i - 1),
                    );
                }

                $downloadedPaths[] = $file;
            }
        }

        return (object)['status' => 'success'];
    }
}