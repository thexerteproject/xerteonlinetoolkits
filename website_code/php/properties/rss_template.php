<?PHP     // Code to run the ajax query to show and allow the usert to change a templates notes
	//
	// Version 1.0 University of Nottingham

	require("../../../config.php");
	require("../../../session.php");

	include "../database_library.php";

	include "../url_library.php";

	include "../template_status.php";

	include "../user_library.php";
	
	include "properties_library.php";

	//connect to the database

	$database_connect_id = database_connect("notes template database connect success", "notes template database connect failed");

	if(is_user_creator(mysql_real_escape_string($_POST['tutorial_id']))||is_user_admin()){

		if(template_access_settings(mysql_real_escape_string($_POST['tutorial_id']))=="Public"){

			rss_display($xerte_toolkits_site,mysql_real_escape_string($_POST['tutorial_id']),false);
		
		}else{

			rss_display_public();

		}


	}else{

		rss_display_fail();

	}

?>