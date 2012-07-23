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

_load_language_file("/website_code/php/workspaceproperties/peer_templates_template.inc");

include "../display_library.php";

include "workspace_library.php";

/**
 * connect to the database
 */

workspace_templates_menu();

$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$query_for_peer_templates = "select * from " . $xerte_toolkits_site->database_table_prefix . "templatedetails, " . $xerte_toolkits_site->database_table_prefix . "templaterights, " . $xerte_toolkits_site->database_table_prefix . "additional_sharing where creator_id=\"" . $_SESSION['toolkits_logon_id'] . "\"     and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id = " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id  = " . $xerte_toolkits_site->database_table_prefix . "additional_sharing.template_id and sharing_type=\"peer\"";

$query_peer_response = mysql_query($query_for_peer_templates);

workspace_menu_create(60);

echo "<div style=\"float:left; width:30%; height:20px;\">" . PEER_REVIEW_NAME . "</div>";

while($row_template_name = mysql_fetch_array($query_peer_response)){

    echo "<div style=\"float:left; width:60%;\">" . str_replace("_","",$row['template_name']) . "</div><div style=\"float:left; width:20%;\"> " . PEER_REVIEW_STATUS . " </div>";

}

echo "</div></div>";

?>
