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
 * share this template, gives a new user rights to a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
require_once("../template_status.php");
include "../user_library.php";
_load_language_file("/website_code/php/properties/share_this_template.inc");


$prefix = $xerte_toolkits_site->database_table_prefix;
if(is_numeric($_POST['id'])&&is_numeric($_POST['template_id'])){

    if(is_user_creator_or_coauthor($_POST['template_id'])||is_user_permitted("projectadmin")) {
        $id = $_POST['id'];

        $tutorial_id = $_POST['template_id'];

        $database_id = database_connect("Share this template database connect success", "Share this template database connect success");

        $new_role = $_POST['role'];
        $group = $_POST['group'] == "true";
        /**
         * find the user you are sharing with's root folder to add this template to
         */
        if (!$group){
            $query_to_find_out_root_folder = "select folder_id from {$prefix}folderdetails where login_id = ? and folder_parent=? and folder_name!=?";

            $params = array($id, '0', 'recyclebin');

            $row_query_root = db_query_one($query_to_find_out_root_folder, $params);

            $query_to_insert_share = "INSERT INTO {$prefix}templaterights (template_id, user_id, role, folder) VALUES (?,?,?,?)";
            $params = array($tutorial_id, $id, $new_role, $row_query_root['folder_id']);
        }else{
            $query_to_insert_share = "INSERT INTO {$prefix}template_group_rights (template_id, group_id, role) VALUES (?,?,?)";
            $params = array($tutorial_id, $id, $new_role);
        }
        if (db_query($query_to_insert_share, $params) !== false){

            /**
             * sort ouf the html to return to the screen
             */
            if (!$group){
                $query_for_name = "select firstname, surname from {$prefix}logindetails WHERE login_id=?";
                $params = array($id);

                $row = db_query_one($query_for_name, $params);

                echo SHARING_THIS_FEEDBACK_SUCCESS . " " . $row['firstname'] . " " . $row['surname'] . "<br>";
            }else{
                $query_for_groupname = "select group_name from {$prefix}user_groups WHERE group_id=?";
                $params = array($id);
                $row = db_query_one($query_for_groupname, $params);
                echo SHARING_THIS_FEEDBACK_SUCCESS . " " . $row['group_name'] . "<br>";
            }

        } else {

            echo SHARING_THIS_FEEDBACK_FAIL . " <br>";

        }
    }
}