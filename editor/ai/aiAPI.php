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

require_once(dirname(__FILE__) . "/../../config.php");



$prompt_params = $_POST["prompt"] ?? null;
$type = $_POST["type"]; // page
$ai_api = $_POST["api"] ?? 'openai'; // model selection
$file_url = $_POST["url"] ?? 'None';
$textSnippet = $_POST["textSnippet"];
$context = $_POST["context"] ?? 'None';
$subtype = $_POST["prompt"]["subtype"] ?? null;
$useContext = $_POST["useContext"] ?? 'false';
$baseUrl = $_POST["baseUrl"];
$contextScope = $_POST["contextScope"];
$modelTemplate = $_POST["modelTemplate"];
$useCorpus = $_POST["useCorpus"] ?? false;
$fileList = $_POST["fileList"] ?? null;
$useLoInCorpus = $_POST['useLoInCorpus'];
$restrictCorpusToLo = $_POST['restrictCorpusToLo'];
$selectedCode = $_POST['language'];

$allowed_apis = ['openai', 'anthropic', 'mistral'];

//todo combine with api check from admin page
if (!in_array($ai_api, $allowed_apis)){
    die(json_encode(["status" => "error", "message" => "api is not allowed"]));
}

//dynamically load needed api methods
require_once(dirname(__FILE__) . "/" . "BaseAiApi.php");
require_once(dirname(__FILE__) . "/" . $ai_api ."Api.php");

ob_start();

//ensure corpus directory exists
$url_parts = explode('/', $baseUrl);
end($url_parts);
verify_LO_folder(prev($url_parts), '/RAG/corpus');

//dynamically initiate correct api class
$api_type = $ai_api . 'Api';
$aiApi = new $api_type($ai_api);

$prompt_params_str = print_r($prompt_params, true);
$useCorpus_str = print_r($useCorpus, true);
$fileList_str = print_r($fileList, true);
$restrictCorpusToLo_str = print_r($restrictCorpusToLo, true);

file_put_contents("ai.txt", "prompt_params: $prompt_params_str\ntype: $type\nbaseUrl:$baseUrl\n useCorpus: $useCorpus_str\n fileList: $fileList_str\n restrictCorpusToLo: $restrictCorpusToLo_str\n\n\n", FILE_APPEND);
switch ($ai_api){
    case 'openai':
    case 'mistral':
    case 'anthropic':
        $result = $aiApi->ai_request($prompt_params, $type, $subtype, $context, $baseUrl, $selectedCode, $useCorpus, $fileList, $restrictCorpusToLo);
        break;
}

$debugOutput = ob_get_contents();
ob_end_clean();

if ($result->status){
    echo json_encode($result);
} else {
    echo json_encode(["status" => "success", "result" => $result]);
}
