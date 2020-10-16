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
if(is_numeric($_POST['user_id'])&&is_numeric($_POST['folder_id'])){

    $user_id = $_POST['user_id'];

    $folder_id = $_POST['folder_id'];

    $new_role = $_POST['role'];

    $database_id=database_connect("Share this folder database connect success","Share this folder database connect success");

    /**
     * find the user you are sharing with's root folder to add these templates to
     */

    $query_to_find_out_root_folder = "select folder_id from {$prefix}folderdetails where login_id = ? and folder_parent=? and folder_name!=?";
    $params = array($user_id, '0', 'recyclebin');

    $row_query_root = db_query_one($query_to_find_out_root_folder, $params);


    /**
     * find all templates within this folder
     * TODO: recursive folders
     */

    $current_folder = ['folder_id'=> $folder_id];
    $all_folders = array($current_folder);
    $max = 1;
    $all_content = array();
    //collect all content and folders from , "recursively"
    //This is a breadth first search using dynamic programming:
    for($i = 0; $i < $max; $i++){
        $current_folder = $all_folders[$i];

        //add all content from current folder
        $query_to_find_folder_content = "select template_id from {$prefix}templaterights where folder = ?";
        $folder_content = db_query($query_to_find_folder_content, array($current_folder['folder_id']));

        $all_content = array_merge($all_content, $folder_content);

        // find child folders
        $query_to_find_child_folders = "select folder_id from {$prefix}folderdetails where folder_parent = ?";

        $child_folders = db_query($query_to_find_child_folders, array($current_folder['folder_id']));
        $all_folders = array_merge($all_folders, $child_folders);
        $max += count($child_folders);
    }


    $failed = False;
    // for each template id found before, insert or update a db entry for the user_id with the right role
    foreach($all_content as $template_id) {

        //Check to see if this template isn't already shared with this user:
        $query_to_check_role = "SELECT role FROM {$prefix}templaterights WHERE template_id=? and user_id=?";
        $params = array($template_id['template_id'], $user_id);
        $current_role = db_query_one($query_to_check_role, $params);

        if (is_null($current_role)) { // If there is no result in current role that means that this user doesn't have access to this template yet
            $query_to_insert_share = "INSERT INTO {$prefix}templaterights (template_id, user_id, role, folder) VALUES (?,?,?,?)";
            $params = array($template_id['template_id'], $user_id, $new_role, $row_query_root['folder_id']);

            $queryresult = db_query($query_to_insert_share, $params);
            if ($queryresult === false) { //check with === because an insert function will return a '0' even if the query was successful
                $failed = true;
                echo '<p>' . SHARING_THIS_FEEDBACK_FAIL . "</p>";
                break;
            }

        } else if ($current_role['role'] != $new_role) { // if the result of current role is not the same role we only need to update this db entry
            $query_to_update_role = "UPDATE {$prefix}templaterights SET role = ? WHERE template_id=? and user_id=?";
            $params = array($new_role, $template_id['template_id'], $user_id);

            $queryresult = db_query($query_to_update_role, $params);
            if ($queryresult === false) {
                $failed = true;
                echo '<p>' . SHARING_THIS_FEEDBACK_FAIL . "</p>";
                break;
            }
        } // if the same role is chosen/some garbage role is somehow selected, nothing should happen to the database for this iteration.
    }
    if (!$failed){
        $query_for_name = "select firstname, surname from {$prefix}logindetails WHERE login_id=?";
        $params = array($user_id);

        $row = db_query_one($query_for_name, $params);

        echo "<p>" . SHARING_THIS_FEEDBACK_SUCCESS  . " " . $row['firstname'] . " " . $row['surname'] . ".</p>";
    }


//        if(db_query($query_to_insert_share, $params)){
//
//            /**
//             * sort ouf the html to return to the screen
//             */
//
//            $query_for_name = "select firstname, surname from {$prefix}logindetails WHERE login_id=?";
//            $params = array($user_id);
//
//            $row = db_query_one($query_for_name, $params);
//
//            echo SHARING_THIS_FEEDBACK_SUCCESS  . " " . $row['firstname'] . " " . $row['surname'] . "<br>";
//
//        }else{
//
//            echo SHARING_THIS_FEEDBACK_FAIL . " <br>";
//
//        }

}