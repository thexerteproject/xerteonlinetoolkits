<?PHP /**
* 
* delete_template, allows the template to be deleted (placed in the recycle bin)
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

	include "../database_library.php";
	include "../user_library.php";
	include "../deletion_library.php";
	include "../template_status.php";
	require("../../../config.php");
	require("../../../session.php");
	
	$database_id = database_connect("delete template database connect success","delete template database connect failed");

	/*
	* get the folder id to delete
	*/

	$safe_template_id = mysql_real_escape_string($_POST['template_id']);

	if(!is_template_syndicated($safe_template_id)){

		if(is_user_creator($safe_template_id)){

			$query_for_folder_id = "select * from " .$xerte_toolkits_site->database_table_prefix . "templaterights where template_id=\"" . $safe_template_id . "\"";

			$query_for_folder_id_response = mysql_query($query_for_folder_id);

			$row = mysql_fetch_array($query_for_folder_id_response);
		
			// delete from the database 

			$query_to_delete_template = "update " .$xerte_toolkits_site->database_table_prefix . "templaterights set folder=\"" . get_recycle_bin() . "\" where template_id=\"" . $safe_template_id . "\" and user_id=\"" . $_SESSION['toolkits_logon_id'] . "\"";

			if(mysql_query($query_to_delete_template)){

				receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Moved file to users recycle bin", "Moved file to users recycle bin");

			}else{
			
				receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to move file to the recycle bin", "Failed to move file to the recycle bin");	

			}
		

		}else{

			echo "Sorry you aren't the creator of this file and as such cannot delete it";
	
		}

	}else{

		echo "Sorry you cannot delete a syndicated project. To delete this project, first turn off syndication in the project's properties.";
	
	}


	mysql_close($database_id);

?>