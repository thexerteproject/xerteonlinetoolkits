<?php
require_once (dirname(__FILE__) . "/../../config.php");
require_once ('subtemplate.php');

if(!isset($_SESSION['toolkits_logon_id'])){
    die("Session ID not set");
}

$tsugi_enabled = false;
$xapi_enabled = false;
$lti_enabled = false;
$pedit_enabled = false;
$x_embed = false;


//todo add copy action here

require(dirname(__FILE__) .  '/../../play.php');

