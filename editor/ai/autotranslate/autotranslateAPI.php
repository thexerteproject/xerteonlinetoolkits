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

$api = $_POST["api"];
$base_url = $_POST["baseUrl"];
$target_language = $_POST["targetLanguage"];

$allowed_apis = ['openai', 'deepl', 'googleautotranslate'];

//todo combine with api check from admin page
if (!in_array($api, $allowed_apis)){
    die(json_encode(["status" => "error", "message" => "api is not allowed"]));
}
//todo Alek convert api name to lowercase

//dynamically load needed api methods
require_once(dirname(__FILE__) . "/" . $api ."translateApi.php");

//dynamically initiate correct api class
$api_type = $api . 'translateApi';
$translateApi = new $api_type();

$result = $translateApi->tr_request($base_url, $target_language);

if ($result->status){
    echo json_encode($result);
} else {
    echo json_encode(["status" => "success", "result" => $result]);
}