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
require_once (str_replace('\\', '/', __DIR__) . "/management/dataRetrievalHelper.php");

if(!isset($_SESSION['toolkits_logon_id'])) {
    die("Session ID not set");
}

$prompt_params = x_clean_input($_POST["prompt"]) ?? null;
$type = x_clean_input($_POST["type"]); // page
$ai_api = x_clean_input($_POST["api"]) ?? 'openai'; // model selection
$file_url = x_clean_input($_POST["url"]) ?? 'None';
$textSnippet = x_clean_input($_POST["textSnippet"]);
$context = x_clean_input($_POST["context"]) ?? 'None';
$subtype = x_clean_input($_POST["prompt"]["subtype"]) ?? null;
$useContext = x_clean_input($_POST["useContext"]) ?? 'false';
$baseUrl = x_clean_input($_POST["baseUrl"]);
$contextScope = x_clean_input($_POST["contextScope"]);
$modelTemplate = x_clean_input($_POST["modelTemplate"]);
$useCorpus = x_clean_input($_POST["useCorpus"]) ?? false;
$fileList = x_clean_input($_POST["fileList"]) ?? null;
$useLoInCorpus = x_clean_input($_POST['useLoInCorpus']);
$restrictCorpusToLo = x_clean_input($_POST['restrictCorpusToLo']);
$selectedCode = x_clean_input($_POST['language']);


$managementSettings = get_block_indicators();

if (!$managementSettings['ai']['active_vendor']) {
    die(json_encode(["status" => "error", "message" => "No active API found. Ensure at least one ai vendor is enabled with a valid api key."]));
}

if (!in_array($ai_api, array_keys($managementSettings['ai']['active_vendors']))) {
    die(json_encode(["status" => "error", "message" => "Requested api is not found as an option"]));
}

//dynamically load needed api methods
require_once(dirname(__FILE__) . "/" . "BaseAiApi.php");
require_once(dirname(__FILE__) . "/" . $ai_api . "Api.php");

ob_start();

//ensure corpus directory exists
$url_parts = explode('/', $baseUrl);
end($url_parts);
verify_LO_folder(prev($url_parts), '/RAG/corpus');

//dynamically initiate correct api class
$api_type = $ai_api . 'Api';
$aiApi = new $api_type($ai_api);

//todo remove or disable these debug features?
$prompt_params_str = print_r($prompt_params, true);
$useCorpus_str = print_r($useCorpus, true);
$fileList_str = print_r($fileList, true);
$restrictCorpusToLo_str = print_r($restrictCorpusToLo, true);

file_put_contents("ai.txt", "prompt_params: $prompt_params_str\ntype: $type\nbaseUrl:$baseUrl\n useCorpus: $useCorpus_str\n fileList: $fileList_str\n restrictCorpusToLo: $restrictCorpusToLo_str\n\n\n", FILE_APPEND);


//todo why
switch ($ai_api) {
    case 'openai':
    case 'mistral':
    case 'anthropic':
        $result = $aiApi->ai_request($prompt_params, $type, $subtype, $context, $baseUrl, $selectedCode, $useCorpus, $fileList, $restrictCorpusToLo);
        break;
}

$debugOutput = ob_get_contents();
ob_end_clean();

if ($result->status) {
    echo json_encode($result);
} else {
    echo json_encode(["status" => "success", "result" => $result]);
}
