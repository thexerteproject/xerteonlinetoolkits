<?php

require_once(dirname(__FILE__) . "/../../config.php");
require_once (str_replace('\\', '/', __DIR__) . "/../ai/management/dataRetrievalHelper.php");

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
ob_start();
$query = $_POST["query"];
$api = $_POST["api"] ?? 'pexels';
$textApi = $_POST["textApi"] ?? 'mistral';
$url = $_POST["target"];
$interpretPrompt = $_POST["interpretPrompt"];
$overrideSettings = $_POST["overrideSettings"];
$settings = $_POST["settings"];

$managementSettings = get_block_indicators();

if((!$managementSettings['imagegen']['active_vendor'])&&(!$managementSettings['image']['active_vendor'])){
    die(json_encode(["status" => "error", "message" => "No active API found. Ensure at least one ai vendor is enabled with a valid api key."]));
}

if((!vendor_is_active($api, 'image'))&&(!vendor_is_active($api, 'imagegen'))){
    die(json_encode(["status" => "error", "message" => "The selected vendor is not enabled, or is missing an API key. Contact your administrator and ensure at least one ai vendor is enabled with a valid api key."]));
}

//dynamically load needed api methods
require_once(dirname(__FILE__) . "/" . "BaseApi.php");
require_once(dirname(__FILE__) . "/Apis/" . $api ."Api.php");

//dynamically initiate correct api class
$api_type = $api . 'Api';
$imgshApi = new $api_type($textApi);

$result = $imgshApi->sh_request($query, $url, $interpretPrompt, $overrideSettings, $settings); // original

if ($result->status) {
	$_SESSION["paths_img_search"] = array();
	$result->credits = array();
	for($i = 0; $i < count($result->paths); $i++){
		$full_path = $result->paths[$i];

		$web_path = str_replace($xerte_toolkits_site->root_file_path, $xerte_toolkits_site->site_url, $full_path);
		$ext = pathinfo($full_path, PATHINFO_EXTENSION);
		$credits = str_replace($ext, "txt", $full_path);

		$_SESSION["paths_img_search"][] = $full_path;
		$result->paths[$i] = $web_path;
        //TODO: Fix for non-credit vendors (Dalle2, Dalle3)
		$result->credits[] = file_get_contents($credits);
	}
    ob_end_clean();
	echo json_encode($result);
} else {
	echo json_encode(["status" => "success", "result" => $result]);
}
