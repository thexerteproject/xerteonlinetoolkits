<?php 
require_once(dirname(__FILE__) . '/../../config.php');
/**
 * 
 * module functions page, shared functions for this module
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once(dirname(__FILE__) . '/../../config.php');

/**
 * 
 * Function dont_show_template
 * This function outputs the HTML for people have no rights to this template
 * @version 1.0
 * @author Patrick Lockley
 */

function dont_show_template(){


    _load_language_file("/modules/xerte/module_functions.inc");

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <script src="modules/Xerte/javascript/swfobject.js"></script>
    <script src="website_code/scripts/opencloseedit.js"></script>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
    <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
    </head>

    <body>

    <div style="margin:0 auto; width:800px">
    <div class="edit_topbar" style="width:800px">
        <img src="website_code/images/edit_xerteLogo.jpg" style="margin-left:10px; float:left" />
        <img src="website_code/images/edit_UofNLogo.jpg" style="margin-right:10px; float:right" />
    </div>	
    <div style="margin:0 auto">
<?PHP

    echo XERTE_DISPLAY_FAIL;

    ?></div></div></body></html><?PHP

        die();

}

$folder_id_array = array();
$folder_array = array();
$file_array = array();
$delete_file_array = array();
$delete_folder_array = array();
$zipfile = "";

