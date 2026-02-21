<?php

require_once(dirname(__FILE__) . "/../../config.php");
require_once (str_replace('\\', '/', __DIR__) . "/../ai/management/dataRetrievalHelper.php");

if(!isset($_SESSION['toolkits_logon_id'])) {
    die("Session ID not set");
}

ob_start();
$query = x_clean_input($_POST["query"]);
$api = x_clean_input(isset($_POST['api']) ? $_POST['api'] : 'pexels');
$textApi = x_clean_input(isset($_POST['textApi']) ? $_POST['textApi'] : 'mistral');
$url = x_clean_input($_POST["target"]);
$interpretPrompt = x_clean_input($_POST["interpretPrompt"]);
$overrideSettings = x_clean_input($_POST["overrideSettings"]);
$settings = x_clean_input($_POST["settings"]);
$language = x_clean_input($_POST["language"]);

$managementSettings = get_block_indicators();

if((!vendor_is_active($api, 'image'))&&(!vendor_is_active($api, 'imagegen'))){
    die(json_encode(["status" => "error", "message" => "The selected vendor is not enabled, or is missing an API key. Contact your administrator and ensure at least one ai vendor is enabled with a valid api key."]));
}

//dynamically load needed api methods
require_once(dirname(__FILE__) . "/" . "BaseApi.php");
require_once(dirname(__FILE__) . "/Apis/" . $api ."Api.php");

//get the user-set preferred model for text generation, if any
$providerPreferredModel = $managementSettings['ai']['preferred_model'];

//dynamically initiate correct api class
$api_type = $api . 'Api';
$imgshApi = new $api_type($textApi, $providerPreferredModel);

$result = $imgshApi->sh_request($query, $url, $interpretPrompt, $overrideSettings, $settings, $language);

$no_credits_vendors = ['dalle2', 'dalle3', 'gpt1'];
$hotlink_vendors = ['unsplash'];

$_SESSION["paths_img_search"] = array();
$result->credits = array();

for($i = 0; $i < count($result->paths); $i++){
    global $xerte_toolkits_site;
    $full_path = $result->paths[$i];

    $web_path = str_replace($xerte_toolkits_site->root_file_path, $xerte_toolkits_site->site_url, $full_path);
    $result->paths[$i] = $web_path;

    if (!in_array($api, $no_credits_vendors)) {
        if (!in_array($api, $hotlink_vendors)){
            $ext = pathinfo($full_path, PATHINFO_EXTENSION);
            $credits = str_replace($ext, "txt", $full_path);
        } else {
            $credits = $result->creditPaths[$i];
        }

        $_SESSION["paths_img_search"][] = $full_path;

        $result->credits[] = file_get_contents($credits);
    }
}
ob_end_clean();
echo json_encode($result);

