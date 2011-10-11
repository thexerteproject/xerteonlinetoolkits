<?PHP     

	require("../../../config.php");
	require("../../../session.php");

	require("../database_library.php");
	require("../user_library.php");
	require("../error_library.php");
	require("management_library.php");

	if(is_user_admin()){

		licence_list();
				
	}else{

		management_fail();

	}

?>