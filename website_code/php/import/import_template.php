<?PHP


    /**
	 * 
	 * Import template, imports a new blank template for the site
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */

$delete_folder_array = array();
$delete_file_array = array();
$copy_file_array = array();

ini_set('memory_limit','64M');

	/**
	 * 
	 * Function delete loop
 	 * This function checks http security settings
	 * @param string $path = the path we are deleting
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function delete_loop($path){

	global $delete_folder_array, $delete_file_array;

	$d = opendir($path);
	
	while($f = readdir($d)){

		if(is_dir($path . $f)){
	
			if(($f!=".")&&($f!="..")){

				delete_loop($path . $f . "/");

			}			
	
		}else{

			array_push($delete_file_array, $path . "/" . $f);

		}
		
	}	

	closedir($d);
	
}

	/**
	 * 
	 * Function copy loop
 	 * This function checks http security settings
	 * @param string path = the path we are copying
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function copy_loop($path){

	global $copy_file_array;

	$d = opendir($path);
	
	while($f = readdir($d)){

		if(is_dir($path . $f)){
	
			if(($f!=".")&&($f!="..")){

				copy_loop($path . $f);

			}			
	
		}else{

			array_push($copy_file_array,$f);
			
		}
		
	}	

	closedir($d);
	
}

/*
*
*/

