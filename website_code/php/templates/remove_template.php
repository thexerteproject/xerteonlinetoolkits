<?php
/**
 * 
 * remove_templates, allows the site to remove a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
include "../user_library.php";
include "../template_status.php";

$database_id = database_connect("delete template database connect success","delete template database connect failed");

/* 
 * get the folder id to delete
 */

if(!is_template_syndicated($template_id)){

    $safe_template_id = mysql_real_escape_string($_POST['template_id']);

    if(is_user_creator($safe_template_id)){

        $query_for_folder_id = "select * from " .$xerte_toolkits_site->database_table_prefix . "templaterights where template_id=\"" . $safe_template_id . "\"";

        $query_for_folder_id_response = mysql_query($query_for_folder_id);

        $row = mysql_fetch_array($query_for_folder_id_response);

        /*
         * delete from the database 
         */

        $query_to_delete_template = "delete from " .$xerte_toolkits_site->database_table_prefix . "templaterights where template_id=\"" . $safe_template_id . "\"";

        if(mysql_query($query_to_delete_template)){

            /*
             * work out the file path before we start deletion
             */

            $query_to_get_template_type_id = " select template_type_id from " .$xerte_toolkits_site->database_table_prefix . "templatedetails where template_id = \"" . $safe_template_id . "\"";

            $query_to_get_template_type_id_response = mysql_query($query_to_get_template_type_id);

            $row_template_id = mysql_fetch_array($query_to_get_template_type_id_response);

            $query_to_get_template_type_name = "select template_name, template_framework from " .$xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where template_type_id =\"" . $row_template_id['template_type_id'] . "\"";

            $query_to_get_template_type_name_response = mysql_query($query_to_get_template_type_name);

            $row_template_name = mysql_fetch_array($query_to_get_template_type_name_response);

            $path = $xerte_toolkits_site->users_file_area_full . $safe_template_id . "-" . $_SESSION['toolkits_logon_username'] . "-" . $row_template_name['template_name'];

            /*
             * delete from the file system
             */

            include $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . $row_template_name['template_framework']  . "/delete_template.php";

            delete_template($path . "/");

            $query_to_delete_template_attributes = "delete from " .$xerte_toolkits_site->database_table_prefix . "templatedetails where template_id=\"" . $safe_template_id . "\"";

            mysql_query($query_to_delete_template_attributes);

            $query_to_delete_syndication = "delete from " .$xerte_toolkits_site->database_table_prefix . "templatesyndication where template_id=\"" . $safe_template_id . "\"";

            mysql_query($query_to_delete_syndication);

            $query_to_delete_xml_and_peer = "delete from " .$xerte_toolkits_site->database_table_prefix . "additional_sharing where template_id=\"" . $safe_template_id . "\"";

            mysql_query($query_to_delete_xml_and_peer);

        }else{


        }

    }else{

        echo "Sorry you aren't the creator of this file and as such cannot delete it";

    }

}else{

    echo "Sorry, this file is syndicated and syndicated files cannot be deleted";

}

mysql_close($database_id);

?>
