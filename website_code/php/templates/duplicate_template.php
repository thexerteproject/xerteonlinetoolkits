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

require $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/duplicate_template.php";
require $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "site/duplicate_template.php";
require $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "decision/duplicate_template.php";

_load_language_file("/website_code/php/templates/duplicate_template.inc");

if(empty($_SESSION['toolkits_logon_id'])) {
            die("Please login");
}

/*
 * get the root folder for this user
 */

$prefix = $xerte_toolkits_site->database_table_prefix;

if (!isset($_POST['template_id'])) {
    die("No template id");
}

if (!isset($_POST['folder_id'])) {
    die("No folder id");
}

if (!isset($_POST['template_name'])) {
    die("No template name");
}

$template_id = x_clean_input($_POST['template_id'], 'numeric');
$folder_id = x_clean_input($_POST['folder_id']);
$template_name = x_clean_input($_POST['template_name']);

if (!preg_match('/^[a-zA-Z0-9_ ]+$/',$template_name))
{
    die("Invalid template name");
}
if(is_user_creator_or_coauthor($template_id)){

    if($folder_id=="workspace"){

        $folder_id = get_user_root_folder();

    }else{
        // Redo cleanup, but now we know it has to be numeric
        $folder_id = x_clean_input($_POST['folder_id'], 'numeric');

    }

    /*
     * get the maximum id number from templates, as the id for this template
     */

    $query_for_template_type_id = "select otd.template_type_id, otd.template_name, otd.template_framework, td.extra_flags FROM "
             . "{$prefix}originaltemplatesdetails otd, {$prefix}templatedetails td where "
             . "otd.template_type_id = td.template_type_id  AND "
             . "td.template_id = ? ";

    $params = array($template_id);

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
        date('Y-m-d H:i:s'),
        date('Y-m-d H:i:s'),
        "Private",
        COPY_OF . htmlspecialchars($template_name),
        $row_template_type['extra_flags']);

    $new_template_id = db_query($query_for_new_template, $params);
    if($new_template_id !== FALSE){

        $query_for_template_rights = "INSERT INTO {$prefix}templaterights (template_id,user_id,role, folder) VALUES (?,?,?,?)";
        $params = array($new_template_id, $_SESSION['toolkits_logon_id'] , "creator" , $folder_id);

        if(db_query($query_for_template_rights, $params) !== FALSE){

            receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Created new template record for the database", $query_for_new_template . " " . $query_for_template_rights);

            duplicate_template($row_template_type['template_framework'], $new_template_id,$template_id,$row_template_type['template_name']);

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