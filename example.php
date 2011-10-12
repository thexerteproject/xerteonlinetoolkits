<?php
/**
 * 
 * Example page, brings up the an example template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("config.php");

require $xerte_toolkits_site->php_library_path  . "database_library.php";
require $xerte_toolkits_site->php_library_path  . "screen_size_library.php";
require $xerte_toolkits_site->php_library_path  . "template_status.php";
require $xerte_toolkits_site->php_library_path  . "display_library.php";

/*
 * Check the template ID is numeric
 */

if(!isset($_GET['template_id']) || !is_numeric($_GET['template_id'])) {
    die("Invalid template_id provided");
}


$safe_template_id = (int) $_GET['template_id'];	

/*
 * Do the standard query to get the ID and file paths
 */

$query_for_edit_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

$query_for_edit_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_edit_content_strip);

$row = db_query_one($query_for_edit_content);

/*
 * Query to find out if this ID is an example
 */

$query_to_check_example ="select display_id from {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails where display_id=?";

$query_for_example_response = db_query($query_to_check_example, array($safe_template_id));

/*
 * The num rows is 1 from this query then it is an ID
 */

if(sizeof($query_for_example_response)==1){

    /*
     * Get the username
     */

    $query_for_username = "select username from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?"; 
    $row_username = db_query_one($query_for_username, array($row['user_id']));

    /*
     * Get the xml paths and display the HTML
     */

    $string_for_flash_xml = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/data.xml";

    $string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/";

    $dimension = split("~",get_template_screen_size($row['template_name'],$row['template_framework']));

    echo file_get_contents($xerte_toolkits_site->module_path . $row['template_framework'] . "/preview_" . $row['template_framework'] . "_top");

    echo "myRLO = new rloObject('" . $dimension[0] . "','" . $dimension[1] . "','modules/" . $row['template_framework'] . "/parent_templates/" . $row['template_name'] ."/" . $row['template_name'] . ".rlt','$string_for_flash', '$string_for_flash_xml')";

    echo "</script></div></body></html>";

}else{
    dont_show_template();
}
