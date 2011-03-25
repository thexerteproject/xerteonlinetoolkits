<?PHP     /**
* 
* notes change template, updates a users notes on a template
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

	require("../../../config.php");
	require("../../../session.php");

	include "../user_library.php";

	include "../database_library.php";
	
	if(is_numeric($_POST['template_id'])){
	
		$database_id = database_connect("notes change template database connect success","notes change template database connect failed");
	
		$query = "update " . $xerte_toolkits_site->database_table_prefix . "templaterights SET notes =\"" . mysql_real_escape_string($_POST['notes']) . "\" WHERE template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";
	
		if(mysql_query($query)){
				
			echo "<p class=\"header\"><span>Project Notes:</span></p>";
	
			echo "<p><p>These notes are only visible to yourself<br/><form id=\"notes_form\" action=\"javascript:change_notes('" . $_POST['template_id'] ."', 'notes_form')\"><textarea style=\"width:90%; height:330px\">" . $_POST['notes'] . "</textarea><input type=\"image\" src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveClick.gif'\" class=\"form_image_bottom\" /></form></p><p>Notes saved</p>";
	
		}else{
			
		}
	
		mysql_close($database_id);
		
	}

?>