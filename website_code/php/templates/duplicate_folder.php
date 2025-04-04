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
require_once("../user_library.php");
require_once("../folder_library.php");
require_once("../folder_status.php");
require_once("../template_library.php");
require_once("../template_status.php");

require $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/duplicate_template.php";
require $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "site/duplicate_template.php";
require $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "decision/duplicate_template.php";

_load_language_file("/website_code/php/templates/duplicate_folder.inc");

if(empty($_SESSION['toolkits_logon_id'])) {
    die("Please login");
}

/*
 * get the root folder for this user
 */

$folder_id = x_clean_input($_POST['folder_id'], 'numeric');
$parentfolder_id = x_clean_input($_POST['parentfolder_id']);
$parentnode_type = x_clean_input($_POST['parentnode_type']);
$src_folder_name = x_clean_input($_POST['folder_name']);
if(is_user_creator_or_coauthor_folder($folder_id)) {

    if ($parentfolder_id == "workspace") {

        $parentfolder_id = get_user_root_folder();

    } else {

        $parentfolder_id = x_clean_input($_POST['parentfolder_id'], 'numeric');
    }

    //check if user is creator of parentfolder, if not the new folder should be placed in their workspace directly
    if ($parentnode_type == 'group' || !is_user_creator_folder($parentfolder_id)) {
        $parentfolder_id = get_user_root_folder();
    }

    $folder_name = COPY_OF . $src_folder_name;
    $messages = copy_folder($folder_id, $parentfolder_id, $folder_name, $src_folder_name);
    echo $messages;
}
else
{
    echo DUPLICATE_FOLDER_NOT_CREATOR;
}

function copy_folder($folder_id, $parentfolder_id, $folder_name, $org_folder_name){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $messages = "";
    // Check all templates within the folder
    // Get all templates within chosen folder
    $sql = "select td.*, tr.user_id, tr.folder, tr.role, otd.template_framework, otd.template_name as org_template_name from {$prefix}templaterights tr, {$prefix}templatedetails td, {$prefix}originaltemplatesdetails otd where td.template_id=tr.template_id and td.template_type_id=otd.template_type_id and tr.folder=?";
    $params = array($folder_id);

    $templates = db_query($sql, $params);
    if ($templates !== false) {
        /*
        foreach ($templates as $template) {
            if ($template['role'] != 'creator' && $template['role'] != 'co-author') {
                echo DUPLICATE_TEMPLATE_NOT_CREATOR;
                exit(-1);
            }
        }
        */

        // Create duplicate of folder
        $query = "INSERT INTO {$prefix}folderdetails (login_id,folder_parent,folder_name,date_created) values  (?,?,?,?)";
        $params = array($_SESSION['toolkits_logon_id'], $parentfolder_id, $folder_name, date('Y-m-d H:i:s'));

        $new_folder_id = db_query($query, $params);

        //Create folderrights for duplicate of folder
        $rights_query = "INSERT INTO {$prefix}folderrights (folder_id, login_id, folder_parent, role) values (?,?,?,?)";
        $params = array($new_folder_id, $_SESSION['toolkits_logon_id'], $parentfolder_id, 'creator');
        db_query($rights_query, $params);

        // Create copies (with same name in new folder)
        foreach ($templates as $template) {
            if ($template['role'] != 'creator' && $template['role'] != 'co-author') {
                $message = NO_PERMISSION_TO_DUPLICATE_TEMPLATE_OF_FOLDER . "\n";
                $message = str_replace("{0}", str_replace("_", " ", $template['template_name']), $message);
                $message = str_replace("{1}", $org_folder_name, $message);
                $messages .= $message;

                continue;
            }
            /*
            * create the new template record in the database
            */

            $query_for_new_template = "INSERT INTO {$prefix}templatedetails "
                . "(creator_id, template_type_id, date_created, date_modified, access_to_whom, template_name, extra_flags)"
                . " VALUES (?,?,?,?,?,?,?)";
            $params = array(
                $_SESSION['toolkits_logon_id'],
                $template['template_type_id'],
                date('Y-m-d H:i:s'),
                date('Y-m-d H:i:s'),
                $template['access_to_whom'],
                $template['template_name'],
                $template['extra_flags']);

            $new_template_id = db_query($query_for_new_template, $params);
            if ($new_template_id !== FALSE) {

                $query_for_template_rights = "INSERT INTO {$prefix}templaterights (template_id,user_id,role, folder) VALUES (?,?,?,?)";
                $params = array($new_template_id, $_SESSION['toolkits_logon_id'], "creator", $new_folder_id);

                if (db_query($query_for_template_rights, $params) !== FALSE) {

                    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Created new template record for the database", $query_for_new_template . " " . $query_for_template_rights);

                    duplicate_template($template['template_framework'], $new_template_id, $template['template_id'], $template['org_template_name']);

                } else {
                    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_template_rights);

                    echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);
                }
            } else {
                receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_new_template);

                echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);
            }
        }

        //Get all folders in this folder:
        $sql = "SELECT folder_id, folder_name FROM {$prefix}folderrights where folder_parent = ? ORDER BY folder_id ASC";

        $folders = db_query($sql, array($folder_id));

        foreach ($folders as $folder){
            $messages .= copy_folder($folder['folder_id'], $new_folder_id, $folder['folder_name'], $folder['folder_name']);
        }

    }
    return $messages;
}

function duplicate_template($template_framework, $new_template_id, $org_template_id, $original_template_name){
    switch($template_framework){
        case 'xerte':
            duplicate_template_xerte($new_template_id, $org_template_id, $original_template_name);
            break;
        case 'site':
            duplicate_template_site($new_template_id, $org_template_id, $original_template_name);
            break;
        case 'decision':
            duplicate_template_decision($new_template_id, $org_template_id, $original_template_name);
            break;
        default:
            break;
    }
}