<?php
/**
 * JSON API responses (no HTML fragments).
 */
class ApiResponse
{
    public static function sendJson(int $httpStatus, array $body): void
    {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=UTF-8');
            http_response_code($httpStatus);
        }
        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * @param mixed $data Payload on success
     */
    public static function success($data = null, int $httpStatus = 200): void
    {
        $payload = array('ok' => true);
        if ($data !== null) {
            $payload['data'] = $data;
        }
        self::sendJson($httpStatus, $payload);
    }

    public static function error(int $httpStatus, string $code, string $message, ?array $details = null): void
    {
        $payload = array(
            'ok' => false,
            'error' => array(
                'code' => $code,
                'message' => $message,
            ),
        );
        if ($details !== null) {
            $payload['error']['details'] = $details;
        }
        self::sendJson($httpStatus, $payload);
    }
}
