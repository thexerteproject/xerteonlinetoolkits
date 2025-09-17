<?php
require_once (dirname(__FILE__) . "/../../config.php");
require_once ('subtemplate.php');

//todo security

$tsugi_enabled = false;
$xapi_enabled = false;
$lti_enabled = false;
$pedit_enabled = false;
$x_embed = false;

if (isset($_GET["template_id"])) {
    $id = x_clean_input($_GET["template_id"]);
}
else if(isset($_POST["template_id"]))
{
    $id = x_clean_input($_POST["template_id"]);
    // Hack for the rest of Xerte
    $_GET['template_id'] = $id;
} else if (isset($raw_post_array['template_id'])){
    $id = x_clean_input($raw_post_array["template_id"]);
    // Hack for the rest of Xerte
    $_GET['template_id'] = $id;
}

require(dirname(__FILE__) .  '/../../play.php');

