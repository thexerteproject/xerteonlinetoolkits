<?PHP     /**
	 * 
	 * Function lmsmanifest_create
 	 * This function creates a scorm manifest
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function lmsmanifest_create($name){

	global $dir_path, $delete_file_array, $zipfile;

	$scorm_top_string = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><manifest xmlns=\"http://www.imsproject.org/xsd/imscp_rootv1p1p2\" xmlns:imsmd=\"http://www.imsglobal.org/xsd/imsmd_rootv1p2p1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:adlcp=\"http://www.adlnet.org/xsd/adlcp_rootv1p2\" identifier=\"MANIFEST-90878C16-EB60-D648-94ED-9651972B5F38\" xsi:schemaLocation=\"http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd\"><metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>";

	$date = time();

	$scorm_personalise_string = "";
	$scorm_personalise_string .= "<organizations default=\"" . "XERTE-ORG-" . $date . "\">";
	$scorm_personalise_string .= "<organization identifier=\"" . "XERTE-ORG-" . $date . "\" structure=\"hierarchical\">";
	$scorm_personalise_string .= "<title>" . str_replace("_"," ",$name) . "</title>";
	$scorm_personalise_string .= "<item identifier=\"" . "XERTE-ITEM-" . $date . "\" identifierref=\"" .  "XERTE-RES-" . $date . "\" isvisible=\"true\">";
	$scorm_personalise_string .= "<title>" . "My learning object title" . "</title>";

	$scorm_bottom_string = "</item></organization></organizations><resources><resource type=\"webcontent\" adlcp:scormtype=\"sco\" identifier=\"" .  "XERTE-RES-" . $date . "\" href=\"scormRLO.htm\"><file href=\"scormRLO.htm\" /><file href=\"MainPreloader.swf\" /><file href=\"XMLEngine.swf\" /></resource></resources></manifest>";

	$file_handle = fopen($dir_path . "imsmanifest.xml", 'w');

	$buffer = $scorm_top_string . $scorm_personalise_string . $scorm_bottom_string;

	fwrite($file_handle,$buffer,strlen($buffer));
	fclose($file_handle);

	$zipfile->add_files("imsmanifest.xml");
	
	array_push($delete_file_array,  $dir_path . "imsmanifest.xml");
	
}

/**
	 * 
	 * Function lmsmanifest_create
 	 * This function creates a scorm manifest
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function lmsmanifest_create_rich($row, $metadata, $users){

	global $dir_path, $delete_file_array, $zipfile, $xerte_toolkits_site;

	$scorm_top_string = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><manifest xmlns=\"http://www.imsproject.org/xsd/imscp_rootv1p1p2\" xmlns:imsmd=\"http://www.imsglobal.org/xsd/imsmd_rootv1p2p1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:adlcp=\"http://www.adlnet.org/xsd/adlcp_rootv1p2\" identifier=\"MANIFEST-90878C16-EB60-D648-94ED-9651972B5F38\" xsi:schemaLocation=\"http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd\"><metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion>";
	
	$scorm_top_string .= "<imsmd:lom><imsmd:general><imsmd:identifier><imsmd:catalog>" . $xerte_toolkits_site->site_title . "</imsmd:catalog><imsmd:entry>A180_2</imsmd:entry></imsmd:identifier><imsmd:title><imsmd:string language=\"en-GB\">" . $row['zipname'] . "</imsmd:string></imsmd:title><imsmd:language>en-GB</imsmd:language><imsmd:description><imsmd:string language=\"en-GB\">" . $metadata['description'] . "</imsmd:string></imsmd:description>";
	
	$keyword = explode(",",$metadata['keywords']);
	
	while($word = array_pop($keyword)){
	
		$scorm_top_string .= "<imsmd:keyword><imsmd:string language=\"en-GB\">" . $word . "</imsmd:string></imsmd:keyword>";
	
	}
	
	while($user = mysql_fetch_array($users)){
	
		$scorm_top_string .= "</imsmd:general><imsmd:lifeCycle><imsmd:contribute><imsmd:role><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>author</imsmd:value></imsmd:role><imsmd:entity>" . $user['firstname'] . " " . $user['surname'] . "</imsmd:entity></imsmd:contribute></imsmd:lifeCycle>";
	
	}
	
	$scorm_top_string .= "<imsmd:technical><imsmd:format>text/html</imsmd:format><imsmd:location>" . url_return("play", mysql_real_escape_string($_GET['template_id'])) . "</imsmd:location></imsmd:technical>";
	
	$scorm_top_string .= "<imsmd:rights><imsmd:copyrightAndOtherRestrictions><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>yes</imsmd:value></imsmd:copyrightAndOtherRestrictions><imsmd:description><imsmd:string language=\"en-GB\">" . $metadata['licenses'] . "</imsmd:string><imsmd:string language=\"x-t-cc-url\">" . $metadata['licenses'] . "</imsmd:string></imsmd:description></imsmd:rights>";
	
	$scorm_top_string .= "</imsmd:lom></metadata>";

	$date = time();

	$scorm_personalise_string = "";
	$scorm_personalise_string .= "<organizations default=\"" . "XERTE-ORG-" . $date . "\">";
	$scorm_personalise_string .= "<organization identifier=\"" . "XERTE-ORG-" . $date . "\" structure=\"hierarchical\">";
	$scorm_personalise_string .= "<title>" . str_replace("_"," ",$row['zipname']) . "</title>";
	$scorm_personalise_string .= "<item identifier=\"" . "XERTE-ITEM-" . $date . "\" identifierref=\"" .  "XERTE-RES-" . $date . "\" isvisible=\"true\">";

	$scorm_bottom_string = "</item></organization></organizations><resources><resource type=\"webcontent\" adlcp:scormtype=\"sco\" identifier=\"" .  "XERTE-RES-" . $date . "\" href=\"scormRLO.htm\"><file href=\"scormRLO.htm\" /><file href=\"MainPreloader.swf\" /><file href=\"XMLEngine.swf\" /></resource></resources></manifest>";

	$file_handle = fopen($dir_path . "imsmanifest.xml", 'w');

	$buffer = $scorm_top_string . $scorm_personalise_string . $scorm_bottom_string;

	fwrite($file_handle,$buffer,strlen($buffer));
	fclose($file_handle);

	$zipfile->add_files("imsmanifest.xml");
	
	array_push($delete_file_array,  $dir_path . "imsmanifest.xml");
	
}

	/**
	 * 
	 * Function basic html page create
 	 * This function creates a basic HTML page for export
	 * @param string $name - name of the template
 	 * @param string $type - type of template this is
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function basic_html_page_create($name, $type){

	global $xerte_toolkits_site, $dir_path, $delete_file_array, $zipfile;

	$buffer = file_get_contents($xerte_toolkits_site->basic_template_path . $type . "/player/rloObject.htm");

	$temp = get_template_screen_size($name,$type);

	$new_temp = explode("~",$temp);

	$buffer = str_replace("change_width",$new_temp[0],$buffer);
	$buffer = str_replace("change_height",$new_temp[1],$buffer);

	$file_handle = fopen($dir_path . "index.htm", 'w');

	fwrite($file_handle,$buffer,strlen($buffer));
	fclose($file_handle);

	$zipfile->add_files("index.htm");
	
	array_push($delete_file_array,  $dir_path . "index.htm");

}

/**
* 
* Function scorm html page create
* This function creates a scorm HTML page for export
* @param string $name - name of the template
* @param string $type - type of template this is
* @version 1.0
* @author Patrick Lockley
*/

