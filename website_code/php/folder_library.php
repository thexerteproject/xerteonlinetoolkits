<?PHP     include 'database_library.php';
include 'file_library.php';
include 'user_library.php';
include 'error_library.php';
require_once('../../../config.php');
require_once('../../../session.php');

	/**
	 * 
	 * Function make new folder
 	 * This function is used to send an error email meesage
 	 * @param string $folder_id = id for the new folder
  	 * @param string $folder_name = Name of the new folder
	 * @version 1.0
	 * @author Patrick Lockley
	 */


function make_new_folder($folder_id,$folder_name){

	global $xerte_toolkits_site;

	$mysql_id = database_connect("New folder database connect success","New folder database connect failed");

	if($folder_id=="file_area"){

		$query = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "folderdetails (login_id,folder_parent,folder_name,date_created) values  ('" . $_SESSION['toolkits_logon_id'] . "','" . get_user_root_folder() . "','" . $folder_name  ."','" . date('Y-m-d') . "')";

	}else{

		$query = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "folderdetails (login_id,folder_parent,folder_name,date_created) values  ('" . $_SESSION['toolkits_logon_id'] . "','" . $folder_id . "','" . $folder_name . "','" . date('Y-m-d') . "')";

	}

	if(mysql_query($query)){

		receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder creation succeeded for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);

		echo "The folder has been created";

	}else{

		receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder creation failed for " . $_SESSION['toolkits_logon_username'], "Folder creation failed for " . $_SESSION['toolkits_logon_username']);

		echo "Error creating folder";

	}

	mysql_close($mysql_id);
	

}

	/**
	 * 
	 * Function delete folder
 	 * This function is used to send an error email meesage
 	 * @param string $folder_id = id for the new folder
  	 * @param string $folder_name = Name of the new folder
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function delete_folder($folder_id){

	global $xerte_toolkits_site;

	$database_id = database_connect("Delete folder database connect success","Delete folder database connect failed");

	$folder_id = substr($folder_id,strpos($folder_id,"_")+1,strlen($folder_id));

	echo $folder_id;

	$query_to_delete_folder = "delete from " .$xerte_toolkits_site->database_table_prefix . "folderdetails where folder_id=\"" . $folder_id . "\""; 

	echo $query_to_delete_folder;

	if(mysql_query($query_to_delete_folder)){

		receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder " . $folder_id . " deleted for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);

	}else{

		receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder " . $folder_id . " not deleted for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);

	}

	mysql_close($database_id);
	
}

	/**
	 * 
	 * Function move file
 	 * This function is used to move files and folders
 	 * @param array $files_to_move = an array of files and folders to move
  	 * @param string $destination = Name of the new folder
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function move_file($files_to_move,$destination){

	global $xerte_toolkits_site;

	$mysql_id = database_connect("Move file database connect success", "Move file database connect failure");

	$new_files_array=explode(",",$files_to_move);

	/*
	* Files array can be complicated, and this thread can lock the system, so limit max files to 50
	*/

	if((count($new_files_array)!=0)&&(count($new_files_array)<=50)){

		/*
		* check their is a destination
		*/

		if(($destination!="")){

			for($x=0;$x!=count($new_files_array);$x++){
			
				// check there are files

				if($new_files_array[$x]!=""){

					if($new_files_array[$x+1]=="file"){

						if($new_files_array[$x+2]=="folder_workspace"){

							$parent = get_user_root_folder();				

						}

						if($destination=="folder_workspace"){

							$destination = get_user_root_folder();				

						}

						if($destination=="recyclebin"){

							$destination = get_recycle_bin();				

						}
						
						/*
						* Move files in the database
						*/

						$query_file = "UPDATE " .$xerte_toolkits_site->database_table_prefix . "templaterights SET folder = \"" . $destination . "\" where (template_id=\"" . $new_files_array[$x] . "\" AND user_id =\"" . $_SESSION['toolkits_logon_id'] . "\")";

						if(mysql_query($query_file)){

							receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $new_files_array[$x]. " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "File " . $new_files_array[$x]. " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username']);	

						}else{

							receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $new_files_array[$x]. " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "File " . $new_files_array[$x]. " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username']);	

						}
	
					}else{
					
						/*
						* destination is the root folder
						*/

						if($destination=="folder_workspace"){

							$destination = get_user_root_folder();				

						}

						$query_folder = "UPDATE " .$xerte_toolkits_site->database_table_prefix . "folderdetails SET folder_parent = \"" . $destination . "\" where (folder_id=\"" . $new_files_array[$x] . "\")";

						if(mysql_query($query_folder)){

							receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder " . $new_files_array[$x]. " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "File " . $new_files_array[$x]. " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username']);	
	
						}else{

							receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $new_files_array[$x]. " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "Folder " . $new_files_array[$x]. " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username']);	

						}

					}

				$x+=2;		

				}

			}

		}

	}

	mysql_close($mysql_id);

}

?>