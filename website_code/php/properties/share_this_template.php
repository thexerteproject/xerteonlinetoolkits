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

if(is_numeric($_POST['user_id'])&&is_numeric($_POST['template_id'])){

    $user_id = mysql_real_escape_string($_POST['user_id']);

    $tutorial_id = mysql_real_escape_string($_POST['template_id']);

    $database_id=database_connect("Share this template database connect success","Share this template database connect success");

    /**
     * find the user you are sharing with's root folder to add this template to
     */

    $query_to_find_out_root_folder = "select folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where login_id =\"" . $user_id . "\" and folder_parent=\"0\" and folder_name!=\"recyclebin\"";

    $query_to_find_out_root_folder_response = mysql_query($query_to_find_out_root_folder);

    $row_query_root = mysql_fetch_array($query_to_find_out_root_folder_response);

    $query_to_insert_share = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "templaterights (template_id, user_id, role, folder) VALUES (" . $tutorial_id . "," . $user_id . ",\"editor\",". $row_query_root['folder_id'] . ")";

    if(mysql_query($query_to_insert_share)){

        /**
         * sort ouf the html to return to the screen
         */

        $query_for_name = "select firstname, surname from " . $xerte_toolkits_site->database_table_prefix . "logindetails WHERE login_id=\"" . $user_id . "\"";

        $query_name_response = mysql_query($query_for_name);

        $row = mysql_fetch_array($query_name_response);

        echo SHARING_THIS_FEEDBACK_SUCCESS  . " " . $row['firstname'] . " " . $row['surname'] . "<br>";

    }else{

        echo SHARING_THIS_FEEDBACK_FAIL . " <br>";			

    }

}

?>
