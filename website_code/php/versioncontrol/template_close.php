<?PHP     /**
* 
* template close, code that runs when an editor window is closed to remove the lock file
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

require('../../../config.php');

require('../../../session.php');

require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/versioncontrol/template_close.inc";

require('../template_status.php');

$temp_array = explode("-",$_POST['file_path']);

if(file_exists($xerte_toolkits_site->users_file_area_full . $_POST['file_path'] . "lockfile.txt")){

	/*
	*  Code to delete the lock file
	*/

	include('../database_library.php');

	$lock_file_data = file_get_contents($xerte_toolkits_site->users_file_area_full . $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2] . "/lockfile.txt");

	$temp = explode("*",$lock_file_data);

	$lock_file_creator = $temp[0];

	$template_id = explode("-",$_POST['file_path']);

	$mysql_id = database_connect("Version Control Database connect success","Version Control database connect failed");

	$query_for_file_name = "select template_name from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where template_id =\"" . $template_id[0] . "\"";

	$query_response = mysql_query($query_for_file_name);

	$row_template_name = mysql_fetch_array($query_response);

	$user_list = $temp[1];

	$users = explode(" ",$user_list);
	
	/*
	* Email users in the lock file
	*/

	for($x=0;$x!=count($users)-1;$x++){

		mail($users[$x] . "@" . $xerte_toolkits_site->email_add_to_username, TEMPLATE_CLOSE_FILE . " - \"" . str_replace("_"," ",$row_template_name['template_name']) ."\"", TEMPLATE_CLOSE_EMAIL_GREETINGS . "<br><br> " . TEMPLATE_CLOSE_EMAIL_INTRODUCTION . " \"" . str_replace("_"," ",$row_template_name['template_name']) . "\" " . TEMPLATE_CLOSE_EMAIL_MESSAGE . date("h:i a") . " on " . date("l, jS F") . " <br><br> " . TEMPLATE_CLOSE_EMAIL_MESSAGE_MORE . TEMPLATE_CLOSE_EMAIL_LOG_IN . "<a href=\"" . $xerte_toolkits_site->site_url . "\">" . $xerte_toolkits_site->site_url . "</a>. <br><br> " . TEMPLATE_CLOSE_EMAIL_CLOSING_SUBJECT . ", <br><br>" . TEMPLATE_CLOSE_EMAIL_SIGNATURE, $xerte_toolkits_site->headers);

	}

	unlink($xerte_toolkits_site->users_file_area_full . $_POST['file_path'] . "lockfile.txt");

}

	/*
	* Code to check to see if we should warn on a publish
	*/

if(is_user_an_editor($temp_array[0],$_SESSION['toolkits_logon_id'])){

	$preview_xml = file_get_contents($xerte_toolkits_site->users_file_area_full . $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2] . "/preview.xml");

	$data_xml = file_get_contents($xerte_toolkits_site->users_file_area_full . $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2] . "/data.xml");

	if($data_xml!=$preview_xml){

		echo TEMPLATE_CLOSE_QUESTION . "~*~" . $xerte_toolkits_site->users_file_area_full . $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2];

	}

}


?>