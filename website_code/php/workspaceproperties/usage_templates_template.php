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

_load_language_file("/website_code/php/workspaceproperties/usage_templates_template.inc");

include "../display_library.php";

include "workspace_library.php";

/**
 * connect to the database
 */

workspace_templates_menu();

$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$prefix = $xerte_toolkits_site->database_table_prefix;

$query_for_shared_templates = "select * from {$prefix}templatedetails, {$prefix}templaterights where "
. "user_id= ? and {$prefix}templatedetails.template_id = {$prefix}templaterights.template_id";

$params = array($_SESSION['toolkits_logon_id']);
$query_shared_response = db_query($query_for_shared_templates, $params);

workspace_menu_create(60);

echo "<div style=\"float:left; width:40%; height:20px;\">" . USAGE_TEMPLATE_STATS . "</div>";

foreach($query_shared_response as $row_template_name) {

	if(trim($row_template_name['number_of_uses'])!=""){
	
		$plays = $row_template_name['number_of_uses'];
	
	}else{
	
		$plays = 0;
	
	}

    echo "<div style=\"float:left; width:60%;\">" . str_replace("_","",$row_template_name['template_name']). "</div>";
    echo "<div style=\"float:left; width:40%;\">" . $plays . "</div>";

}

echo "</div></div>";
