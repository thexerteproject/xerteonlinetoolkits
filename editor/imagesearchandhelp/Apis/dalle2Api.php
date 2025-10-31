<?php
require_once __DIR__ . '/openaiImageApi.php';


class dalle2Api extends openaiImageApi
{
    protected $imageModel = 'dall-e-2';
    protected $saveSubdir = '/media';

    protected $rewriteSystemMessage = "You are an AI assistant helping to craft concise yet detailed prompts for generating photorealistic images with DALL·E 2. If the user's input is detailed, enhance the most important aspects and clarify where necessary. If the input is vague, add key details to ensure the final prompt includes specifics like primary elements, composition, and lighting. The output should resemble the following example in brevity and focus: 'Generate a photorealistic image of a cocktail in a tall Collins glass, with light pink and brown hues. The drink features a single large cylinder ice cube with a square piece of dried kelp as the garnish. The scene is set on a black glossy surface that reflects the drink and includes a simple arrangement of dark pebbles. Lighting is from the left, highlighting the texture of the drink and the glass, with a softly blurred white wall in the background.' Now, given the following input, craft a similarly concise and focused prompt: ";
    protected $rewriteMaxTokens = 180;
    protected $rewriteTemperature = 0.9;

    // DALL·E 2 supports generating multiple images via `n`, driven by settings['nri']
    protected function generateAndSave(string $prompt, array $settings, string $baseDir, string $size, array &$downloadedPaths)
    {
        $n = isset($settings['nri']) ? (int)$settings['nri'] : 1;
        $payload = [
            'prompt' => strip_tags($prompt),
            'model' => $this->imageModel,
            'size' => $size,
            'n' => $n,
        ];

        $details = [
            'imagemodel'      => $this->imageModel, // model name for logs
            'imagesrequested' => $n,                // how many we asked for
            'imagesize'       => $size,             // e.g. "1024x1024" (mapper will parse width/height)
        ];

        $res = $this->postImagesGenerations($payload);

        log_ai_request($res, 'imagegen', 'dalle2', $this->actor, $this->sessionId, $details);

        if (!$res->ok) {
            $msg = $res->json->error->message ?? ($res->error ?? ('HTTP ' . $res->status));
            return (object)['status' => 'error', 'message' => $msg];
        }

        foreach (($res->json->data ?? []) as $img) {
            if (!empty($img->url)) {
                $dl = $this->downloadBinary($img->url, $baseDir, 'dalle2');
                if ($dl->status !== 'success') {
                    return (object)[ 'status' => 'error', 'message' => $dl->message ];
                }
                $downloadedPaths[] = $dl->path;
            }
        }
        return (object)['status' => 'success'];
    }
}