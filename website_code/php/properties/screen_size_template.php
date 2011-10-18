<?php
/**
 * 
 * screen size template, gets the xml and returns the size for the display of the template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../screen_size_library.php";

if(is_numeric($_POST['tutorial_id'])){

    $database_id = database_connect("screen size database connect success","screen size database connect failed");

    $query_for_template_name = "select " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_name, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_framework from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails, " . $xerte_toolkits_site->database_table_prefix . "templatedetails where " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_type_id = " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id AND template_id =\"" . mysql_real_escape_string($_POST['tutorial_id']) . "\"";

    $query_name_response = mysql_query($query_for_template_name);

    $row_name = mysql_fetch_array($query_name_response);

    echo get_template_screen_size($row_name['template_name'], $row_name['template_framework']) . "~" . mysql_real_escape_string($_POST['tutorial_id']);

}

?>
