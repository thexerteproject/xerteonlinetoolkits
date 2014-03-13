<?php
/**
 * 
 * properties template, shows the basic page on the properties window
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";
include "../screen_size_library.php";
include "../url_library.php";
include "../user_library.php";
include "properties_library.php";

if(empty($_POST['template_id']) || !is_numeric($_POST['template_id'])) {
    properties_display_fail();
    exit(0);
}

$template_id = (int) $_POST['template_id'];

if(has_rights_to_this_template($template_id, $_SESSION['toolkits_logon_id']) || is_user_admin()) {
    properties_display($xerte_toolkits_site,$template_id,false,"");
}else{
    properties_display_fail();
}
