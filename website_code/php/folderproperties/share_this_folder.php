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
 * modified for use on folders by Noud Liefrink
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/folderproperties/share_this_folder_template.inc");


$prefix = $xerte_toolkits_site->database_table_prefix;

if(is_numeric($_POST['id'])&&is_numeric($_POST['folder_id'])){

    $id = $_POST['id'];

    $folder_id = $_POST['folder_id'];

    $new_role = $_POST['role'];

    $groupbool = $_POST['group'] == "true";


    $database_id=database_connect("Share this folder database connect success","Share this folder database connect success");

//
//    /**
//     * find all templates within this folder
//     */
//
//    $current_folder = ['folder_id'=> $folder_id];
//    $all_folders = array($current_folder);
//    $max = 1;
//    $all_content = array();
//    //collect all content and folders from , "recursively"
//    //This is just a simple breadth first search:
//    for($i = 0; $i < $max; $i++){
//        $current_folder = $all_folders[$i];
//
//        //add all content from current folder
//        $query_to_find_folder_content = "select template_id from {$prefix}templaterights where folder = ?";
//        $folder_content = db_query($query_to_find_folder_content, array($current_folder['folder_id']));
//
//        $all_content = array_merge($all_content, $folder_content);
//
//        // find child folders
//        $query_to_find_child_folders = "select folder_id from {$prefix}folderdetails where folder_parent = ?";
//
//        $child_folders = db_query($query_to_find_child_folders, array($current_folder['folder_id']));
//        $all_folders = array_merge($all_folders, $child_folders);
//        $max += count($child_folders);
//    }
//
//
//    $failed = False;
//    if (!$groupbool) {
//        /**
//         * find the user you are sharing with's root folder to add these templates to
//         */
//        $query_to_find_out_root_folder = "select folder_id from {$prefix}folderdetails where login_id = ? and folder_parent=? and folder_name!=?";
//        $params = array($id, '0', 'recyclebin');
//
//        $row_query_root = db_query_one($query_to_find_out_root_folder, $params);
//    }else {
//        // find the group you're sharing this folder with (sanity check):
//        $group_query = "SELECT * FROM user_groups WHERE group_id = ?";
//        $group = db_query_one($group_query, array($id));
//        if (!$group) {
//            echo '<p>' . SHARING_THIS_FEEDBACK_FAIL . "</p>";
//            $failed = true;
//        }
//    }
//
//    if (!$failed){
//        // for each template id found before, insert or update a db entry for the id with the right role
//        foreach($all_content as $template_id) {
//
//            //Check to see if this template isn't already shared with this user:
//            $query_to_check_role = "";
//            if(!$groupbool)
//                $query_to_check_role = "SELECT role FROM {$prefix}templaterights WHERE template_id=? and user_id=?";
//            else
//                $query_to_check_role = "SELECT role FROM {$prefix}template_group_rights WHERE template_id=? and group_id=?";
//            $params = array($template_id['template_id'], $id);
//            $current_role = db_query_one($query_to_check_role, $params);
//
//            if (is_null($current_role)) { // If there is no result in current role that means that this user/group doesn't have access to this template yet
//                $query_to_insert_share="";
//                $params = [];
//                if(!$groupbool){
//                    $query_to_insert_share = "INSERT INTO {$prefix}templaterights (template_id, user_id, role, folder) VALUES (?,?,?,?)";
//                    $params = array($template_id['template_id'], $id, $new_role, $row_query_root['folder_id']);
//                }
//                else{
//                    $query_to_insert_share = "INSERT INTO {$prefix}template_group_rights (template_id, group_id, role) VALUES (?,?,?)";
//                    $params = array($template_id['template_id'], $id, $new_role);
//                }
//
//                $queryresult = db_query($query_to_insert_share, $params);
//                if ($queryresult === false) { //check with === because an insert function will return a '0' even if the query was successful
//                    $failed = true;
//                    echo '<p>' . SHARING_THIS_FEEDBACK_FAIL . "</p>";
//                    break;
//                }
//
//            } else if ($current_role['role'] != $new_role) { // if the result of current role is not the same role we only need to update this db entry
//                $query_to_update_role = "";
//                if(!$groupbool)
//                    $query_to_update_role = "UPDATE {$prefix}templaterights SET role = ? WHERE template_id=? and user_id=?";
//                else
//                    $query_to_update_role = "UPDATE {$prefix}template_group_rights SET role = ? WHERE template_id=? and group_id=?";
//                $params = array($new_role, $template_id['template_id'], $id);
//
//                $queryresult = db_query($query_to_update_role, $params);
//                if ($queryresult === false) {
//                    $failed = true;
//                    echo '<p>' . SHARING_THIS_FEEDBACK_FAIL . "</p>";
//                    break;
//                }
//            } // if the same role is chosen/some garbage role is somehow selected, nothing should happen to the database for this iteration.
//        }
//    }

    $result = false;
    if (!$groupbool){
        //See if folder is already shared with this user, update or insert:
        $query = "SELECT * from {$prefix}folderrights where folder_id=? and user_id=?";
        $params = array($folder_id, $id);

        if (db_query_one($query, $params)){
            $query = "UPDATE {$prefix}folderrights SET role = ? WHERE folder_id=? and user_id=?";
        }else{
            $query = "INSERT INTO {$prefix}folderrights (role, folder_id, user_id) VALUES (?,?,?)";
        }

        $params = array($new_role, $folder_id, $id);
        $result = db_query($query, $params);
    }else{
        //See if folder is already shared with this group, update or insert:
        $query = "SELECT * from {$prefix}folder_group_rights where folder_id=? and group_id=?";
        $params = array($folder_id, $id);

        if (db_query_one($query, $params)){
            $query = "UPDATE {$prefix}folder_group_rights SET role = ? WHERE folder_id=? and group_id=?";
        }else{
            $query = "INSERT INTO {$prefix}folder_group_rights (role, folder_id, group_id) VALUES (?,?,?)";
        }

        $params = array($new_role, $folder_id, $id);
        $result = db_query($query, $params);
    }

    if ($result === false){
        echo '<p>' . SHARING_THIS_FEEDBACK_FAIL . "</p>";
    }else{
        $query_for_name = "";
        if(!$groupbool){
            $query_for_name = "select firstname, surname, username from {$prefix}logindetails WHERE login_id=?";
            $params = array($id);
            $row = db_query_one($query_for_name, $params);
            echo "<p>" . SHARING_THIS_FEEDBACK_SUCCESS .
                $row['firstname'] . " " . $row['surname'] . " (". $row['username'] . ").</p>";
        }else{
            $query_for_name = "select group_name from {$prefix}user_groups WHERE group_id=?";
            $params = array($id);
            $group = db_query_one($query_for_name, $params);
            echo "<p>" . SHARING_THIS_FEEDBACK_SUCCESS . $group['group_name'] . ".</p>";
        }
    }


}