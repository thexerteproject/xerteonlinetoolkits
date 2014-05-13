<?php
/**
 * 
 * workspace templates template page, used displays the User created
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */


require_once("../../../config.php");

include "../display_library.php";

include "workspace_library.php";

/**
 * connect to the database
 */

workspace_templates_menu();

$database_connect_id = database_connect("workspace_template.php connect success","workspace_template.php connect failed");

$prefix =  $xerte_toolkits_site->database_table_prefix ;

$query_for_created_templates = "select * from {$prefix}templatedetails where creator_id= ? ORDER BY date_created DESC";

$params = array($_SESSION['toolkits_logon_id']);

$query_created_response = db_query($query_for_created_templates, $params);

workspace_menu_create(100);

foreach($query_created_response as $row_template_name) {
    echo "<div style=\"float:left; width:100%; clear:left\">" . str_replace("_","",$row_template_name['template_name']) . "</div>";

}

echo "</div></div></div>";

