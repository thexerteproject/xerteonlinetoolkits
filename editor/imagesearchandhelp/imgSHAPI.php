<?php

//todo add authentication!
//if (!isset($_SESSION['toolkits_logon_username']) && !is_user_admin()) {
//    _debug("Session is invalid or expired");
//    die('{"status": "error", "message": "Session is invalid or expired"}');
//}
//check if request has required attributes
//if (!isset($_POST['type'])) {
//    _debug("type is not set");
//    die('{"status": "error", "message": "type is not set, contact your system administrator"}');
//}elseif (!isset($_POST["prompt"]) && $_POST["prompt"] !== ""){
//    _debug("prompt is empty");
//    die('{"status": "error", "message": "prompt must not be empty"}');
//}
$query = $_POST["query"];
$api = $_POST["api"] ?? 'pexels';
$url = $_POST["target"];
$interpretPrompt = $_POST["interpretPrompt"];
$overrideSettings = $_POST["overrideSettings"];
$settings = $_POST["settings"];

$allowed_apis = ['pexels','pixabay', 'dalle2', 'dalle3', 'unsplash', 'wikimedia'];
if (!in_array($api, $allowed_apis)){
    die(json_encode(["status" => "error", "message" => "api is not allowed"]));
}

//dynamically load needed api methods
require_once(dirname(__FILE__) . "/" . $api ."Api.php");

//dynamically initiate correct api class
$api_type = $api . 'Api';
$imgshApi = new $api_type();

$result = $imgshApi->sh_request($query, $url, $interpretPrompt, $overrideSettings, $settings);

if ($result->status){
    echo json_encode($result);
} else {
    echo json_encode(["status" => "success", "result" => $result]);
}