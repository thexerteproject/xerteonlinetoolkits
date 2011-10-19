<?PHP /**
	 * 
	 * Function delete folder
 	 * This function checks http security settings
	 * @param string $path = path to the folder we are deleting
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function delete_folder_loop($path){

	global $folder_id_array, $folder_array, $file_array, $dir_path;

	$d = opendir($path);
	
	array_push($folder_id_array, $d);

	while($f = readdir($d)){
	
		if(($f!=".")&&($f!="..")){

			if(is_dir($path . $f)){
		

				array_push($folder_array, $path . "/" . $f);	
				
				delete_folder_loop($path . $f);

			
			}else{
	
				$string = $path . "/" . $f;

				echo "adding file to delete " . $string;

				array_push($file_array, $string);
			
			}
		}
		
	}
	
	$x = array_pop($folder_id_array);
	
	closedir($x);
	
}

	/**
	 * 
	 * Function clean up files
 	 * This function removes files from the arrays
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function clean_up_files(){

	global $dir_path, $file_array, $folder_array;
	
	while($file = array_pop($file_array)){

			//unlink($file);

	}
	
	while($folder = array_pop($folder_array)){

			//rmdir($folder);
	
	}

}

$dir_path="";
$temp_dir_path = "";
$temp_new_path = "";

$folder_id_array = array();
$folder_array = array();
$file_array = array();

	/**
	 * 
	 * Function make new template
 	 * This function checks http security settings
	 * @param string $path = path to the template
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function set_up_deletion($path){

	global $dir_path, $new_path, $temp_dir_path, $temp_new_path;

	$dir_path = $path;
	
	/*
	* find the files to delete
	*/

	delete_folder_loop($dir_path);
	
	/*
	* remove the files
	*/

	clean_up_files();

	/*
	* delete the directory for this template
	*/

	rmdir($path);

}

?>