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

_load_language_file("/website_code/php/templates/duplicate_folder.inc");

if(empty($_SESSION['toolkits_logon_id'])) {
            die("Please login");
}

/*
 * get the root folder for this user
 */

$prefix = $xerte_toolkits_site->database_table_prefix;

if(is_numeric($_POST['folder_id'])){

    $folder_id = $_POST['folder_id'];

    if($_POST['parentfolder_id']=="workspace"){

        $parentfolder_id = get_user_root_folder();

    }else{

        $parentfolder_id = $_POST['parentfolder_id'];

    }

    /*
     * get the maximum id number from templates, as the id for this template
     */

    // Check all templates within the folder
    // Get all templates within chosen folder
    $sql = "select td.*, tr.user_id, tr.folder, tr.role, otd.template_framework, otd.template_name as org_template_name from {$prefix}templaterights tr, {$prefix}templatedetails td, {$prefix}originaltemplatesdetails otd where td.template_id=tr.template_id and td.template_type_id=otd.template_type_id and tr.user_id=? and tr.folder=?";
    $params = array($_SESSION['toolkits_logon_id'], $folder_id);

    $templates = db_query($sql, $params);
    if ($templates !== false)
    {
        foreach ($templates as $template)
        {
            if ($template['role'] != 'creator' && $template['role'] != 'co-author')
            {
                echo DUPLICATE_TEMPLATE_NOT_CREATOR;
                exit(-1);
            }
        }
        // Create duplicate of folder
        $folder_name = "Copy of " . $_POST['folder_name'];
        $query = "INSERT INTO {$prefix}folderdetails (login_id,folder_parent,folder_name,date_created) values  (?,?,?,?)";
        $params = array($_SESSION['toolkits_logon_id'], $parentfolder_id, $folder_name, date('Y-m-d'));

        $new_folder_id = db_query($query, $params);

        // Create copies (with same name in new folder)
        foreach ($templates as $template)
        {
            /*
            * create the new template record in the database
            */

            $query_for_new_template = "INSERT INTO {$prefix}templatedetails "
                . "(creator_id, template_type_id, date_created, date_modified, access_to_whom, template_name, extra_flags)"
                . " VALUES (?,?,?,?,?,?,?)";
            $params = array(
                $_SESSION['toolkits_logon_id'],
                $template['template_type_id'],
                date('Y-m-d'),
                date('Y-m-d'),
                $template['access_to_whom'],
                $template['template_name'],
                $template['extra_flags']);

            $new_template_id = db_query($query_for_new_template, $params);
            if($new_template_id !== FALSE) {

                $query_for_template_rights = "INSERT INTO {$prefix}templaterights (template_id,user_id,role, folder) VALUES (?,?,?,?)";
                $params = array($new_template_id, $_SESSION['toolkits_logon_id'], "creator", $new_folder_id);

                if (db_query($query_for_template_rights, $params) !== FALSE) {

                    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Created new template record for the database", $query_for_new_template . " " . $query_for_template_rights);

                    require_once $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . $template['template_framework'] . "/duplicate_template.php";

                    duplicate_template($new_template_id, $template['template_id'], $template['org_template_name']);
                }
                else{
                    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_template_rights);

                    echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);
                }
            }
            else{
                receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_new_template);

                echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);
            }
        }
    }
}
