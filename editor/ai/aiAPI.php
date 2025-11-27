<?php

require_once(dirname(__FILE__) . "/../../config.php");
require_once (str_replace('\\', '/', __DIR__) . "/management/dataRetrievalHelper.php");

if(!isset($_SESSION['toolkits_logon_id'])) {
    die("Session ID not set");
}

$prompt_params = $_POST["prompt"] ?? null;
if($prompt_params!=null){$prompt_params = x_clean_input($_POST["prompt"]);}
$type = x_clean_input($_POST["type"]); // page
$ai_api = x_clean_input($_POST["api"]) ?? 'openai'; // model selection
$file_url = x_clean_input($_POST["url"]) ?? 'None';
$textSnippet = x_clean_input($_POST["textSnippet"]);
$context = x_clean_input($_POST["context"]) ?? 'None';
$subtype = $_POST["prompt"]["subtype"] ?? null;
if ($subtype!=null){$subtype = x_clean_input($_POST["prompt"]["subtype"]);}
$useContext = x_clean_input($_POST["useContext"]) ?? 'false';
$baseUrl = x_clean_input($_POST["baseUrl"]);
$contextScope = x_clean_input($_POST["contextScope"]);
$modelTemplate = x_clean_input($_POST["modelTemplate"]);
$useCorpus = x_clean_input($_POST["useCorpus"]) ?? false;
$fileList = $_POST["fileList"] ?? null;
if ($fileList!=null) {$fileList = x_clean_input($_POST["fileList"]);}
$useLoInCorpus = x_clean_input($_POST['useLoInCorpus']);
$restrictCorpusToLo = x_clean_input($_POST['restrictCorpusToLo']);
$selectedCode = x_clean_input($_POST['language']);


$managementSettings = get_block_indicators();

if (!in_array($ai_api, array_keys($managementSettings['ai']['active_vendors']))) {
    die(json_encode(["status" => "error", "message" => "Requested api is not found as an option"]));
}

//dynamically load needed api method
require_once(dirname(__FILE__) . "/" . $ai_api . "Api.php");

ob_start();

//ensure corpus directory exists
//todo verify path to users_file_area_full
$url_parts = explode('/', $baseUrl);
end($url_parts);
verify_LO_folder(prev($url_parts), '/RAG/corpus');

//dynamically initiate correct api class
$api_type = $ai_api . 'Api';
$aiApi = new $api_type($ai_api);

$result = $aiApi->ai_request($prompt_params, $type, $subtype, $context, $baseUrl, $selectedCode, $useCorpus, $fileList, $restrictCorpusToLo);


$debugOutput = ob_get_contents();
ob_end_clean();

if ($result->status) {
    echo json_encode($result);
} else {
    echo json_encode(["status" => "success", "result" => $result]);
}
