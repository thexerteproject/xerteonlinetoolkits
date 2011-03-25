<?PHP /**
* 
* media and quota template, specifies which files in the media folder are in use so they can be deleted
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

$temp_dir_path="";
$temp_new_path="";

$quota=0;

/**
* 
* Function in use
* This function copies files from one folder to another (does not move - copies)
* @param string $file_name - the file name we are checking for
* @return bool - true or false if the file is found
* @version 1.0
* @author Patrick Lockley
*/

function in_use($file_name){

	global $xmlpath, $previewpath;

	if(!strpos(file_get_contents($xmlpath),$file_name)&&!strpos(file_get_contents($previewpath),$file_name)){
		return false;
	}else{
		return true;
	}

}

$result_string = array();

$delete_string = array();

/**
* 
* Function media folder loop
* This function copies files from one folder to another (does not move - copies)
* @param string $folder_name - path to the media folder to loop through
* @version 1.0
* @author Patrick Lockley
*/

function media_folder_loop($folder_name){

	global $dir_path, $new_path, $temp_dir_path, $temp_new_path, $quota, $result_string, $delete_string, $xerte_toolkits_site, $end_of_path;
	
	$result = "";
	
	while($f = readdir($folder_name)){

		$full = $dir_path . "/" . $f;

		if(!is_dir($full)){
			
			/**
			* Create the string that the function will return
			*/
			
			if(in_use($f)){
				$result = "<div class=\"filename found\" onclick=\"document.getElementById('linktext').value='" . $xerte_toolkits_site->site_url . str_replace($xerte_toolkits_site->root_file_path,"",$dir_path) . "/" . $f  . "';document.getElementById('download_link').value='" . $dir_path . "/" . $f  . "'" . "\">" . $f . "</div><div class=\"filesize found\">" . substr((filesize($full)/1000000),0,4) . " MB</div><span class=\"fileinuse found foundtextcolor\">In use </span>";
			}else{
				$result = "<div class=\"filename notfound\" onclick=\"document.getElementById('linktext').value='" . $xerte_toolkits_site->site_url . str_replace($xerte_toolkits_site->root_file_path,"",$dir_path) . "/" . $f  . "';document.getElementById('download_link').innerHTML='<a target=\'_blank\' href=\'getfile.php?file=" . $end_of_path . "/media/" . $f  . "\'>Download this file</a>'\">" . $f . "</div><div class=\"filesize notfound\">" . substr((filesize($full)/1000000),0,4) . " MB</div><div class=\"fileinuse notfound notfoundtextcolor\">Not in use <img alt=\"Click to delete\" title=\"Click to delete\"  onclick=\"javascript:delete_file('" . $dir_path . "/" . $f . "')" . "\" \" align=\"absmiddle\" src=\"website_code/images/delete.gif\" /></div>";

				/**
				* add the files to the delete array that are not in use  so they can be listed for use in the delete function
				*/

				array_push($delete_string,$f);			

			}
			$quota += filesize($full);
		}

		array_push($result_string,$result);
		$result="";
			
	}

}

database_connect("Media and quota template database connect success","Media and quota template database connect failed");

if(is_numeric($_POST['template_id'])){

	if(has_rights_to_this_template(mysql_real_escape_string($_POST['template_id']), $_SESSION['toolkits_logon_id'])||is_user_admin()){
	
		$query_for_path = "select " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_name, " . $xerte_toolkits_site->database_table_prefix . "templaterights.folder, " . $xerte_toolkits_site->database_table_prefix . "logindetails.username from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails, " . $xerte_toolkits_site->database_table_prefix . "templatedetails, " . $xerte_toolkits_site->database_table_prefix . "templaterights, " . $xerte_toolkits_site->database_table_prefix . "logindetails where " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_type_id and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.creator_id = " . $xerte_toolkits_site->database_table_prefix . "logindetails.login_id and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\" and role=\"creator\"";
	
		$query_for_path_response = mysql_query($query_for_path);
	
		$row_path = mysql_fetch_array($query_for_path_response);
	
		$end_of_path = $_POST['template_id'] . "-" . $row_path['username'] . "-" . $row_path['template_name'];
	
		/**
		* Set the paths
		*/
	
		$dir_path = $xerte_toolkits_site->users_file_area_full . $end_of_path .  "/media";
	
		$xmlpath = $xerte_toolkits_site->users_file_area_full . $end_of_path .  "/data.xml";
	
		$previewpath = $xerte_toolkits_site->users_file_area_full . $end_of_path .  "/preview.xml";
	
		if(file_exists($xerte_toolkits_site->users_file_area_full . $end_of_path .  "/preview.xml")){
	
			$quota = filesize($xerte_toolkits_site->users_file_area_full . $end_of_path .  "/data.xml") + filesize($xerte_toolkits_site->users_file_area_full . $end_of_path .  "/preview.xml");
			
		}
	
		$d = opendir($dir_path);
	
		media_folder_loop($d);
	
		echo "<p class=\"header\"><span>This project is currently using " . substr(($quota/1000000),0,4) . " MB</span></p>";

		echo "<p>Import</p><form method=\"post\" enctype=\"multipart/form-data\" id=\"importpopup\" name=\"importform\" target=\"upload_iframe\" action=\"website_code/php/import/fileupload.php\" onsubmit=\"javascript:iframe_upload_check_initialise();\"><input name=\"filenameuploaded\" type=\"file\" /><input type=\"hidden\" name=\"mediapath\" value=\"" . $dir_path . "/\" /><br><br><input type=\"submit\" name=\"submitBtn\" value=\"Upload\" onsubmit=\"javascript:iframe_check_initialise()\"/></form><p>Click on a file name and a link will appear below<br><textarea id=\"linktext\" style=\"width:90%;\" rows=\"3\"></textarea></p><p style=\"margin:0px; padding:0px; margin-left:10px;\" id=\"download_link\"></p>";
	
		echo "<div class=\"template_file_area\"><p>In use / Not in use refer to whether the file is used in the published version, not the working version</p>";
	
		/**
		* display the first string
		*/
	
		while($y=array_pop($result_string)){
	
			echo $y;
	
		}
	
		//echo "<div style=\"float:left; position:relative; width:80%\">";
			
		/**
		* display the list of files that are not in use so they can be deleted.	
		*/
			
		//while($y=array_pop($delete_string)){
	
		//	echo "<p><a href=\"javascript:delete_file('" . $dir_path . "/" . $y . "')" . "\">Click to delete the unused file " . $y . "</a></p>";
	
		//}
	
		//echo "</div>";
	
		echo "</div>";
	
	}else{
	
		echo "<p>Sorry you do not have rights to this template</p>";
	
	
	}
	
}

?>