<?PHP     // Code to list a user's templates
	//
	// Version 1.0 University of Nottingham
	// 
	// Calls the function from the display library

	require("../../../config.php");
	require("../../../session.php");

	include "../display_library.php";
	include "../database_library.php";
	
	include "../user_library.php";

	$database_connect_id = database_connect("your templates database connect success", "your templates database connect failed");

	$_SESSION['sort_type'] = "date_down";

	list_users_projects($_SESSION['sort_type']);		

	mysql_close($database_connect_id);

?>