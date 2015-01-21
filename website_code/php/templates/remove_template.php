<?php
/**
 * 
 * remove_templates, allows the site to remove a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * 
 * @package
 */

require_once("../../../config.php");

include "../user_library.php";
include "../template_status.php";

$prefix = $xerte_toolkits_site->database_table_prefix;
_load_language_file("/website_code/php/templates/remove_template.inc");

if(empty($_SESSION['toolkits_logon_id'])) {
            die("Please login");
}

/* 
 * get the folder id to delete
 */

if(is_numeric($_POST['template_id'])){

    $safe_template_id = (int) $_POST['template_id'];

    if(!is_template_syndicated($safe_template_id)){

        if(is_user_creator($safe_template_id)){

            $query_for_folder_id = "select * from {$prefix}templaterights where template_id= ? ";
            $row = db_query_one($query_for_folder_id, array($safe_template_id));

            /*
             * delete from the database 
             */

            $query_to_delete_template = "delete from {$prefix}templaterights where template_id= ? ";
            $params = array($safe_template_id);

            if(db_query($query_to_delete_template, $params)){

                /*
                 * work out the file path before we start deletion
                 */

                $query_to_get_template_type_id = "select template_type_id from {$prefix}templatedetails where template_id = ?";
                $params = array($safe_template_id);

                $row_template_id = db_query_one($query_to_get_template_type_id, $params);
                
                
                $query_to_get_template_type_name = "select template_name, template_framework from "
                        . "{$prefix}originaltemplatesdetails where template_type_id = ? ";
                        
                $params = array($row_template_id['template_type_id']);

              

                $row_template_name = db_query_one($query_to_get_template_type_name, $params); 

                $path = $xerte_toolkits_site->users_file_area_full . $safe_template_id . "-" . $_SESSION['toolkits_logon_username'] . "-" . $row_template_name['template_name'];

                /*
                 * delete from the file system
                 */

                include $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . $row_template_name['template_framework']  . "/delete_template.php";

                delete_template($path . "/");

                $query_to_delete_template_attributes = "delete from {$prefix}templatedetails where template_id= ?";
                $params = array($safe_template_id);
                db_query($query_to_delete_template_attributes, $params);
                
                $query_to_delete_syndication = "delete from {$prefix}templatesyndication where template_id=?";
                $params = array($safe_template_id);
                db_query($query_to_delete_syndication, $params);

                $query_to_delete_xml_and_peer = "delete from {$prefix}additional_sharing where template_id=?"; 
                $params = array($safe_template_id);

                db_query($query_to_delete_xml_and_peer, $params);
                
            }else{


            }

        }else{

            echo REMOVE_TEMPLATE_NOT_CREATOR;

        }

    }else{

        echo REMOVE_TEMPLATE_SYNDICATED;

    }

}
