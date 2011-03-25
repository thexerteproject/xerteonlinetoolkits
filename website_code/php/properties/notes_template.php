<?PHP     /**
* 
* notes template, displays notes on a template
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

	$database_connect_id = database_connect("notes template database connect success", "notes template database connect failed");
	
	if(is_numeric($_POST['template_id'])){
	
		if(is_user_creator($_POST['template_id'])||is_user_admin()){
	
			$query_for_template_notes = "select notes from " . $xerte_toolkits_site->database_table_prefix . "templaterights where template_id=" . mysql_real_escape_string($_POST['template_id']);
	
			$query_notes_response = mysql_query($query_for_template_notes);
	
			$row_notes = mysql_fetch_array($query_notes_response);
	
			echo "<p class=\"header\"><span>Project Notes:</span></p>";
	
			echo "<p>These notes are only visible to yourself<br/><form id=\"notes_form\" action=\"javascript:change_notes('" . $_POST['template_id'] ."', 'notes_form')\"><textarea style=\"width:90%; height:330px\">" . $row_notes['notes'] . "</textarea><input type=\"image\" src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveClick.gif'\" class=\"form_image_bottom\" /></form></p>";
	
		}else{
	
			echo "<p>Sorry only the creator of the file can set notes for the project</p>";	
	
		}
	
	}

?>
