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

$filedata = apply_filters("editor_save_data", $_POST['filedata']);

/**
 * Save and play do slightly different things. Save sends an extra variable so we update data.xml as well as preview.xml
 */

if($_POST['fileupdate']=="true"){

    $file_handle = fopen($xerte_toolkits_site->root_file_path . $savepath,'w');

    if(fwrite($file_handle, stripslashes($filedata))!=false){

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Template " . $_POST['filename'] . " saved" , stripslashes($filedata));

    }else{

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Template " . $_POST['filename'] . " failed to save" , stripslashes($filedata));

    }

    fclose($file_handle);

}

/**
 * Update preview.xml
 */

$filedata = apply_filters("editor_save_preview", $_POST['filedata']);

$file_handle = fopen($xerte_toolkits_site->root_file_path . $_POST['filename'],'w');

if(fwrite($file_handle, stripslashes($filedata))!=false){

    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Template " . $_POST['filename'] . " saved" , stripslashes($_POST['filedata']));

}else{

    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Template " . $_POST['filename'] . " failed to save" , stripslashes($_POST['filedata']));

}

fclose($file_handle);

/**
 * Update the data modified
 */

/** $_POST['template_id'] does not appear to be defined in the POST request, so this code serves no purpose.
    if(mysql_query("UPDATE " . $xerte_toolkits_site->database_table_prefix . "templatedetails SET date_modified=\"" . date('Y-m-d') . "\" WHERE template_id=\"" . $_POST['template_id'] . "\"")){
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Template updated for " . $_POST['template_id'] . " when databased changed" , mysql_error());
    }else{
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "MINOR", "Template failed to update for " . $_POST['template_id'] . " when databased changed" , mysql_error());
    }
*/

print("&returnvalue=$filename");

if($_SESSION['toolkits_logon_username']=="cczpl"){

    $savepath = str_replace("preview.xml","patsave.xml",$_POST['filename']);

    $file_handle = fopen($xerte_toolkits_site->root_file_path . $savepath,'w');

    if(fwrite($file_handle, stripslashes($_POST['filedata']))!=false){

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Template " . $_POST['template_id'] . " saved" , stripslashes($_POST['filedata']));

    }else{

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Template " . $_POST['template_id'] . " failed to save" , stripslashes($_POST['filedata']));

    }

    fclose($file_handle);

}
