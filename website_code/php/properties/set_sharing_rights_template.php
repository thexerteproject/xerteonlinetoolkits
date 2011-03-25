<?PHP     /**
* 
* set sharing rights template, modifies rights to a template
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/


	require("../../../config.php");
	require("../../../session.php");

	include "../database_library.php";

if(is_numeric($_POST['user_id'])&&is_numeric($_POST['template_id'])){

	$new_rights = mysql_real_escape_string($_POST['rights']);

	$user_id = mysql_real_escape_string($_POST['user_id']);

	$tutorial_id = mysql_real_escape_string($_POST['template_id']);

	$database_id=database_connect("Template sharing rights database connect success","Template sharing rights database connect failed");

	$query_to_change_share_rights = "update " . $xerte_toolkits_site->database_table_prefix . "templaterights set role = \"" . $new_rights . "\" where template_id=\"" . $tutorial_id . "\" and user_id=\"" . $user_id . "\"";

	mysql_query($query_to_change_share_rights);
	
}

?>