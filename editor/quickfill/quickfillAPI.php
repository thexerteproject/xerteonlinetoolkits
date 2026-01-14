<?php
error_reporting(0);

require_once(dirname(__FILE__) . "/../../config.php");
require_once ("basic_quickfill.php");

global $xerte_toolkits_site;

if(!isset($_SESSION['toolkits_logon_id'])) {
    die("Session ID not set");
}

$type = x_clean_input($_POST["type"]);
$parameters = x_clean_input($_POST["parameters"]);
$language = $_SESSION['toolkits_language'];

$quickfillApi = new basicquickfill();

$result = $quickfillApi->qf_request($type, $parameters, $language);

echo json_encode(["status" => "success", "result" => $result]);
