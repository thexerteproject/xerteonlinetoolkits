<?php
/**
 * Subprocess runner for `website_code/api/v1/index.php`.
 *
 * Usage (called by tests):
 *   php run_api.php METHOD ROUTE PARAMS_B64URL SESSION_B64URL
 */

if ($argc < 3) {
    fwrite(STDERR, "Usage: php run_api.php METHOD ROUTE [PARAMS_JSON] [SESSION_JSON]\n");
    exit(2);
}

$method = strtoupper((string) $argv[1]);
$route = (string) $argv[2];
$params = array();
$session = array();

function api_test_decode_b64url_json($s)
{
    if ($s === null || $s === '') return array();
    $s = (string) $s;
    // On Windows, callers may pass literal quotes around args.
    if ((strlen($s) >= 2) && (($s[0] === '"' && $s[strlen($s) - 1] === '"') || ($s[0] === "'" && $s[strlen($s) - 1] === "'"))) {
        $s = substr($s, 1, -1);
    }
    $s = strtr($s, '-_', '+/');
    $pad = strlen($s) % 4;
    if ($pad) $s .= str_repeat('=', 4 - $pad);
    $json = base64_decode($s, true);
    if ($json === false) return array();
    $decoded = json_decode($json, true);
    return is_array($decoded) ? $decoded : array();
}

$params = api_test_decode_b64url_json($argv[3] ?? '');
$session = api_test_decode_b64url_json($argv[4] ?? '');

// Minimal server vars expected by config.php
$_SERVER['HTTP_HOST'] = $_SERVER['HTTP_HOST'] ?? 'localhost';
$_SERVER['SERVER_PORT'] = $_SERVER['SERVER_PORT'] ?? 80;
$_SERVER['REQUEST_METHOD'] = $method;
$_SERVER['HTTPS'] = $_SERVER['HTTPS'] ?? '';

// Set GET/POST params so ApiRequest can read them.
$_GET = array('route' => $route);
$_POST = array();
if ($method === 'GET') {
    $_GET = array_merge($_GET, $params);
} else {
    $_POST = array_merge($_POST, $params);
}

// Load app config once, start session, then apply the desired session snapshot.
require_once __DIR__ . '/../../config.php';
if (session_status() !== PHP_SESSION_ACTIVE) {
    @session_start();
}
if (!empty($session)) {
    foreach ($session as $k => $v) {
        $_SESSION[$k] = $v;
    }
}

// The API dispatcher uses `exit;` on all code paths.
// Use a shutdown function so we always print a single wrapper JSON payload.
ob_start();
register_shutdown_function(function () {
    $raw = '';
    if (ob_get_level() > 0) {
        $raw = (string) ob_get_clean();
    }
    $status = http_response_code();
    echo json_encode(array(
        'httpStatus' => $status,
        'raw' => $raw,
    ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
});

require __DIR__ . '/../../website_code/api/v1/index.php';

