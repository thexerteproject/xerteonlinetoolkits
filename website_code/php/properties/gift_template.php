<?PHP /**
	 * 
	 * gif template, allows the site ti display the html for the gift panel
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */
	
	require("../../../config.php");
	require("../../../session.php");

	include "../database_library.php";
	include "../template_status.php";

	include "../user_library.php";

	$database_id=database_connect("Sharing status template database connect success","Sharing status template database connect failed");

	/*
	* show a different view if you are the file creator
	*/ 

	if(is_user_creator(mysql_real_escape_string($_POST['template_id']))){

		echo "<div class=\"share_top\"><p class=\"header\"><span>To give this project to someone, please type their name here</span></p><form id=\"share_form\"><input name=\"searcharea\" onkeyup=\"javascript:name_select_gift_template()\" type=\"text\" size=\"20\" /></form><div id=\"area2\"><p>Names will appear here</p></div><p id=\"area3\"></div>";	

	}else{

		echo "<p>You have no rights to this template</p>";

	}


?>