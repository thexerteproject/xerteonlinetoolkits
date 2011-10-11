<?PHP     /**
* 
* workspace templates template page, used displays the User created
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/


	require("../../../config.php");
	require("../../../session.php");
	
	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/workspaceproperties/usage_templates_template.inc";

	include "../database_library.php";

	include "../display_library.php";
	
	include "workspace_library.php";

	/**
	* connect to the database
	*/

	workspace_templates_menu();

	$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

	$query_for_shared_templates = "select * from " . $xerte_toolkits_site->database_table_prefix . "templatedetails, " . $xerte_toolkits_site->database_table_prefix . "templaterights where user_id=\"" . $_SESSION['toolkits_logon_id'] . "\" and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id = " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id";

	$query_shared_response = mysql_query($query_for_shared_templates);
	
	workspace_menu_create();

	echo "<div style=\"float:left; width:15%; height:20px;\">" . USAGE_TEMPLATE_STATS . "</div>";

	while($row_template_name = mysql_fetch_array($query_shared_response)){

		echo "<div style=\"float:left; width:80%;\">" . $row_template_name['template_name'] . "</div>";
		echo "<div style=\"float:left; width:15%;\">" . $row_template_name['number_of_uses'] . "</div>";

	}

	echo "</div></div>";
		
?>