<?PHP     

/**
* 
* Update file, code that runs when an editor window closes and the user is given the option of synchronising the files
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

require_once('../../../config.php');

_load_language_file("/website_code/php/versioncontrol/update_file.inc");

require('../template_status.php');

database_connect("file update success","file_update_fail");

if(isset($_POST['template_id'])){

	if(is_numeric($_POST['template_id'])){

		if(!empty($_POST['file_path'])){

			$temp_array = explode("-",str_replace($xerte_toolkits_site->users_file_area_full,"",$_POST['file_path']));

			$template_id = $temp_array[0];

		}else{
		
			$template_id = mysql_real_escape_string($_POST['template_id']);
		
		}
		
		$query_for_play_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

		$query_for_play_content = str_replace("TEMPLATE_ID_TO_REPLACE", $template_id, $query_for_play_content_strip);

		$query_for_play_content_response = mysql_query($query_for_play_content);

		$row_play = mysql_fetch_array($query_for_play_content_response);

		$temp_array = array();

		array_push($temp_array, mysql_real_escape_string($_POST['template_id']));

		array_push($temp_array, $row_play['username']);

		array_push($temp_array, $row_play['template_name']);
		
		array_push($temp_array, $row_play['template_framework']);

			/*
			* Code to sync files
			*/

		if(is_user_an_editor($template_id,$_SESSION['toolkits_logon_id'])){
		
			if(!isset($xerte_toolkits_site->learning_objects->{$temp_array[3] . "_" . $temp_array[2]}->preview_file)){
				
				require("../../../modules/" . $temp_array[2] . "/publish.php");
				
				publish($row_play, $_POST['template_id']);
				
				echo UPDATE_SUCCESS;
			
			}else{
		
				$preview_xml = file_get_contents($xerte_toolkits_site->users_file_area_full . $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2] . "/" . $xerte_toolkits_site->learning_objects->{$temp_array[3] . "_" . $temp_array[2]}->preview_file);

				$data_handle = fopen($xerte_toolkits_site->users_file_area_full . $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2] . "/" . $xerte_toolkits_site->learning_objects->{$temp_array[3] . "_" . $temp_array[2]}->public_file,"w");

				fwrite($data_handle,$preview_xml);

				fclose($data_handle);

				echo UPDATE_SUCCESS;
			
			}
			
		}

	}

}

?>