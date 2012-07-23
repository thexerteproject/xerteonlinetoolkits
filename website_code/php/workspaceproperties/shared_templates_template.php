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

_load_language_file("/website_code/php/workspaceproperties/shared_templates_template.inc");

include "../display_library.php";

include "workspace_library.php";

/**
 * connect to the database
 */

workspace_templates_menu();

$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$query_for_shared_templates = "select * from " . $xerte_toolkits_site->database_table_prefix . "logindetails, " . $xerte_toolkits_site->database_table_prefix . "templatedetails, " . $xerte_toolkits_site->database_table_prefix . "templaterights where user_id=\"" . $_SESSION['toolkits_logon_id'] . "\" and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id = " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id and creator_id = login_id";

$query_shared_response = mysql_query($query_for_shared_templates);

workspace_menu_create(60);

echo "<div style=\"float:left; width:30%; height:20px;\">" . SHARED_TEMPLATE_CREATOR . "</div>";

while($row_template_name = mysql_fetch_array($query_shared_response)){

    echo "<div style=\"float:left; width:60%; overflow:hidden;\">" . str_replace("_","",$row_template_name['template_name']) . "</div>";
    echo "<div style=\"float:left; width:30%; overflow:hidden;\">" . $row_template_name['firstname'] . " " . $row_template_name['surname'] . "</div>";

}

echo "</div></div>";

?>
