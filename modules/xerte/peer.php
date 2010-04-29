<?PHP /**
* 
* peer page, allows the site to make a peer review page for a xerte module
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

/**
* 
* Function show template
* This function creates folders needed when creating a template
* @param array $row_play - an array from the last mysql query
* @version 1.0
* @author Patrick Lockley
*/

function show_template($row_play){

		require("config.php");

		$string_for_flash_xml = $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_play['username'] . "-" . $row_play['template_name'] . "/data.xml";

		$string_for_flash = $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_play['username'] . "-" . $row_play['template_name'] . "/";

		$dimension = split("~",get_template_screen_size($row_play['template_name'],$row_play['template_framework']));

		echo file_get_contents("modules/" . $row_play['template_framework'] . "/peer_" . $row_play['template_framework'] . "_top");

		/*
		* slightly modified xerte preview code to allow for flash vars
		*/

		echo "myRLO = new rloObject('" . $dimension[0] . "','" . $dimension[1] . "','modules/" . $row_play['template_framework'] . "/parent_templates/" . $row_play['template_name'] . "/" . $row_play['template_name'] . ".rlt','$string_for_flash', '$string_for_flash_xml', '$xerte_toolkits_site->site_url')";

		echo "</script>";

		echo "<br><form name=\"peer\" action=\"javascript:send_review('" . $row_play['username'] . "','" . $row_play['template_id'] . "')\" method=\"post\" enctype=\"text/plain\"><textarea style=\"width:800px; height:300px;\" name=\"response\">You have been asked to provide some feedback on this learning object. Please enter your feedback and click save when you have finished. This feedback is anonymous.</textarea><br/><input type=\"image\" src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveClick.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" /></form><a name=\"feedbackform\"><p style=\"width:250px;\"  id=\"feedback\"></p></a></div>";

		echo "</body></html>";

}

?>