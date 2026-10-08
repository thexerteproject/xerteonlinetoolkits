<?php
/**
 * Parse JSON or form bodies and merge into a flat parameter array.
 */
class ApiRequest
{
    /**
     * @return array<string,mixed>
     */
    public static function getParams(): array
    {
        $params = array_merge($_GET, $_POST);
        $ct = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
        if (stripos($ct, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            if ($raw !== false && $raw !== '') {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    $params = array_merge($params, $decoded);
                }
            }
        }
        return $params;
    }
}
