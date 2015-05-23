<?php

//
// Version 1.0 University of Nottingham
// 
// Calls the function from the display library

require_once("../../../config.php");

_load_language_file("/website_code/php/properties/media_and_quota_template.inc");
_load_language_file("/website_code/php/properties/sharing_status_template.inc");

_load_language_file("/properties.inc");


require_once("../display_library.php");
require_once("../user_library.php");
require_once("../template_status.php");
require_once("../url_library.php");
require_once("../properties/properties_library.php");

if(empty($_SESSION['toolkits_logon_id'])) {
            die("Please login");
}

$info = new stdClass();
$info->properties = project_info($_POST['template_id']);
$info->properties .= media_quota_info($_POST['template_id']);
$info->properties .= access_info($_POST['template_id']);
$info->properties .= sharing_info($_POST['template_id']);

$sql = "SELECT template_id, user_id, firstname, surname, role FROM " .
    " {$xerte_toolkits_site->database_table_prefix}templaterights, {$xerte_toolkits_site->database_table_prefix}logindetails WHERE " .
    " {$xerte_toolkits_site->database_table_prefix}logindetails.login_id = {$xerte_toolkits_site->database_table_prefix}templaterights.user_id and template_id= ? and user_id = ?";

$row = db_query_one($sql, array($_POST['template_id'], $_SESSION['toolkits_logon_id']));
$info->role = $row['role'];

echo json_encode($info);

//$info = get_project_info($_POST['template_id']);
//echo $info;
