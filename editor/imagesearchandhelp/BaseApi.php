<?php
require_once __DIR__.'/../ai/logging/log_ai_request.php';
require_once(str_replace('\\', '/', __DIR__) . "/../../config.php");

abstract class BaseApi
{
    protected $xerte_toolkits_site;
    protected $aiProvider;
    protected $providerModel;

    public function __construct($aiProvider, $providerModel='')
    {
        $this->aiProvider = $aiProvider;
        $this->providerModel = $providerModel;

    }

    protected function clean($text)
    {
        return trim(strip_tags($text));
    }

    // Extracts json from markdown fenced code blocks and addresses a couple of other potential issues which pop up in jsons returned by LLMs like improper UTF-8 characters
    protected function extractAndDecodeJson($input, $assoc = true){
        // Ensure string
        $s = is_string($input) ? $input : (string)$input;

        // Remove UTF-8 BOM if present and trim
        $s = preg_replace('/^\xEF\xBB\xBF/', '', $s);
        $s = trim($s);

        $json = $s;

        // Extract first fenced code block if present: ```json ... ``` or ``` ... ```
        if (preg_match('/```(?:\s*json)?\s*\R(.*?)\R```/is', $s, $m)) {
            $json = trim($m[1]);
        } else {
            // Fallback. strip fences if the content is essentially fenced i.e has only ```
            $json = preg_replace('/^\s*```(?:\s*json)?\s*\R/i', '', $json);
            $json = preg_replace('/\R\s*```\s*$/', '', $json);
            $json = trim($json);
        }

        return json_decode($json, $assoc);
    }


    protected function httpPostJson($url, array $payload, array $headers = [], $timeout = 60)
    {
        $ch = curl_init($url);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => $timeout,
        ]);

        $raw = curl_exec($ch);

        if ($raw === false) {
            $err = curl_error($ch);
            curl_close($ch);
            return (object)["ok" => false, "status" => 0, "error" => "cURL error: $err"];
        }
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return (object)[
            "ok" => $status >= 200 && $status < 300,
            "status" => $status,
            "raw" => $raw,
            "json" => json_decode($raw)
        ];
    }


    protected function httpGet($url, array $headers = [], $timeout = 60)
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => $timeout,
        ]);
        $raw = curl_exec($ch);
        if ($raw === false) {
            $err = curl_error($ch);
            curl_close($ch);
            return (object)["ok" => false, "status" => 0, "error" => "cURL error: $err"];
        }
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);


        return (object)[
            "ok" => $status >= 200 && $status < 300,
            "status" => $status,
            "raw" => $raw,
            "json" => json_decode($raw)
        ];
    }


    protected function ensureDir($dir)
    {
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
    }


    protected function downloadBinary($url, $saveDir, $prefix = '', $filename = null)
    {
        global $xerte_toolkits_site;
        x_check_path_traversal($saveDir, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified', 'folder');
        $this->ensureDir($saveDir);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_TIMEOUT => 120,
            // Optional but helps with some CDNs:
            CURLOPT_USERAGENT => 'Mozilla/5.0',
        ]);

        $data = curl_exec($ch);
        if ($data === false) {
            $err = curl_error($ch);
            curl_close($ch);
            return (object)["status" => "error", "message" => "cURL error: $err"];
        }

        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);   // e.g. image/jpeg
        $effectiveUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL); // after redirects
        curl_close($ch);

        if (!in_array($status, [200, 206], true)) {
            return (object)["status" => "error", "message" => "Failed to download. HTTP $status"];
        }

        // Build filename if not provided
        if ($filename === null) {
            $pathPart = parse_url($effectiveUrl ?: $url, PHP_URL_PATH);
            $base = basename($pathPart ?: '');
            if ($base === '' || $base === '/' || $base === '.') {
                $base = "img_" . uniqid();
            }
            $filename = $prefix . $base;
        }

        // Ensure extension exists (infer from URL query or content type)
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        if ($ext === '') {
            // 1) try query param fm=jpg etc
            $query = parse_url($effectiveUrl ?: $url, PHP_URL_QUERY);
            parse_str($query ?: '', $q);
            if (!empty($q['fm']) && preg_match('~^[a-z0-9]+$~i', $q['fm'])) {
                $extGuess = strtolower($q['fm']);
                if ($extGuess === 'jpeg') $extGuess = 'jpg';
                $filename .= "." . $extGuess;
            } else {
                // 2) try Content-Type
                $map = [
                    'image/jpeg' => 'jpg',
                    'image/jpg' => 'jpg',
                    'image/png' => 'png',
                    'image/gif' => 'gif',
                    'image/webp' => 'webp',
                    'image/svg+xml' => 'svg',
                    'application/pdf' => 'pdf',
                ];
                $ct = strtolower(trim(explode(';', (string)$contentType)[0]));
                $filename .= "." . ($map[$ct] ?? 'bin');
            }
        }

        $path = rtrim($saveDir, '/\\') . DIRECTORY_SEPARATOR . $filename;

        if (file_put_contents($path, $data) === false) {
            return (object)["status" => "error", "message" => "Failed to save file."];
        }

        return (object)["status" => "success", "path" => $path];
    }
}