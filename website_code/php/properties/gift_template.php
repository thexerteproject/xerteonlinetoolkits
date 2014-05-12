<?php
/**
 * 
 * gif template, allows the site ti display the html for the gift panel
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/gift_template.inc");
_load_language_file("/properties.inc");

include "../template_status.php";
include "../user_library.php";

$database_id=database_connect("Sharing status template database connect success","Sharing status template database connect failed");

/*
 * show a different view if you are the file creator
 */ 

if(is_user_creator($_POST['template_id'])){

    echo "<div>";
		echo "<p class=\"header\"><span>" . PROPERTIES_TAB_GIVE . "</span></p>";
		echo "<p <span>" . GIFT_INSTRUCTIONS . "</span></p>";
		echo "<form id=\"share_form\"><input name=\"searcharea\" onkeyup=\"javascript:name_select_gift_template()\" type=\"text\" size=\"20\" /></form>";
		echo "<div id=\"area2\"><p>" . GIFT_NAMES . "</p></div><p id=\"area3\">";
		echo "</div>";	

}else{

    echo "<p>" . GIFT_FAIL . "</p>";

}


?>
