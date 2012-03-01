<?PHP     /**
* 
* Update file, code that runs when an editor window closes and the user is given the option of synchronising the files
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

require_once('../../../config.php');

require('../../../session.php');

_load_language_file("/website_code/php/versioncontrol/update_file.inc");

require('../template_status.php');

if(is_numeric($_POST['template_id'])){

	if(!empty($_POST['file_path'])){

		$temp_array = explode("-",str_replace($xerte_toolkits_site->users_file_area_full,"",stripcslashes($_POST['file_path'])));

	}else{

		$query_for_play_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

		$query_for_play_content = str_replace("TEMPLATE_ID_TO_REPLACE", mysql_real_escape_string($_POST['template_id']), $query_for_play_content_strip);

		$query_for_play_content_response = mysql_query($query_for_play_content);

		$row_play = mysql_fetch_array($query_for_play_content_response);

		$temp_array = array();

		array_push($temp_array, mysql_real_escape_string($_POST['template_id']));

		array_push($temp_array, $row_play['username']);

		array_push($temp_array, $row_play['template_name']);

	}
		/*
		* Code to sync files
		*/

	if(is_user_an_editor($temp_array[0],$_SESSION['toolkits_logon_id'])){

		$preview_xml = file_get_contents($xerte_toolkits_site->users_file_area_full . $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2] . "/preview.xml");

		$data_handle = fopen($xerte_toolkits_site->users_file_area_full . $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2] . "/data.xml","w");

		fwrite($data_handle,$preview_xml);

		fclose($data_handle);

		echo UPDATE_SUCCESS;
		
	}

}

?>