function scorm_html_page_create($name, $type){

	global $scorm_path, $dir_path, $delete_file_array, $zipfile;

	$scorm_html_page_content = file_get_contents($scorm_path . "scormRLO.htm");

	$temp = get_template_screen_size($name,$type);

	$new_temp = explode("~",$temp);

	$scorm_html_page_content = str_replace("rloWidth = 800","rloWidth = " . $new_temp[0],$scorm_html_page_content);
	$scorm_html_page_content = str_replace("rloHeight = 600","rloHeight = " . $new_temp[0],$scorm_html_page_content);

	$file_handle = fopen($dir_path . "scormRLO.htm", 'w');

	fwrite($file_handle,$scorm_html_page_content,strlen($scorm_html_page_content));
	fclose($file_handle);

	$zipfile->add_files("scormRLO.htm");
	
	array_push($delete_file_array,  $dir_path . "scormRLO.htm");
	
}

	/**
	 * 
	 * Function folder loop
 	 * This function loops through a folder tree collating files
	 * @param string $path - path to move through
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function folder_loop($path){

	global $folder_id_array, $folder_array, $file_array, $zipfile, $dir_path;

	$d = opendir($path);
	
	array_push($folder_id_array, $d);

	while($f = readdir($d)){
	
		if(is_dir($path . $f)){
	
			if(($f!=".")&&($f!="..")){
				
				folder_loop($path . $f . "/");

			}
	
		}else{
	
			if($f!="data.xml"){

				$string = $path . $f;

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
 	 * This function removes files used in making the export
	 * @param string $name - name of the template
 	 * @param string $type - type of template this is
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function clean_up_files(){

	global $dir_path, $delete_file_array, $delete_folder_array;
	
	while($file = array_pop($delete_file_array)){

			@unlink($file);

	}
	
	while($folder = array_pop($delete_folder_array)){
	
			@rmdir($folder);
	
	}

}

	/**
	 * 
	 * Function directory maker
 	 * This function adds directories to file names so as to make the zip names correct
	 * @param string $name - name of the template
 	 * @param string $type - type of template this is
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function directory_maker($string){

	global $dir_path, $delete_folder_array;
	
	$directory_path_array = explode("/", $string);
	
	$x = 0;
	
	while($x!=(count($directory_path_array)-1)){
	
		if($x!=0){
	
			$y=0;
				
			$extra_dir_string = "";
				
			while($y<=$x){
			
 				$extra_dir_string .= $directory_path_array[$y++] . "/";
				
				if(!file_exists($dir_path . $extra_dir_string )){
			
					mkdir($dir_path . $extra_dir_string);
					chmod($dir_path . $extra_dir_string, 0777);
					array_push($delete_folder_array, $dir_path . $extra_dir_string);
					
				}
		
			} 				
				
		}else{
							
			if(!file_exists($dir_path . $directory_path_array[$x] )){					
				
				mkdir($dir_path . $directory_path_array[$x]);
				chmod($dir_path . $directory_path_array[$x], 0777);
				
				array_push($delete_folder_array, $dir_path . $directory_path_array[$x]);

			}
			
		}			
						
				
		$x++;
	
	}

}

    /**
	 * 
	 * Function copy parent files
 	 * This function copies the files from parent template folder into the zip
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function copy_parent_files(){

	global $file_array, $dir_path, $parent_template_path, $delete_file_array;
	
	while($file = array_pop($file_array)){

		$string = str_replace($parent_template_path, "", $file);

		directory_maker($string);

		if($string=="data.xwd"){

			$string="template.xwd";

		}
		
		array_push($delete_file_array, $dir_path . $string);
		
		@copy($file, $dir_path . $string);

	}
	
}
    
	/**
	 * 
	 * Function copy scorm files
 	 * This function copies scorm files into the zip
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function copy_scorm_files(){

	global $file_array, $dir_path, $scorm_path, $delete_file_array;
	
	while($file = array_pop($file_array)){

		if(strpos($file,"scormRLO.htm")===false){

			$string = str_replace($scorm_path, "", $file);
		
			array_push($delete_file_array, $dir_path . $string);
		
			@copy($file, $dir_path . $string);

		}

	}
	
}

	/**
	 * 
	 * Function xerte zip files
 	 * This function zips up the files
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function xerte_zip_files(){

	global $file_array, $zipfile, $dir_path;
	
	while($file = array_pop($file_array)){
		
		if(($file!="data.xwd")||($file!="data.xml")){

			$string = str_replace($dir_path, "", $file);

			$zipfile->add_files($string);

		}

	}
	
}

?>