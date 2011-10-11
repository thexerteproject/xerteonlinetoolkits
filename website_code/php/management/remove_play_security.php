<?PHP     

	require("../../../config.php");
	require("../../../session.php");

	require("../database_library.php");
	require("../user_library.php");
	require("management_library.php");

	if(is_user_admin()){

		$query="delete from " . $xerte_toolkits_site->database_table_prefix . "play_security_details where security_id=\"" . $_POST['play_id']  . "\"";

		mysql_query($query);

		security_list();

				
	}else{

		management_fail();

	}

?>