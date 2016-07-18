<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/**
 * 
 * duplicate_template, allows the template to be duplicated
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
include "../user_library.php";
include "../template_library.php";
include "../template_status.php";

_load_language_file("/website_code/php/templates/duplicate_template.inc");

if(empty($_SESSION['toolkits_logon_id'])) {
            die("Please login");
}

/*
 * get the root folder for this user
 */

$prefix = $xerte_toolkits_site->database_table_prefix;

if(is_numeric($_POST['template_id'])){

    if(is_user_creator($_POST['template_id'])){

        if($_POST['folder_id']=="workspace"){

            $folder_id = get_user_root_folder();

        }else{

            $folder_id = $_POST['folder_id'];

        }

        /*
         * get the maximum id number from templates, as the id for this template
         */

        $query_for_template_type_id = "select otd.template_type_id, otd.template_name, otd.template_framework, td.extra_flags FROM "
                 . "{$prefix}originaltemplatesdetails otd, {$prefix}templatedetails td where "
                 . "otd.template_type_id = td.template_type_id  AND "
                 . "td.template_id = ? ";
        
        $params = array($_POST['template_id']);

        $row_template_type = db_query_one($query_for_template_type_id, $params); 

        /*
         * create the new template record in the database
         */

        $query_for_new_template = "INSERT INTO {$prefix}templatedetails "
        . "(creator_id, template_type_id, date_created, date_modified, access_to_whom, template_name, extra_flags)"
                . " VALUES (?,?,?,?,?,?,?)";
        $params = array(
                $_SESSION['toolkits_logon_id'],
            $row_template_type['template_type_id'],
            date('Y-m-d'), 
            date('Y-m-d'),
            "Private",
            "Copy of " . $_POST['template_name'], 
            $row_template_type['extra_flags']);

        $new_template_id = db_query($query_for_new_template, $params);
        if($new_template_id !== FALSE){
        
            $query_for_template_rights = "INSERT INTO {$prefix}templaterights (template_id,user_id,role, folder) VALUES (?,?,?,?)";
            $params = array($new_template_id, $_SESSION['toolkits_logon_id'] , "creator" , $folder_id);

            if(db_query($query_for_template_rights, $params) !== FALSE){		

                receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Created new template record for the database", $query_for_new_template . " " . $query_for_template_rights);

                include $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . $row_template_type['template_framework']  . "/duplicate_template.php";

                duplicate_template(($maximum_template_id+1),$_POST['template_id'],$row_template_type['template_name']);

            }else{

                receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_template_rights);

                echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);

            }

        }else{

            receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_new_template);

            echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);

        }

    }else{

        echo DUPLICATE_TEMPLATE_NOT_CREATOR;

    }

}
