<?php
$tsugi_disable_xerte_session = true;
require_once(dirname(__FILE__) . "/config.php");
require_once(dirname(__FILE__) . "/tsugi/config.php");

global $tsugi_enabled;

$id = $_GET["template_id"];
if(is_numeric($id))
{
	$tsugi_enabled = true;
	require("preview.php");
}
?>