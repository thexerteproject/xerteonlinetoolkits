<?PHP     /**
* 
* rename folder template page, used by the site to rename a folder
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

	require("../../../config.php");
	require("../../../session.php");

	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/folderproperties/folderproperties_template.inc";
	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/folderproperties/rename_folder_template.inc";

	include "../database_library.php";
	
	if(is_numeric($_POST['folder_id'])&&is_string($_POST['folder_name'])){
	
		$database_id = database_connect("Folder rename database connect success","Folder rename database connect failed");
	
		$query = "update " . $xerte_toolkits_site->database_table_prefix . "folderdetails SET folder_name =\"" . str_replace(" ", "_", $_POST['folder_name']) . "\" WHERE folder_id =\"" . mysql_real_escape_string($_POST['folder_id']) . "\"";
	
		if(mysql_query($query)){

			echo "<p class=\"header\"><span>" . FOLDER_PROPERTIES_PROPERTIES . "</span></p>";			

			echo "<p>" . FOLDER_PROPERTIES_CALLED . " " . str_replace("_", " ", $_POST['folder_name']) . "</p>";

			echo "<p>" . FOLDER_PROPERTIES_CHANGE . "</p>";
	
			echo "<p><form id=\"rename_form\" action=\"javascript:rename_folder('" . $_POST['folder_id'] . "', 'rename_form')\"><input type=\"text\" value=\"" . str_replace("_", " ", $_POST['folder_name']) . "\" name=\"newfoldername\" /><input type=\"image\" src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveClick.gif'\" class=\"form_image_side\" align=\"top\" style=\"padding-left:5px\" /></form><p>" . FOLDER_RENAMED . "</p>";
			
			/**
			* Extra bit of code to tell the ajax back on the web page what to rename the folder to be
			*/
	
			echo "~*~" . $_POST['folder_name'];
		
		}else{
			
		}
		
	}

	mysql_close($database_id);

?>