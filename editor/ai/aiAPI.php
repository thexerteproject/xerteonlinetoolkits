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
$type = $_POST["type"];
$ai_api = $_POST["api"] ?? 'openai';
$file_url = $_POST["url"] ?? 'None';
$textSnippet = $_POST["textSnippet"];
$context = $_POST["context"] ?? 'None';
$useContext = $_POST["useContext"] ?? 'false';
$baseUrl = $_POST["baseUrl"];
$contextScope = $_POST["contextScope"];
$modelTemplate = $_POST["modelTemplate"];
$useCorpus = $_POST["useCorpus"] ?? false;
$fileList = $_POST["fileList"] ?? null;
$useLoInCorpus = $_POST['useLoInCorpus'];
$restrictCorpusToLo = $_POST['restrictCorpusToLo'];

$allowed_apis = ['openai', 'anthropic', 'mistral'];
$global_instructions = ["All text enclosed within the following attributes: 'text', 'goals', 'audience', 'prereq', 'howto', 'summary', 'nextsteps', 'pageintro', 'tip', 'side1', 'side2', 'txt', 'instruction', 'prompt', 'answer', 'intro', 'feedback', 'unit', 'question', 'hint', 'label', 'passage', 'initialtext', 'initialtitle', 'suggestedtext', 'suggestedtitle', 'generalfeedback', 'instructions', 'p1', 'p2', 'title', 'introduction', 'wrongtext', 'wordanswer', 'words' must be formatted with relevant HTML encoding tags (headers, paragraphs, etc. if needed), using EXCLUSIVELY HTML entities. On the other hand, the text inside CDATA nodes should be formatted using at minimum paragraph tags, or other relevant tags if needed."];

//todo combine with api check from admin page
if (!in_array($ai_api, $allowed_apis)){
    die(json_encode(["status" => "error", "message" => "api is not allowed"]));
}

//dynamically load needed api methods
require_once(dirname(__FILE__) . "/" . $ai_api ."Api.php");

ob_start();

//ensure corpus directory exists
$url_parts = explode('/', $baseUrl);
end($url_parts);
verify_LO_folder(prev($url_parts), '/RAG/corpus');

//dynamically initiate correct api class
$api_type = $ai_api . 'Api';
$aiApi = new $api_type($ai_api);
switch ($ai_api){
    case 'openai':
    case 'mistral':
    case 'anthropic':
        $result = $aiApi->ai_request($prompt_params, $type, $baseUrl, $global_instructions, $useCorpus, $fileList, $restrictCorpusToLo);
        break;
}

$debugOutput = ob_get_contents();
ob_end_clean();

if ($result->status){
    echo json_encode($result);
} else {
    echo json_encode(["status" => "success", "result" => $result]);
}