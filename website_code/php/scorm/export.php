<?php
/**
 *
 * export, allows the creation of zip and scorm packages
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
include "archive.php";
include "scorm_library.php";
include "scorm2004_library.php";
include "../xmlInspector.php";
include "../screen_size_library.php";
include "../template_status.php";
include "../user_library.php";
include "../url_library.php";

$folder_id_array = array();
$folder_array = array();
$file_array = array();
$delete_file_array = array();
$delete_folder_array = array();
$fullArchive = false;

ini_set('max_execution_time', 300);

if(is_numeric($_GET['template_id'])){
    $_GET['template_id'] = (int) $_GET['template_id'];
    $proceed = false;
    if(is_template_exportable($_GET['template_id'])){
        $proceed = true;
    }else{
        if(is_user_creator($_GET['template_id'])||is_user_admin()){
            $proceed = true;
        }
    }

    if($proceed){
        if (isset($_GET['full'])){
            if($_GET['full']=="true"){
                $fullArchive = true;
            }

        }
        _debug("Full archive: " . $fullArchive);
        $mysql_id=database_connect("Scorm export database connect success","Scorm export database connect failed");

        /*
         * Get the file path
         */
        $query = "select " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_name as zipname, " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id, " . $xerte_toolkits_site->database_table_prefix . "logindetails.username, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_name, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_framework from " . $xerte_toolkits_site->database_table_prefix . "templaterights, " . $xerte_toolkits_site->database_table_prefix . "logindetails, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails, " . $xerte_toolkits_site->database_table_prefix . "templatedetails where " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_type_id = " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.creator_id = " . $xerte_toolkits_site->database_table_prefix . "logindetails.login_id and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id=\"" . mysql_real_escape_string($_GET['template_id']) . "\" AND role=\"creator\"";
        $query_response = mysql_query($query);
        $row = mysql_fetch_array($query_response);

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
        $zipfile = new zip_file($dir_path  . $row['zipname'] . ".zip");
        $zipfile->set_options(array('basedir' => $dir_path, 'prepand' => "", 'inmemory' => 0, 'overwrite'=> 1, 'recurse' => 1, 'storepaths' => 1));
        array_push($delete_file_array,  $dir_path  . $row['zipname'] . ".zip");
        _debug("Temp file: " . $dir_path  . $row['zipname'] . ".zip");
        /*
         * Copy the core files over from the parent folder
         */
        copy($dir_path . "data.xml",$dir_path . "template.xml");
        $xml = new XerteXMLInspector();
        $xml->loadTemplateXML($dir_path . 'template.xml');
        if ($fullArchive){
          _debug("Full archive");
          folder_loop($parent_template_path);
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
          folder_loop($parent_template_path . "common/");
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

        folder_loop($xerte_toolkits_site->root_file_path . 'languages/', false, '.xml');
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
            folder_loop($scorm_path);
            copy_scorm_files();
        }else if ($scorm=="2004") {
            folder_loop($scorm2004_path);
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
            folder_loop($xerte_toolkits_site->root_file_path . "JMolViewer/");
            copy_extra_files();
        }
        /*
         * mapstraction
         */
        if ($xml->modelUsed("mapstraction"))
        {
            folder_loop($xerte_toolkits_site->root_file_path . "mapstraction/");
            copy_extra_files();
        }
        /*
         * mediaViewer
         */
        if ($xml->mediaIsUsed())
        {
           folder_loop($xerte_toolkits_site->root_file_path . "mediaViewer/");
           copy_extra_files();
        }

        folder_loop($dir_path);

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
        xerte_zip_files($fullArchive);
        $zipfile->create_archive();
        $zipfile->download_file($row['zipname']);

        /*
         * remove the files
         */
        clean_up_files();
        unlink($dir_path . "template.xml");
    }
}