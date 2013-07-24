<?php
/**
 *
 * Save page, used by xerte to update its XML files
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
require_once("../../../plugins.php");

if(!isset($_SESSION['toolkits_logon_username'])) {
  print "You are not logged in.";
  exit();
}

$savepath = str_replace("preview.xml","data.xml",$_POST['filename']);

/**
 * The XML length is not equal to the expected file length so don't save
 */

if(strlen($_POST['filedata'])!=strlen($_POST['filesize'])){

    echo "file has been corrupted<BR>";
    //die();

}

$unescaped_data = $_POST['filedata'];
if (function_exists(get_magic_quotes_gpc) && get_magic_quotes_gpc())
{
    $unescaped_data = stripslashes($_POST['filedata']);
}

/**
 * Remove Ascii Chr(1) as it seems to break the XML later on...
 */
if (strpos($unescaped_data, chr(1))>0) {
	$unescaped_data = str_replace(chr(1), '', $unescaped_data);
}

$filedata = apply_filters("editor_save_data", $unescaped_data);

/**
 * Save and play do slightly different things. Save sends an extra variable so we update data.xml as well as preview.xml
 */

if($_POST['fileupdate']=="true"){

    $file_handle = fopen($xerte_toolkits_site->root_file_path . $savepath,'w');

    if(fwrite($file_handle, $filedata)!=false){

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Template " . $_POST['filename'] . " saved" , $filedata);

    }else{

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Template " . $_POST['filename'] . " failed to save" , $filedata);

    }

    fclose($file_handle);

}

/**
 * Update preview.xml
 */

$filedata = apply_filters("editor_save_preview", $unescaped_data);

$file_handle = fopen($xerte_toolkits_site->root_file_path . $_POST['filename'],'w');

if(fwrite($file_handle, $filedata)!=false){

    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Template " . $_POST['filename'] . " saved" , $filedata);

}else{

    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Template " . $_POST['filename'] . " failed to save" , $filedata);

}

fclose($file_handle);

