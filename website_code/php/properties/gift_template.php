<?PHP     /**
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
	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/properties/gift_template.inc";

	include "../database_library.php";
	include "../template_status.php";

	include "../user_library.php";

	$database_id=database_connect("Sharing status template database connect success","Sharing status template database connect failed");

	/*
	* show a different view if you are the file creator
	*/ 

	if(is_user_creator(mysql_real_escape_string($_POST['template_id']))){

		echo "<div class=\"share_top\"><p class=\"header\"><span>" . GIFT_INSTRUCTIONS . "</span></p><form id=\"share_form\"><input name=\"searcharea\" onkeyup=\"javascript:name_select_gift_template()\" type=\"text\" size=\"20\" /></form><div id=\"area2\"><p>" . GIFT_NAMES . "</p></div><p id=\"area3\"></div>";	

	}else{

		echo "<p>" . GIFT_FAIL . "</p>";

	}


?>