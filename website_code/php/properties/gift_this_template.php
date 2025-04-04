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

require_once("../../../config.php");
require_once("../user_library.php");
require_once( "../template_library.php");
require_once("../template_status.php");
/**
 * 
 * gift this template, allows the site to give a template copy, or an actual template to some one else
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/duplicate_template.php";
require $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "site/duplicate_template.php";
require $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "decision/duplicate_template.php";

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

    if (!file_exists($final_path)) {
        mkdir($final_path, 0777, true);
    }

    $d = opendir($start_path);

    while($f = readdir($d)){

        if(is_dir($start_path . $f)){

            if(($f!=".")&&($f!="..")){

                copy_loop($start_path . $f . "/", $final_path . $f . "/");

            }			

        }else{
            $ok = copy($start_path . $f, $final_path . $f);
            /*
            $data = file_get_contents($start_path . $f);

            $fh = fopen($final_path . $f, "w");

            fwrite($fh,$data);

            fclose($fh);
            */
        }

    }	

    closedir($d);

}

_load_language_file("/website_code/php/properties/gift_this_template.inc");



if (!isset($_SESSION['toolkits_logon_id']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

/**
 * Check id is numeric
 */

$tutorial_id = x_clean_input($_POST['tutorial_id'], "numeric");
$action = x_clean_input($_POST['action'], "string");
if(is_user_creator_or_coauthor($tutorial_id)||is_user_permitted("projectadmin")) {

    $user_id = x_clean_input($_POST['user_id'], "numeric");

    /**
     * Giving a copy, or giving it away
     */

    if ($action == "give") {

        /**
         * Giving it away
         */

        $database_id = database_connect("gift sharing database connect success", "gift sharing database connect failed");

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

        $root_folder = get_user_root_folder_id_by_id($user_id);

        $query_to_gift = "update {$prefix}templaterights set user_id =  ?, folder = ? WHERE template_id = ?";
        $params = array($user_id, $root_folder, $tutorial_id);

        db_query($query_to_gift, $params);


        $query_for_new_login = "select username from {$prefix}logindetails where login_id= ? ";

        $row_new_login = db_query_one($query_for_new_login, array($user_id));


        $base_path = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short;

        /**
         * Rename the folder where the template is
         */

        rename($base_path . $tutorial_id . "-" . $row_rename['username'] . "-" . $row_rename['template_name'] . "/", $base_path . $tutorial_id . "-" . $row_new_login['username'] . "-" . $row_rename['template_name'] . "/");

        echo "<p class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . GIFT_RESPONSE_FAIL . "</p>";

    } else {

        /**
         * Giving away a duplicate
         */
        $prefix = $xerte_toolkits_site->database_table_prefix;

        $database_id = database_connect("Template sharing rights database connect success", "Template sharing rights database connect failed");

        $query_for_currentdetails = "select *, td.template_name AS actual_name, ld.firstname, ld.surname FROM "
            . "{$prefix}templatedetails td, {$prefix}originaltemplatesdetails otd, {$prefix}logindetails ld where "
            . "td.template_id= ? AND otd.template_type_id = td.template_type_id and td.creator_id = ld.login_id";

        $params = array($tutorial_id);

        $row_currentdetails = db_query_one($query_for_currentdetails, $params);

        // Add original template_id and original username to template_name
        $new_name = $row_currentdetails['actual_name'] . "_" . $tutorial_id . "_" . $row_currentdetails['firstname'] . "_" . $row_currentdetails['surname'];

        $creation_query = "INSERT INTO {$prefix}templatedetails "
            . "(creator_id, template_type_id,template_name,date_created,date_modified,date_accessed,number_of_uses,access_to_whom,extra_flags) "
            . " VALUES (?,?,?,?,?,?,?,?,?)";
        $params = array($user_id, $row_currentdetails['template_type_id'], $new_name, date('Y-m-d'), date('Y-m-d'), date('Y-m-d'), 0, "Private", $row_currentdetails['extra_flags']);

        $new_template_id = db_query($creation_query, $params);

        $query_for_currentrights = "select * from {$prefix}templaterights where template_id = ?";
        $params = array($tutorial_id);

        $row_currentrights = db_query_one($query_for_currentdetails, $params);

        $root_folder = get_user_root_folder_id_by_id($user_id);

        $create_rights_query = "INSERT INTO {$prefix}templaterights (template_id, user_id, role,folder,notes) VALUES (?,?,?,?,?)";
        $params = array($new_template_id, $user_id, "creator", $root_folder, '');

        db_query($create_rights_query, $params);

        $query_for_new_login = "select firstname, surname, username from {$prefix}logindetails where login_id= ?";
        $params = array($user_id);


        $row_new_login = db_query_one($query_for_new_login, $params);

        duplicate_template($row_currentdetails['template_framework'], $new_template_id, $tutorial_id, $row_currentdetails['template_name']);

        echo "<p class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . GIFT_RESPONSE_SUCCESS . " " . $row_new_login['firstname'] . " " . $row_new_login['surname'] . "  (" . $row_new_login['username'] . ")</p>";

    }
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
