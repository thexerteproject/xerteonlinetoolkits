<?PHP     /**
* 
* duplicate_template, allows the template to be duplicated
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

	require("../../../config.php");
	require("../../../session.php");
	include "../user_library.php";
	include "../template_library.php";
	include "../database_library.php";
	include "../template_status.php";
	include "../error_library.php";

	$database_connect_id = database_connect("new_template database connect success","new_template database connect fail");

	/*
	* get the root folder for this user
	*/

	if(is_user_creator(mysql_real_escape_string($_POST['template_id']))){

		if($_POST['folder_id']=="workspace"){

			$folder_id = get_user_root_folder();

		}else{

			$folder_id = $_POST['folder_id'];

		}

		/*
		* get the maximum id number from templates, as the id for this template
		*/

		$maximum_template_id = get_maximum_template_number();

		//$query_for_root_folder = "select folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where login_id = '" .  $_SESSION['toolkits_logon_id'] . "' and folder_parent='0'";

		//$query_for_root_folder_response = mysql_query($query_for_root_folder);

		//$row_root = mysql_fetch_array($query_for_root_folder_response); 

		$query_for_template_type_id = "select " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_name, template_framework from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails, " . $xerte_toolkits_site->database_table_prefix . "templatedetails where " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_type_id  AND template_id = '" .  mysql_real_escape_string($_POST['template_id']) . "'";

		$query_for_template_type_id_response = mysql_query($query_for_template_type_id);	

		$row_template_type = mysql_fetch_array($query_for_template_type_id_response);	

		/*
		* create the new template record in the database
		*/

		$query_for_new_template = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "templatedetails (template_id, creator_id, template_type_id, date_created, date_modified, access_to_whom, template_name) VALUES (\"" . ($maximum_template_id+1) . "\",\"" . $_SESSION['toolkits_logon_id'] . "\", \"" . $row_template_type['template_type_id'] . "\",\"" . date('Y-m-d') . "\",\"" . date('Y-m-d') . "\",\"Private\",\"Copy of " . mysql_real_escape_string($_POST['template_name']) . "\")";

		if(mysql_query($query_for_new_template)){

			$query_for_template_rights = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "templaterights (template_id,user_id,role, folder) VALUES (\"" . ($maximum_template_id+1) . "\",\"" .  $_SESSION['toolkits_logon_id'] . "\", \"creator\" ,\"" . mysql_real_escape_string($folder_id) . "\")";

			if(mysql_query($query_for_template_rights)){		

				receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Created new template record for the database", $query_for_new_template . " " . $query_for_template_rights);

				include $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . $row_template_type['template_framework']  . "/duplicate_template.php";

				duplicate_template(($maximum_template_id+1),$_POST['template_id'],$row_template_type['template_name']);
			
			}else{

				receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_template_rights);

				echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);

			}

		}else{

			receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_new_template);

			echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);

		}

		mysql_close($database_connect_id);	

	}else{

		echo "Only project creators can duplicate a project";

	}

?>