<?php

require_once (dirname(__FILE__) . "/../../config.php");
require_once ('subtemplate.php');

function parse_resource_link($resource_link) {
    $pattern = '#/content/([a-zA-Z0-9]+)/version/([a-zA-Z0-9]+)#';

    if (preg_match($pattern, $resource_link, $matches)) {
        return $matches[1];
    }

    return null; // not a valid resource link
}

if(!isset($_SESSION['toolkits_logon_id'])){
    die("Session ID not set");
}

if (isset($raw_post_array['content_item_return_url'])) {
    $content_item_return_url = x_clean_input($raw_post_array['content_item_return_url'], 'string');
} else {
    $content_item_return_url = "";
}
$_SESSION['content_item_return_url'] = $content_item_return_url;

if ($id !== "") {

    $resource_link = parse_resource_link($content_item_return_url);

    $sql = "SELECT * FROM " . $xerte_toolkits_site->database_table_prefix . "lti_templatedetails WHERE template_id = ? and resource_link_id = ?";
    $result = db_query_one($sql, [$id, $resource_link]);
    if ($result === false) {
        die('request to the lti_templatedetails table went wrong');
    }
    if ($result !== null) {
        if (isset($result['xerte_template_id'])) {
            $_GET['template_id'] = $result['xerte_template_id'];
        }
    }

}

if ($id === "") {
    require(dirname(__FILE__) .  '/subtemplate_selection.php');
} else {
    require(dirname(__FILE__) .  '/../../edithtml.php');
}

