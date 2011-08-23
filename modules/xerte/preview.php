<?PHP     /**
* 
* preview page, allows the site to make a preview page for a xerte module
*
* @author Patrick Lockley
* @version 1.0
* @params array row_play - The array from the last mysql query
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/


/**
* 
* Function show_preview_code
* This function creates folders needed when creating a template
* @param array $row - an array from a mysql query for the template
* @param array $row_username - an array from a mysql query for the username
* @version 1.0
* @author Patrick Lockley
*/

function show_preview_code($row, $row_username){

	global $xerte_toolkits_site;

	/*
	* Format the XML strings to provide data to the engine
	*/

	if(!file_exists($xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/preview.xml")){

		$buffer = file_get_contents($xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/data.xml");

		$fp = fopen($xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/preview.xml","x");
		fwrite($fp, $buffer);
		fclose($fp);		

	}

	$string_for_flash_xml = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/preview.xml" . "?time=" . time();

	$string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/";

	/*
	* Get the size of the div required for this type of template
	*/

	$dimension = explode("~",get_template_screen_size($row['template_name'],$row['template_framework']));

	echo file_get_contents($xerte_toolkits_site->root_file_path . "modules/"  . $row['template_framework'] . "/preview_" . $row['template_framework'] . "_top");

	/*	
	* Output the standard xerte display code
	*/
	
	if(isset($_GET['linkID'])){

		$link_id = mysql_real_escape_string($_GET['linkID']);
		
		echo "myRLO = new rloObject('" . $dimension[0] . "','" . $dimension[1] . "','modules/" . $row['template_framework'] . "/parent_templates/" . $row['template_name'] ."/" . $row['template_name'] . ".rlt','$string_for_flash', '$string_for_flash_xml', '$xerte_toolkits_site->site_url' , '$link_id')";
		
	}else{
	
		$link_id = null;
		
		echo "myRLO = new rloObject('" . $dimension[0] . "','" . $dimension[1] . "','modules/" . $row['template_framework'] . "/parent_templates/" . $row['template_name'] ."/" . $row['template_name'] . ".rlt','$string_for_flash', '$string_for_flash_xml', '$xerte_toolkits_site->site_url' , '$link_id')";
	
	}

	echo "</script></div><div id=\"popup_parent\"></body></html>";

}

?>