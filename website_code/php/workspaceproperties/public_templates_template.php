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

$prefix = $xerte_toolkits_site->database_table_prefix;

$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$query_for_public_templates = "select * from {$prefix}templatedetails, {$prefix}templaterights where "
. "access_to_whom = ? AND "
. "user_id = ? and "
. " {$prefix}templaterights.template_id = {$prefix}templatedetails.template_id ORDER BY template_name DESC";
$params = array('public', $_SESSION['toolkits_logon_id']);

$query_public_response = db_query($query_for_public_templates, $params);

workspace_menu_create(100);

foreach($query_public_response as $row_template_name) {
    echo "<div style=\"float:left; width:100%;\">" . str_replace("_","",$row_template_name['template_name']) . "</div>";

}

echo "</div>";
