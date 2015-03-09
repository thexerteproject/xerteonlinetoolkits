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

project_info($_POST['template_id']);
media_quota_info($_POST['template_id']);
access_info($_POST['template_id']);
sharing_info($_POST['template_id']);
//$info = get_project_info($_POST['template_id']);
//echo $info;
