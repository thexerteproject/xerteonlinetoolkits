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

    protected function clean(string $text): string
    {
        return trim(strip_tags($text));
    }


    protected function httpPostJson(string $url, array $payload, array $headers = [], int $timeout = 60)
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


    protected function httpGet(string $url, array $headers = [], int $timeout = 60)
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


    protected function ensureDir(string $dir)
    {
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
    }


    protected function downloadBinary(string $url, string $saveDir, string $prefix = '', ?string $filename = null)
    {
        global $xerte_toolkits_site;
        x_check_path_traversal($saveDir, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');
        $this->ensureDir($saveDir);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_TIMEOUT => 120,
        ]);
        $data = curl_exec($ch);
        if ($data === false) {
            $err = curl_error($ch);
            curl_close($ch);
            return (object)["status" => "error", "message" => "cURL error: $err"];
        }
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($status !== 200) {
            return (object)["status" => "error", "message" => "Failed to download. HTTP $status"];
        }


        if ($filename === null) {
            $filename = basename(parse_url($url, PHP_URL_PATH) ?: ("img_" . uniqid() . ".bin"));
            $filename = $prefix . $filename;
        }
        $path = rtrim($saveDir, '/\\') . '/' . $filename;


        if (file_put_contents($path, $data) === false) {
            return (object)["status" => "error", "message" => "Failed to save file."];
        }
        return (object)["status" => "success", "path" => $path];
    }
}