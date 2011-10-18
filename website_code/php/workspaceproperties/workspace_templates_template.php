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

$query_for_created_templates = "select * from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where creator_id=\"" . $_SESSION['toolkits_logon_id'] . "\"    ORDER BY date_created DESC";

$query_created_response = mysql_query($query_for_created_templates);

workspace_menu_create();

while($row_template_name = mysql_fetch_array($query_created_response)){

    echo "<div style=\"float:left; width:100%; clear:left\">" . $row_template_name['template_name'] . "</div>";

}

echo "</div></div></div>";


?>
