<?PHP     

	require("../../../config.php");
	require("../../../session.php");

	require("../database_library.php");
	require("../user_library.php");
	require("management_library.php");

	if(is_user_admin()){

		$mysql_id = database_connect("New_securty.php database connect success","New_security.php database connect failed");

		$query = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "play_security_details (security_setting,security_data,security_info) values  ('" . $_POST['newsecurity'] . "','" . $_POST['newdata'] . "','" . $_POST['newdesc'] ."')";

		if(mysql_query($query)){

			// change these

			//receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder creation succeeded for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);

		}else{

			// change these

			//receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder creation failed for " . $_SESSION['toolkits_logon_username'], "Folder creation failed for " . $_SESSION['toolkits_logon_username']);

		}

		security_list();

				
	}else{

		management_fail();

	}

?>

