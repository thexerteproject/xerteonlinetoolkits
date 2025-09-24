<?php

require_once (dirname(__FILE__) . "/../../config.php");
require_once ('subtemplate.php');

if(!isset($_SESSION['toolkits_logon_id'])){
    die("Session ID not set");
}

if (isset($raw_post_array['content_item_return_url'])) {
    $content_item_return_url = x_clean_input($raw_post_array['content_item_return_url'], 'string');
} else {
    $content_item_return_url = "";
}
$_SESSION['content_item_return_url'] = $content_item_return_url;

if ($id === "") {
    require(dirname(__FILE__) .  '/subtemplate_selection.php');
} else {
    require(dirname(__FILE__) .  '/../../edithtml.php');
}

