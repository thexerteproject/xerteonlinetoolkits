<?php

require_once (dirname(__FILE__) . "/../../config.php");
require_once ('subtemplate.php');

if(!isset($_SESSION['toolkits_logon_id'])){
    die("Session ID not set");
}


if ($id === "") {
    require(dirname(__FILE__) .  '/subtemplate_selection.php');
} else {
    require(dirname(__FILE__) .  '/../../edithtml.php');
}

