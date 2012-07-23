<?php
/**
 * 
 * public templates template page, used displays the User created
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

$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$query_for_public_templates = "select * from " . $xerte_toolkits_site->database_table_prefix . "templatedetails, " . $xerte_toolkits_site->database_table_prefix . "templaterights where access_to_whom=\"public\" and user_id =\"" . $_SESSION['toolkits_logon_id'] . "\" and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id=" . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id ORDER BY template_name DESC";

$query_public_response = mysql_query($query_for_public_templates);

workspace_menu_create();

while($row_template_name = mysql_fetch_array($query_public_response)){

    echo "<div style=\"float:left; width:100%;\">" . str_replace("_","",$row_template_name['template_name']) . "</div>";

}

echo "</div>";

?>
