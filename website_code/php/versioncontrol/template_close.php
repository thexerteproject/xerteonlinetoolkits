<?php

/**
 * 
 * template close, code that runs when an editor window is closed to remove the lock file
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once('../../../config.php');

if(empty($_SESSION) || !isset($_SESSION['toolkits_logon_id'])) {
    die("Session expired; please login again.");
}

_load_language_file("/website_code/php/versioncontrol/template_close.inc");

require('../template_status.php');

$temp_array = explode("-",$_POST['file_path']);

database_connect("template close success","template close fail");

if(file_exists($xerte_toolkits_site->users_file_area_full . $_POST['file_path'] . "lockfile.txt")){

    /*
     *  Code to delete the lock file
     */

    $lock_file_data = file_get_contents($xerte_toolkits_site->users_file_area_full . $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2] . "/lockfile.txt");

    $temp = explode("*",$lock_file_data);

    $lock_file_creator = $temp[0];

    $template_id = explode("-",$_POST['file_path']);

    $row_template_name = db_query_one("Select template_name from {$xerte_toolkits_site->database_table_prefix}templatedetails WHERE template_id = ?", array($template_id[0]));


    $user_list = $temp[1];

    $users = explode(" ",$user_list);

    /*
     * Email users in the lock file
     */

    for($x=0;$x!=count($users)-1;$x++){

        mail($users[$x] . "@" . $xerte_toolkits_site->email_add_to_username, "File available - \"" . str_replace("_"," ",$row_template_name['template_name']) ."\"", "Hello, <br><br> You've requested to be informed when the file \"" . str_replace("_"," ",$row_template_name['template_name']) . "\" becomes available for editing. The file was made available at " . date("h:i a") . " on " . date("l, jS F") . " <br><br> Please note that multiple requests may have been made, and as such you may not be the only person to have receive one of these notifications. As such the file may well be locked by somebody else.<br><br> Please log into the site at <a href=\"" . $xerte_toolkits_site->site_url . "\">" . $xerte_toolkits_site->site_url . "</a>. <br><br> Thank you, <br><br> the Xerte Online toolkits team", get_email_headers());

    }

    unlink($xerte_toolkits_site->users_file_area_full . $_POST['file_path'] . "lockfile.txt");

}

/*
 * Code to check to see if we should warn on a publish
 */

if(is_user_an_editor($temp_array[0],$_SESSION['toolkits_logon_id'])){

    $prefix = $xerte_toolkits_site->users_file_area_full . $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2];
    $preview_file = $prefix . '/preview.xml';
    $data_file = $prefix . '/data.xml';

    if(file_exists($preview_file) && file_exists($data_file)) { 
        $preview_xml = file_get_contents($preview_file);
        $data_xml = file_get_contents($data_file);
        if($data_xml!=$preview_xml){
            echo TEMPLATE_CLOSE_QUESTION . "~*~" . $xerte_toolkits_site->users_file_area_full . $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2] . "~*~" . $temp_array[0];
        }
    }
}


?>
