<?php
/**
 * 
 * share this template, gives a new user rights to a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/share_this_template.inc");


$prefix = $xerte_toolkits_site->database_table_prefix;
if(is_numeric($_POST['user_id'])&&is_numeric($_POST['template_id'])){

    $user_id = $_POST['user_id'];

    $tutorial_id = $_POST['template_id'];

    $database_id=database_connect("Share this template database connect success","Share this template database connect success");

    /**
     * find the user you are sharing with's root folder to add this template to
     */

    $query_to_find_out_root_folder = "select folder_id from {$prefix}folderdetails where login_id = ? and folder_parent=? and folder_name!=?";

    $params = array($user_id, '0', 'recyclebin');
    
    $row_query_root = db_query_one($query_to_find_out_root_folder, $params); 

    $query_to_insert_share = "INSERT INTO {$prefix}templaterights (template_id, user_id, role, folder) VALUES (?,?,?,?)";
    $params = array($tutorial_id, $user_id,"editor", $row_query_root['folder_id']);

    if(db_query($query_to_insert_share, $params)){

        /**
         * sort ouf the html to return to the screen
         */

        $query_for_name = "select firstname, surname from {$prefix}logindetails WHERE login_id=?";
        $params = array($user_id);

        $row = db_query_one($query_for_name, $params); 

        echo SHARING_THIS_FEEDBACK_SUCCESS  . " " . $row['firstname'] . " " . $row['surname'] . "<br>";

    }else{

        echo SHARING_THIS_FEEDBACK_FAIL . " <br>";			

    }
}