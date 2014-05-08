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

_load_language_file("/website_code/php/workspaceproperties/xml_templates_template.inc");

include "../display_library.php";

include "workspace_library.php";

/**
 * connect to the database
 */

workspace_templates_menu();

$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$prefix = $xerte_toolkits_site->database_table_prefix ;

$query_for_peer_templates = "select * from {$prefix}templatedetails, {$prefix}templaterights, {$prefix}additional_sharing where creator_id= ? "
. " and {$prefix}templatedetails.template_id = {$prefix}templaterights.template_id and "
. "{$prefix}templaterights.template_id  = {$prefix}additional_sharing.template_id and sharing_type=?";

$params = array($_SESSION['toolkits_logon_id'], 'xml');

$query_peer_response = db_query($query_for_peer_templates, $params);

workspace_menu_create(60);

echo "<div style=\"float:left; width:30%; height:20px;\">" . XML_TEMPLATE_NAME . "</div>";

foreach($query_peer_response as $row) {

    echo "<div style=\"float:left; width:60%;\">" . str_replace("_","",$row['template_name']) . "</div><div style=\"float:left; width:20%;\"> On </div>";

}

echo "</div></div>";
