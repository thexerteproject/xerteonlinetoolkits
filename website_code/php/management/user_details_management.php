<?PHP     

	require("../../../config.php");
	require("../../../session.php");
	
	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/management/user_details_management.inc";

	require("../database_library.php");
	require("../user_library.php");

	if(is_user_admin()){

		$database_id = database_connect("templates list connected","template list failed");

		$query="update " . $xerte_toolkits_site->database_table_prefix . "logindetails set firstname=\"" . $_POST['firstname'] . "\", surname=\"" . $_POST['surname'] . "\",  username =\"" . $_POST['username'] . "\"";

		$query .= " where login_id =\"" . $_POST['user_id'] . "\"";

		echo $query;

		if(mysql_query($query)){

			echo USERS_UPDATE_SUCCESS;

		}else{

			echo USERS_UPDATE_FAIL;

		}
				
	}

?>