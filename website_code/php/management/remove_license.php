<?PHP     

	require("../../../config.php");
	require("../../../session.php");

	require("../database_library.php");
	require("../user_library.php");
	require("../error_library.php");
	require("management_library.php");

	if(is_user_admin()){

		$database_id = database_connect("templates list connected","template list failed");
		
		$query="delete from " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses where license_id=\"" . $_POST['remove']  . "\"";

		$query_response = mysql_query($query);

		licence_list();
				
	}else{

		management_fail();

	}

?>