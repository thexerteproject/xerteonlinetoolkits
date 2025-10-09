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

function update_lti_templatedetails($resource_link, $xerte_id, $template_language = "nld")
{
    global $xerte_toolkits_site;

    $qry = "SELECT * FROM " . $xerte_toolkits_site->database_table_prefix . "lti_templatedetails WHERE template_id = ?";
    $rows = db_query($qry, [$xerte_id]);

    if ($rows === false) {
        _debug("Database query failed while checking lti_templatedetails");
        return false;
    }

    $resource_link = parse_resource_link($resource_link);

    if (count($rows) === 0) {
        $qry = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "lti_templatedetails (template_id, resource_link_id, template_language, xerte_template_id) VALUES (?,?,?,?)";
        $result = db_query($qry, [$xerte_id, $resource_link, $template_language, $xerte_id]);

        if ($result === false) {
            _debug("Inserting into lti_templatedetails failed");
            return false;
        }
        return true;
    }

    foreach ($rows as $row){
        if (isset($row['xerte_template_id'])) {
            $existing_url = $row['resource_link_id'];
            if ($existing_url === $resource_link) {
                $_GET['template_id'] = $row['xerte_template_id'];
                return true;
            }
        }
    }

    $_POST['folder_id'] = "workspace";
    $_POST['template_id'] = $xerte_id;
    $_POST['template_name'] = "placeholder name";
    if (isset($raw_post_array['resource_link_title'])) {
        $_POST['template_name'] = x_clean_input($raw_post_array["resource_link_title"]);
    } elseif (isset($_SESSION['lti_post']) and isset($_SESSION['lti_post']['resource_link_title'])) {
        $_POST['template_name'] = x_clean_input($_SESSION['lti_post']['resource_link_title']);
    }
    //ensure that no ( or ) are send to xerte.
    $_POST['template_name'] = str_replace(['(', ')'], '', $_POST['template_name']);

    require(dirname(__FILE__) .  '/../../website_code/php/templates/duplicate_template.php');

    if(isset($new_template_id) and $new_template_id !== false){

        $qry = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "lti_templatedetails (template_id, resource_link_id, template_language, xerte_template_id) VALUES (?,?,?,?)";

        $result = db_query($qry, [$xerte_id, $resource_link, $template_language, $new_template_id]);
        if ($result === false) {
            _debug("Inserting into lti_templatedetails failed");
            return false;
        }
        $_GET['template_id'] = $new_template_id;
        return true;
    }
    return false;
};



if(!isset($_SESSION['toolkits_logon_id'])){
    die("Session ID not set");
}

if (isset($raw_post_array["resource_link_id"])) {
    $cleaned_resource_link = x_clean_input($raw_post_array["resource_link_id"]);
} else {
    die("resource_link_id missing from request");
}


$tsugi_enabled = false;
$xapi_enabled = false;
$lti_enabled = false;
$pedit_enabled = false;
$x_embed = false;


if (!update_lti_templatedetails($cleaned_resource_link, $id)){
    exit();
}

require(dirname(__FILE__) .  '/../../play.php');

