<?php
require_once("../../../config.php");
/**
 * 
 * gift this template, allows the site to give a template copy, or an actual template to some one else
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

/**
 * 
 * Function copy loop
 * This function copies files from one folder to another (does not move - copies)
 * @param string $start_path - string to check against the database
 * @param string $final_path - string to check against the database
 * @version 1.0
 * @author Patrick Lockley
 */

function copy_loop($start_path, $final_path){

    global $xerte_toolkits_site;

    $d = opendir($start_path);

    while($f = readdir($d)){

        if(is_dir($start_path . $f)){

            if(($f!=".")&&($f!="..")){

                copy_loop($start_path . $f . "/", $final_path . $f . "/");

            }			

        }else{

            $data = file_get_contents($start_path . $f);

            $fh = fopen($final_path . $f, "w");

            fwrite($fh,$data);

            fclose($fh);

        }

    }	

    closedir($d);

}


include "../template_library.php";

/**
 * Check id is numeric
 */

if(is_numeric($_POST['tutorial_id'])){

    $tutorial_id = mysql_real_escape_string($_POST['tutorial_id']);

    $user_id = mysql_real_escape_string($_POST['user_id']);

    /**
     * Giving a copy, or giving it away
     */

    if($_POST['action']=="give"){

        /**
         * Giving it away
         */

        $database_id=database_connect("gift sharing database connect success","gift sharing database connect failed");

        $query_for_rename = "select * from " . $xerte_toolkits_site->database_table_prefix . "logindetails, " . $xerte_toolkits_site->database_table_prefix . "templatedetails, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_type_id = " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id and template_id =\"" . $tutorial_id  . "\" and login_id = creator_id";

        $query_rename_response = mysql_query($query_for_rename);

        $row_rename = mysql_fetch_array($query_rename_response);

        /**
         * Update the database
         */

        $query_to_gift = "update " . $xerte_toolkits_site->database_table_prefix . "templatedetails set creator_id = \"" . $user_id . "\" where template_id=\"" . $tutorial_id . "\"";

        mysql_query($query_to_gift);

        $query_for_root_folder = "select folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where login_id='" . $user_id . "' AND folder_name != 'recyclebin'";

        $query_response = mysql_query($query_for_root_folder);

        $row_folder = mysql_fetch_array($query_response);

        $query_to_gift = "update " . $xerte_toolkits_site->database_table_prefix . "templaterights set user_id = \"" . $user_id . "\", folder = \"" . $row_folder['folder_id'] . "\" where template_id=\"" . $tutorial_id . "\"";

        mysql_query($query_to_gift);

        $query_for_new_login = "select username from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id='" . $user_id . "'";

        $query_for_new_login_response = mysql_query($query_for_new_login);

        $row_new_login = mysql_fetch_array($query_for_new_login_response);

        $base_path = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short;

        /**
         * Rename the folder where the template is
         */

        rename($base_path . $tutorial_id . "-" . $row_rename['username'] . "-" . $row_rename['template_name'] . "/", $base_path . $tutorial_id . "-" . $row_new_login['username'] . "-" . $row_rename['template_name'] . "/");

        echo "<p>Sorry you no longer have rights to this template</p>";

    }else{

        /**
         * Giving away a duplicate
         */

        $database_id=database_connect("Template sharing rights database connect success","Template sharing rights database connect failed");

        $query_for_currentdetails = "select *," . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_name AS actual_name from " . $xerte_toolkits_site->database_table_prefix . "templatedetails, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where template_id=\"" . $tutorial_id  . "\" and " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_type_id";

        $query_currentdetails_response = mysql_query($query_for_currentdetails);

        $row_currentdetails = mysql_fetch_array($query_currentdetails_response);

        $new_template_id = get_maximum_template_number()+1;

        $query_for_currentdetails = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "templatedetails (template_id, creator_id, template_type_id,template_name,date_created,date_modified,date_accessed,number_of_uses,access_to_whom) VALUES (" . $new_template_id . "," . $user_id . ",\"" .  $row_currentdetails['template_type_id'] . "\",\"" . $row_currentdetails['actual_name'] . "\",\"" . date('Y-m-d') . "\",\"" . date('Y-m-d') . "\",\"" . date('Y-m-d') . "\",\"0\",\"private\")";

        mysql_query($query_for_currentdetails);

        $query_for_currentrights = "select * from " . $xerte_toolkits_site->database_table_prefix . "templaterights where template_id =\"" . $tutorial_id  . "\"";

        $query_currentrights_response = mysql_query($query_for_currentrights);

        $row_currentrights = mysql_fetch_array($query_currentrights_response);

        $query_for_root_folder = "select folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where login_id='" . $user_id . "' AND folder_name != 'recyclebin'";

        $query_response = mysql_query($query_for_root_folder);

        $row_folder = mysql_fetch_array($query_response);

        $query_for_currentdetails = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "templaterights (template_id, user_id, role,folder,notes) VALUES (" . $new_template_id . "," . $user_id . ",\"creator\",\"" . $row_folder['folder_id'] . "\",\" \")";

        mysql_query($query_for_currentdetails);

        $query_for_new_login = "select firstname, surname, username from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id='" . $user_id . "'";

        $query_for_new_login_response = mysql_query($query_for_new_login);

        $row_new_login = mysql_fetch_array($query_for_new_login_response);

        $new_directory = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $new_template_id . "-" . $row_new_login['username'] . "-" . $row_currentdetails['template_name'] . "/";

        mkdir($new_directory);

        chmod($new_directory,0777);

        mkdir($new_directory . "media/");

        chmod($new_directory . "media/" ,0777);

        $current_directory = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $tutorial_id . "-" . $_SESSION['toolkits_logon_username'] . "-" . $row_currentdetails['template_name'] . "/";

        copy_loop($current_directory, $new_directory);

        echo "<div class=\"share_top\"><p class=\"header\"><span>Template successfully gifted to " . $row_new_login['firstname'] . " " . $row_new_login['surname'] . ".<br><br>To give this project to someone, please type their name here</span></p><form id=\"share_form\"><input name=\"searcharea\" onkeyup=\"javascript:name_select_gift_template()\" type=\"text\" size=\"20\" /></form><div id=\"area2\"><p>Names will appear here</p></div><p id=\"area3\"></div>";	

    }

}

?>