function export_template($row, $fullArchive){

	global $xerte_toolkits_site, $folder_id_array, $folder_array, $file_array, $delete_file_array, $delete_folder_array, $zipfile;

	include "archive.php";
	include "scorm_library.php";
	include "scorm2004_library.php";
	include "../xmlInspector.php";
	include "../screen_size_library.php";
	include "../user_library.php";
	include "../url_library.php";

	/*
	 * Set up the paths
	 */
	$dir_path = $xerte_toolkits_site->users_file_area_full . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";
	$parent_template_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/parent_templates/" . $row['template_name'] . "/";
	$export_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/export/";
	$scorm_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/scorm/";
	$scorm2004_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/scorm2004/";

	/*
	 * Make the zip
	 */
	$zipfile = new zip_file("example_zipper_new" . time() . ".zip");
	$zipfile->set_options(array('basedir' => $dir_path, 'prepand' => "", 'inmemory' => 1, 'recurse' => 1, 'storepaths' => 1));

	/*
	 * Copy the core files over from the parent folder
	 */
	copy($dir_path . "data.xml",$dir_path . "template.xml");
	$xml = new XerteXMLInspector();
	$xml->loadTemplateXML($dir_path . 'template.xml');
	if ($fullArchive){
	  _debug("Full archive");
	  export_folder_loop($parent_template_path);
	}
	else /* Only copy used models and the common folder */
	{
	  _debug("Deployment archive");
	  $models = $xml->getUsedModels();
	  foreach($models as $model)
	  {
		_debug("copy model " . $parent_template_path . "models/" . $model . ".rlm");
		array_push($file_array, $parent_template_path . "models/" . $model . ".rlm");
	  }
	  array_push($file_array, $parent_template_path . $row['template_name'] . ".rlt");
	  export_folder_loop($parent_template_path . "common/");
	}
	if(isset($_GET['local'])){
		if($_GET['local']=="true"){
			$string = file_get_contents($dir_path . "/template.xml");
			$string = str_replace($xerte_toolkits_site->site_url . $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/", "", $string);
			$fh = fopen($dir_path . "/template.xml", 'w+');
			fwrite($fh,$string);
			fclose($fh);
		}
	}
	copy_parent_files();

		/*
		 * Language support
		 */
	
	export_folder_loop($xerte_toolkits_site->root_file_path . 'languages/', false, '.xml');
	copy_extra_files();

	/*
	 * Copy engine and support files
	 *
	 * From $export_path
	 */
	copy($export_path . "rloObject.js", $dir_path . "rloObject.js");
	array_push($delete_file_array,  $dir_path . "rloObject.js");
	copy($export_path . "MainPreloader.swf", $dir_path . "MainPreloader.swf");
	array_push($delete_file_array,  $dir_path . "MainPreloader.swf");
	copy($export_path . "resources.swf", $dir_path . "resources.swf");
	array_push($delete_file_array,  $dir_path . "resources.swf");
	/*
	 *  From root
	 */
	copy($xerte_toolkits_site->root_file_path . "XMLEngine.swf", $dir_path . "XMLEngine.swf");
	array_push($delete_file_array,  $dir_path . "XMLEngine.swf");

	/*
	 * If scorm copy the scorm files as well
	 */
	$scorm=mysql_real_escape_string($_GET['scorm']);
	if($scorm=="true"){
		export_folder_loop($scorm_path);
		copy_scorm_files();
	}else if ($scorm=="2004") {
		export_folder_loop($scorm2004_path);
		copy_scorm2004_files();
	}

	if($scorm=="true" || $scorm=="2004"){
		copy($dir_path . $row['template_name'] . ".rlt", $dir_path . "learningobject.rlo");
		unlink($dir_path . $row['template_name'] . ".rlt");
		array_push($delete_file_array,  $dir_path . "learningobject.rlo");
	}else{
		copy($dir_path . $row['template_name'] . ".rlt", $dir_path . "learningobject.rlt");
		unlink($dir_path . $row['template_name'] . ".rlt");
		array_push($delete_file_array,  $dir_path . "learningobject.rlt");
	}
	
	/*
	 * if used copy extra folders
	 */
	/*
	 *  jmol
	 */
	if ($xml->modelUsed("jmol"))
	{
		export_folder_loop($xerte_toolkits_site->root_file_path . "JMolViewer/");
		copy_extra_files();
	}
	/*
	 * mapstraction
	 */
	if ($xml->modelUsed("mapstraction"))
	{
		export_folder_loop($xerte_toolkits_site->root_file_path . "mapstraction/");
		copy_extra_files();
	}
	/*
	 * mediaViewer
	 */
	if ($xml->mediaIsUsed())
	{
	   export_folder_loop($xerte_toolkits_site->root_file_path . "mediaViewer/");
	   copy_extra_files();
	}

	export_folder_loop($dir_path);

	/*
	 * Create scorm manifests or a basic HTML page
	 */
	 
	if($scorm=="true"){
			if(isset($_GET['data'])){
				if($_GET['data']==true){

						  $query = "select * from " . $xerte_toolkits_site->database_table_prefix ."templatesyndication where template_id = " . mysql_real_escape_string($_GET['template_id']);
						$query_response_metadata = mysql_query($query);
						$metadata = mysql_fetch_array($query_response_metadata);
						$query = "select * from " . $xerte_toolkits_site->database_table_prefix ."templaterights, " . $xerte_toolkits_site->database_table_prefix ."logindetails  where template_id = " . mysql_real_escape_string($_GET['template_id']) . " and login_id = user_id";
						$query_response_users = mysql_query($query);
						lmsmanifest_create_rich($row, $metadata, $query_response_users);
					}
			}else{
			lmsmanifest_create($row['zipname']);
		}
		scorm_html_page_create($row['template_name'],$row['template_framework']);
	}else if ($scorm=="2004"){
		// Get the name of the learning object

		$xml = file_get_contents($dir_path . 'template.xml');
		$template_data = simplexml_load_string($xml);
		$lo_attrs = $template_data->attributes();
		$lo_name = (string)$lo_attrs['name'];

		lmsmanifest_2004_create($row['zipname'], $lo_name);
		scorm2004_html_page_create($row['template_name'],$row['template_framework'],$lo_name);
	}else{
		basic_html_page_create($row['template_name'],$row['template_framework']);
	}
	
	/*
	 * Add the files to the zip file, create the archive, then send it to the user
	 */
	 
	xerte_zip_files($fullArchive, $dir_path);
	$zipfile->create_archive();
	$zipfile->download_file($row['zipname']);

	/*
	 * remove the files
	 */
	clean_up_files();
	unlink($dir_path . "template.xml");

}

?>
