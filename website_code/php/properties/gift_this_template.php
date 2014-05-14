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

_load_language_file("/website_code/php/properties/gift_this_template.inc");

include "../template_library.php";

/**
 * Check id is numeric
 */

if(is_numeric($_POST['tutorial_id'])){

    $tutorial_id = (int) $_POST['tutorial_id'];

    $user_id = (int) $_POST['user_id'];

    /**
     * Giving a copy, or giving it away
     */

    if($_POST['action']=="give"){

        /**
         * Giving it away
         */

        $database_id=database_connect("gift sharing database connect success","gift sharing database connect failed");

        $prefix = $xerte_toolkits_site->database_table_prefix;
        
        $query_for_rename = "select * from {$prefix}logindetails, {$prefix}templatedetails, {$prefix}originaltemplatesdetails "
        . "where {$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id and"
        . " template_id = ? and "
        . " login_id = creator_id";
 
        $row_rename = db_query_one($query_for_rename, array($tutorial_id));
 

        /**
         * Update the database
         */

        $query_to_gift = "update {$prefix}templatedetails set creator_id = ? WHERE template_id = ?";
        $params = array($user_id, $tutorial_id);

        $ok = db_query($query_to_gift, $params);
        
        $query_for_root_folder = "select folder_id from {prefix}folderdetails where login_id= ? and folder_name != ?";
        $params = array($user_id, 'recyclebin');

        $row_folder = db_query_one($query_for_root_folder, $params);
        
        
        $query_to_gift = "update {$prefix}templaterights set user_id =  ?, folder = ? WHERE template_id = ?";
        $params = array($user_id, $row_folder['folder_id'], $tutorial_id);
        
        db_query($query_to_gift, $params);

        
        $query_for_new_login = "select username from {$prefix}logindetails where login_id= ? ";
        
        $row_new_login = db_query_one($query_for_new_login, array($user_id));


        $base_path = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short;

        /**
         * Rename the folder where the template is
         */

        rename($base_path . $tutorial_id . "-" . $row_rename['username'] . "-" . $row_rename['template_name'] . "/", $base_path . $tutorial_id . "-" . $row_new_login['username'] . "-" . $row_rename['template_name'] . "/");

        echo "<p>" . GIFT_RESPONSE_FAIL . "</p>";

    }else{

        /**
         * Giving away a duplicate
         */
        $prefix = $xerte_toolkits_site->database_table_prefix;

        $database_id=database_connect("Template sharing rights database connect success","Template sharing rights database connect failed");

        $query_for_currentdetails = "select *,{$prefix}templatedetails.template_name AS actual_name FROM "
        . "{$prefix}templatedetails, {$prefix}originaltemplatesdetails where "
        . "template_id= ? AND {$prefix}originaltemplatesdetails.template_type_id = {$prefix}templatedetails.template_type_id";

        $params = array($tutorial_id);
        
        $row_currentdetails = db_query_one($query_for_currentdetails, $params); 

        $new_template_id = get_maximum_template_number()+1;

        $creation_query = "INSERT INTO {$prefix}templatedetails "
        . "(template_id, creator_id, template_type_id,template_name,date_created,date_modified,date_accessed,number_of_uses,access_to_whom) "
        . " VALUES (?,?,?,?,?,?,?,?,?)";
        $params = array($new_template_id, $user_id, $row_currentdetails['template_type_id'], $row_currentdetails['actual_name'], date('Y-m-d'), date('Y-m-d'), date('Y-m-d'),0,"private");

        $ok = db_query($creation_query, $params);
        
        $query_for_currentrights = "select * from {$prefix}templaterights where template_id = ?";
        $params = array($tutorial_id);

        $row_currentrights = db_query_one($query_for_currentdetails, $params);

        $query_for_root_folder = "select folder_id from {$prefix}folderdetails where login_id= ? AND folder_name != ? ";
        $params = array($user_id, 'recyclebin');

        $row_folder = db_fetch_one($query_for_root_folder, $params);
        
        $create_rights_query = "INSERT INTO {$prefix}templaterights (template_id, user_id, role,folder,notes) VALUES (?,?,?,?,?)";
        $params = array($new_template_id, $user_id, "creator", $row_folder['folder_id'], '');

        db_query($create_rights_query, $params);
        

        $query_for_new_login = "select firstname, surname, username from {$prefix}logindetails where login_id= ?";
        $params = array($user_id);

        
        $row_new_login = db_query_one($query_for_new_login, $params);

        $new_directory = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short .
                $new_template_id . "-" . $row_new_login['username'] . "-" . $row_currentdetails['template_name'] . "/";

        mkdir($new_directory);

        chmod($new_directory,0777);

        mkdir($new_directory . "media/");

        chmod($new_directory . "media/" ,0777);

        $current_directory = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $tutorial_id . "-" . $_SESSION['toolkits_logon_username'] . "-" . $row_currentdetails['template_name'] . "/";

        copy_loop($current_directory, $new_directory);

        echo "<div class=\"share_top\"><p class=\"header\"><span>" . GIFT_RESPONSE_INSTRUCTIONS . " " . $row_new_login['firstname'] . " " . $row_new_login['surname'] . ".<br><br></span></p><p>" . GIFT_RESPONSE_SUCCESS . "</p><form id=\"share_form\"><input name=\"searcharea\" onkeyup=\"javascript:name_select_gift_template()\" type=\"text\" size=\"20\" /></form><div id=\"area2\"><p>" . GIFT_RESPONSE_NAMES . "</p></div><p id=\"area3\"></div>";	

    }

}
