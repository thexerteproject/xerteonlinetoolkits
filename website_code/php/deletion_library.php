<?PHP 
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
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