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
	
	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/workspaceproperties/my_properties_template.inc";

	include "../database_library.php";

	include "../display_library.php";

	/**
	* connect to the database
	*/
	
	$database_connect_id = database_connect("my_propertes_template.php connect success","my_properties_template.php connect failed");

	$query_for_user = "select * from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id=\"" . $_SESSION['toolkits_logon_id'] . "\"";

	$query_user_response = mysql_query($query_for_user);

	$row_user = mysql_fetch_array($query_user_response);

	echo "<p class=\"header\"><span>" . MY_PROPERTIES_DETAILS . "</span></p>";

	echo "<p>" . MY_PROPERTIES_NAME_DETAILS . " " . $row_user['firstname'] . " " . $row_user['surname'] . "</p>";

	echo "<p>" . MY_PROPERTIES_LOGIN_DETAILS . " " . $row_user['lastlogin'] . "</p>";

	echo "<p>" . MY_PROPERTIES_USERNAME_DETAILS . " " . $row_user['username'] . "</p>";

?>