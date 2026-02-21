<?php

final class ModelLister
{
    /** @var int */
    private $timeoutSeconds;

    public function __construct($timeoutSeconds = 20)
    {
        $this->timeoutSeconds = (int)$timeoutSeconds;
    }

    /**
     * @param object $xerte_toolkits_site
     * @param string $vendorName
     * @param string $typeProperty
     * @return string[]
     */
    public function listModels($xerte_toolkits_site, $vendorName, $typeProperty = 'id')
    {
        $vendor = strtolower(trim((string)$vendorName));
        $apiKey = $this->getApiKey($xerte_toolkits_site, $vendor);

        if (($vendor === 'mistral')  || ($vendor === 'mistralenc')) {
            return $this->listMistralModels($apiKey, $typeProperty);
        }

        if (($vendor === 'openai') || ($vendor === 'openaienc')) {
            return $this->listOpenAIModels($apiKey, $typeProperty);
        }

        if ($vendor === 'anthropic') {
            return $this->listAnthropicModels($apiKey, $typeProperty);
        }

        throw new InvalidArgumentException("Unsupported vendor: " . $vendorName);
    }

    private function listMistralModels($apiKey, $typeProperty)
    {
        $url = 'https://api.mistral.ai/v1/models';
        $headers = array(
            'Authorization: Bearer ' . $apiKey,
            'Accept: application/json',
        );

        $json = $this->httpGetJson($url, $headers);

        // Mistral responses can be { data: [...] } or sometimes directly [...]
        $items = array();

        if (is_array($json) && isset($json['data']) && is_array($json['data'])) {
            $items = $json['data'];
        } elseif (is_array($json) && $this->looksLikeList($json)) {
            $items = $json;
        }

        // Prefer identifier-like fields
        return $this->pluckStrings($items, $typeProperty, array('id', 'name'));
    }

    private function listOpenAIModels($apiKey, $typeProperty)
    {
        $url = 'https://api.openai.com/v1/models';
        $headers = array(
            'Authorization: Bearer ' . $apiKey,
            'Accept: application/json',
        );

        $json = $this->httpGetJson($url, $headers);

        $items = array();
        if (isset($json['data']) && is_array($json['data'])) {
            $items = $json['data'];
        }

        return $this->pluckStrings($items, $typeProperty, array('id'));
    }

    private function listAnthropicModels($apiKey, $typeProperty)
    {
        $baseUrl = 'https://api.anthropic.com/v1/models';
        $headers = array(
            'X-Api-Key: ' . $apiKey,
            'anthropic-version: 2023-06-01',
            'Accept: application/json',
        );

        $allItems = array();
        $afterId = null;
        $hasMore = true;

        while ($hasMore) {
            $query = array('limit' => 100);
            if ($afterId !== null && $afterId !== '') {
                $query['after_id'] = $afterId;
            }

            $url = $baseUrl . '?' . http_build_query($query);

            $json = $this->httpGetJson($url, $headers);

            $pageItems = array();
            if (isset($json['data']) && is_array($json['data'])) {
                $pageItems = $json['data'];
            }

            $allItems = array_merge($allItems, $pageItems);

            $hasMore = !empty($json['has_more']);
            $afterId = isset($json['last_id']) ? $json['last_id'] : null;

            // Prevent infinite looping if API says has_more but doesn't provide last_id
            if ($hasMore && empty($afterId)) {
                $hasMore = false;
            }
        }

        // Prefer "id" as identifier; display_name is useful but not for routing calls.
        return $this->pluckStrings($allItems, $typeProperty, array('id', 'display_name'));
    }

    private function getApiKey($xerte_toolkits_site, $vendor)
    {
        $prop = $vendor . '_key';

        if (!is_object($xerte_toolkits_site) || !property_exists($xerte_toolkits_site, $prop)) {
            throw new RuntimeException("Missing API key property on \$xerte_toolkits_site: " . $prop);
        }

        $key = (string)$xerte_toolkits_site->{$prop};

        if (trim($key) === '') {
            throw new RuntimeException("Empty API key for vendor '" . $vendor . "' (property: " . $prop . ")");
        }

        return $key;
    }

    /**
     * GET JSON and decode; throws on HTTP errors, cURL errors, or invalid JSON.
     *
     * @param string $url
     * @param string[] $headers
     * @return array
     */
    private function httpGetJson($url, array $headers)
    {
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPGET, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeoutSeconds);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $raw = curl_exec($ch);

        if ($raw === false) {
            $err = curl_error($ch);
            curl_close($ch);
            throw new RuntimeException("cURL error: " . $err);
        }

        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($status < 200 || $status >= 300) {
            $snippet = mb_substr($raw, 0, 500);
            throw new RuntimeException("HTTP " . $status . " from " . $url . ". Body (first 500 chars): " . $snippet);
        }

        $json = json_decode($raw, true);

        if (!is_array($json)) {
            $snippet = mb_substr($raw, 0, 500);
            throw new RuntimeException("Invalid JSON from " . $url . ". Body (first 500 chars): " . $snippet);
        }

        return $json;
    }

    /**
     * PHP 7.2 replacement for array_is_list:
     * returns true if keys are 0..n-1.
     */
    private function looksLikeList(array $arr)
    {
        $i = 0;
        foreach ($arr as $k => $_) {
            if ($k !== $i) {
                return false;
            }
            $i++;
        }
        return true;
    }

    /**
     * Extract strings from a list of associative arrays.
     * Tries $preferredField first, then fallback fields in order.
     *
     * @param array $items
     * @param string $preferredField
     * @param string[] $fallbackFields
     * @return string[]
     */
    private function pluckStrings(array $items, $preferredField, array $fallbackFields)
    {
        $out = array();

        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }

            $value = isset($item[$preferredField]) ? $item[$preferredField] : null;

            if ($value === null || $value === '') {
                foreach ($fallbackFields as $field) {
                    if (isset($item[$field]) && $item[$field] !== null && $item[$field] !== '') {
                        $value = $item[$field];
                        break;
                    }
                }
            }

            if (is_string($value)) {
                $value = trim($value);
                if ($value !== '') {
                    $out[] = $value;
                }
            }
        }

        // Make output stable for UIs
        $out = array_values(array_unique($out));
        sort($out, SORT_STRING);

        return $out;
    }
}
