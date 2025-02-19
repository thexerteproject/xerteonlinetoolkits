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

$prompt_params = $_POST["prompt"] ?? null;
$type = $_POST["type"];
$ai_api = $_POST["api"] ?? 'openai';
$file_url = $_POST["url"] ?? 'None';
$textSnippet = $_POST["textSnippet"];
$context = $_POST["context"] ?? 'None';
$useContext = $_POST["useContext"] ?? 'false';
$baseUrl = $_POST["baseUrl"];
$contextScope = $_POST["contextScope"];
$modelTemplate = $_POST["modelTemplate"];

$allowed_apis = ['openai', 'anthropic', 'mistralai'];
//todo combine with api check from admin page
if (!in_array($ai_api, $allowed_apis)){
    die(json_encode(["status" => "error", "message" => "api is not allowed"]));
}

//dynamically load needed api methods
require_once(dirname(__FILE__) . "/" . $ai_api ."Api.php");

//dynamically initiate correct api class
$api_type = $ai_api . 'Api';
$aiApi = new $api_type($ai_api);
switch ($ai_api){
    case 'openai':
        //Select between a construct, 2 part approach or a single response approach
        if ($modelTemplate=="construct"){
            $newParams = $aiApi->ai_request($prompt_params,$type, $file_url, $textSnippet, $baseUrl, false, $contextScope, $modelTemplate);

            $key_value_array = json_decode($newParams, true);

            $newType = $key_value_array[array_key_first($key_value_array)];
            $useContext = true;
            $result = $aiApi->ai_request($key_value_array, $newType, $file_url, $textSnippet, $baseUrl, $useContext, $contextScope, $modelTemplate);
        } else {
            $result = $aiApi->ai_request($prompt_params,$type, $file_url, $textSnippet, $baseUrl, $useContext, $contextScope, $modelTemplate);
        }
        break;
    case 'mistralai':
    case 'anthropic':
        $result = $aiApi->ai_request($prompt_params,$type);
        break;
}

if ($result->status){
    echo json_encode($result);
} else {
    echo json_encode(["status" => "success", "result" => $result]);
}