if(($_FILES['filenameuploaded']['type']=="application/x-zip-compressed")||($_FILES['filenameuploaded']['type']=="application/zip")){

	require("../../../config.php");
	require("../../../session.php");

	require("../database_library.php");

	$this_dir = rand() . "/";

	$end_dir = $this_dir;

	mkdir($xerte_toolkits_site->import_path . $this_dir);

	chmod($xerte_toolkits_site->import_path . $this_dir,0777);

	$new_file_name = $xerte_toolkits_site->import_path . $_FILES['filenameuploaded']['name'];

	if(@move_uploaded_file($_FILES['filenameuploaded']['tmp_name'], $new_file_name)){

		require_once dirname(__FILE__)."/dUnzip2.inc.php";

		$zip = new dUnzip2($new_file_name);

		$zip->debug = false;

		$zip->getList();

		$zip->unzipAll($xerte_toolkits_site->import_path . $this_dir);

	}
	
	$zip->close();
	
	unlink($new_file_name);

	if($_POST['folder']!=""){
	
		/*
		* We are replacing, so delete files
		*/

		delete_loop($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $_POST['folder'] . "/");
		delete_loop($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $_POST['folder'] . "/");

		while($file_to_delete = array_pop($delete_file_array)){

			@unlink($file_to_delete);

		}

	}else{

		$dir = opendir($xerte_toolkits_site->import_path . $this_dir . substr($_FILES['filenameuploaded']['name'],0,strlen($_FILES['filenameuploaded']['name'])-4));
	
		//echo ($xerte_toolkits_site->import_path . $this_dir . substr($_FILES['filenameuploaded']['name'],0,strlen($_FILES['filenameuploaded']['name'])-4) . "\n";

		if($dir===false){

			delete_loop($xerte_toolkits_site->import_path . $this_dir);

			while($file_to_delete = array_pop($delete_file_array)){

				@unlink($file_to_delete);

			}

			rmdir($xerte_toolkits_site->import_path . $this_dir);

			echo "Zip file not properly structured. HERE I AM ****";

			die();

		}

		$rlt_not_found = false;

		while($filename = readdir($dir)){

			/*
			* Get the variables from out of the RLT
			*/

			if($filename=="template.rlt"){

				$string = file_get_contents($xerte_toolkits_site->import_path . $this_dir . substr($_FILES['filenameuploaded']['name'],0,strlen($_FILES['filenameuploaded']['name'])-4) . "/" . $filename);

				if((strpos($string, "targetFolder=")===false)||(strpos($string, "name=")===false)||(strpos($string, "description=")===false)){

					delete_loop($xerte_toolkits_site->import_path . $this_dir);

					echo "Template not setup correctly to work on toolkits. ****";

					while($file_to_delete = array_pop($delete_file_array)){

						@unlink($file_to_delete);

					}

					rmdir($xerte_toolkits_site->import_path . $this_dir);

					die();

				}else{

					$folder = substr(substr($string, strpos($string, "targetFolder=")+14),0,strpos(substr($string, strpos($string, "targetFolder=")+14),"\""));

					$name = substr(substr($string, strpos($string, "name=")+6),0,strpos(substr($string, strpos($string, "name=")+6),"\""));

					$desc = substr(substr($string, strpos($string, "description=")+13),0,strpos(substr($string, strpos($string, "description=")+13),"\""));

					$rlt_not_found = true;

				}

			}		

		}

		if(!$rlt_not_found){

			delete_loop($xerte_toolkits_site->import_path . $this_dir);

			while($file_to_delete = array_pop($delete_file_array)){

				@unlink($file_to_delete);

			}

			rmdir($xerte_toolkits_site->import_path . $this_dir);

			echo "No file called template.rlt found. ****";

			die();

		}

	}

	if($_POST['folder']==""){
	
		/*
		* Make all the new folders
		*/

		$parent = fileperms($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/");
		$templates = fileperms($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/");

		@chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/",0777);
		@chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/",0777);

		@mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/");
		@mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/common/");
		@mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/thumbs/");
		@mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/models/");
		@mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $folder . "/");
		@mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $folder . "/media/");

		@chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/",0777);
		@chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/common/",0777);
		@chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/thumbs/",0777);
		@chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/models/",0777);
		@chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $folder . "/",0777);
		@chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $folder . "/media/",0777);

		@chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/",$parent);
		@chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/",$templates);

		$this_dir .= substr($_FILES['filenameuploaded']['name'],0,strlen($_FILES['filenameuploaded']['name'])-4) . "/";

	}else{

		$folder = mysql_real_escape_string($_POST['folder']);

	}

	copy_loop($xerte_toolkits_site->import_path . $this_dir . "media");

	while($file_to_copy = array_pop($copy_file_array)){

		@rename($xerte_toolkits_site->import_path . $this_dir . "media/" . $file_to_copy, $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $folder . "/media/" . $file_to_copy);

	}

	/*
	* Remove files
	*/

	delete_loop($xerte_toolkits_site->import_path . $this_dir . "media");

	while($file_to_delete = array_pop($delete_file_array)){

		@unlink($file_to_delete);

	}

	copy_loop($xerte_toolkits_site->import_path . $this_dir . "thumbs");

	while($file_to_copy = array_pop($copy_file_array)){

		@rename($xerte_toolkits_site->import_path . $this_dir . "thumbs/" . $file_to_copy, $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/thumbs/" . $file_to_copy);

	}

	delete_loop($xerte_toolkits_site->import_path . $this_dir . "thumbs");

	while($file_to_delete = array_pop($delete_file_array)){

		@unlink($file_to_delete);

	}

	copy_loop($xerte_toolkits_site->import_path . $this_dir . "common");

	while($file_to_copy = array_pop($copy_file_array)){

		@rename($xerte_toolkits_site->import_path . $this_dir . "common/" . $file_to_copy, $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/common/" . $file_to_copy);

	}	

	delete_loop($xerte_toolkits_site->import_path . $this_dir . "common");

	while($file_to_delete = array_pop($delete_file_array)){

		@unlink($file_to_delete);

	}

	while($file_to_copy = array_pop($copy_file_array)){

		@rename($xerte_toolkits_site->import_path . $this_dir . "models/" . $file_to_copy, $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/common/" . $file_to_copy);

	}	

	delete_loop($xerte_toolkits_site->import_path . $this_dir . "models");

	while($file_to_delete = array_pop($delete_file_array)){

		@unlink($file_to_delete);

	}

	delete_loop($xerte_toolkits_site->import_path . $this_dir);

	while($file_to_delete = array_pop($delete_file_array)){

		@unlink($file_to_delete);

	}

	rmdir($xerte_toolkits_site->import_path . $this_dir . "common");
	rmdir($xerte_toolkits_site->import_path . $this_dir . "media");
	rmdir($xerte_toolkits_site->import_path . $this_dir . "thumbs");
	rmdir($xerte_toolkits_site->import_path . $this_dir . "models");

	rename($xerte_toolkits_site->import_path . $this_dir . "template.rlt", $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/" .  $folder . ".rlt");

	rename($xerte_toolkits_site->import_path . $this_dir . "template.xml", $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $folder . "/data.xml");

	rename($xerte_toolkits_site->import_path . $this_dir . "template.xwd", $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/data.xwd");

	if($_POST['folder']==""){
	
		/*
		* No folder was posted, so add records to the database id.
		*/

		$mysql_id = database_connect("Import_template.php database connect success", "Import_template.php database connect failure");

		$query = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails (template_framework, template_name, description, date_uploaded, display_name, display_id, access_rights, active) values  ('xerte','" . $folder . "','" . $desc  ."','" . date('Y-m-d') . "','" . $name . "','0','','false')";

		if(mysql_query($query)){

			receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder creation succeeded for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);

			echo "The folder has been created****";

			rmdir(substr($xerte_toolkits_site->import_path . $end_dir,-1));

		}else{

			receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder creation failed for " . $_SESSION['toolkits_logon_username'], "Folder creation failed for " . $_SESSION['toolkits_logon_username']);

			echo "Error creating folder****";

			rmdir(substr($xerte_toolkits_site->import_path . $end_dir,-1));

		}

		mysql_close($mysql_id);

	}

}