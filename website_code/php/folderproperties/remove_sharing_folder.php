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
 * remove sharing template, removes some one from the list of users sharing the site
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
require_once "../folder_status.php";
require_once "../folder_library.php";
require_once "../group_library.php";
require_once "../user_library.php";

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

$id = $_POST['id'];
$folder_id = $_POST['folder_id'];
$group = $_POST['group'];

if(is_numeric($_POST['folder_id'])){

    if(is_user_creator_or_coauthor_folder($_POST['folder_id'])||is_user_permitted("projectadmin")||$_POST['user_deleting_self']=="true"){
        $prefix = $xerte_toolkits_site->database_table_prefix;

        // Get creator of folder
        $creator = get_folder_creator($folder_id);

        //remove from folderrights or folder_group_rights
        if ($group=="false"){
            $query_to_delete_share = "delete from {$prefix}folderrights where folder_id = ? AND login_id = ?";
        }else{
            $query_to_delete_share = "delete from {$prefix}folder_group_rights where folder_id = ? and group_id = ?";
        }
        $params = array($folder_id, $id);
        db_query($query_to_delete_share, $params);


        // Check whether the user's templates need to be moved out of the folder
        // 1. Not needed if user is part of a group that still has access to the folder
        // Get shared groups
        $shared_groups = get_shared_groups_of_folder($folder_id, true);
        $shared_users = get_shared_users_of_folder($folder_id, true);
        if ($group !== "false")
        {
            // Remove the group from the list of shared groups
            $shared_groups = array_diff($shared_groups, array($id));
        }else{
            // Remove the user from the list of shared users
            $shared_users = array_diff($shared_users, array($id));
        }


        $users = array();
        foreach($shared_groups as $shared_group) {
            $users = array_merge($users, get_users_from_group($shared_group));
        }

        // Check if we want to remove group
        if ($group !== "false")
        {
            // Get users from group
            $removeusers = get_users_from_group($id);
        }
        else
        {
            // Add user to array
            $removeusers[] = $id;
        }

        // For all users in $removeusers, move the projects to the root of the respective workspace
        $query_to_change_folder = "";
        $changeParams = array();
        foreach($removeusers as $user_id) {
            if (in_array($user_id, $users, true) === false && in_array($user_id, $shared_users, true) === false) {
                // User is not in the list of shared users
                // User is not in a shared group

                // Place all items that are not shared anymore in the user's private folder
                // - 1. Templates owned by the user
                // - 2. Folders owned by the user
                // - 3. Templates owned by anyone else then the user and stored in folders from 2.
                //
                // Step 1. Templates owned by the user (that is being unshared)
                $workspaceId = get_user_root_folder_id_by_id($user_id);
                $foldersToCheck = get_all_subfolders_of_folder_for_user($folder_id, $creator);

                array_push($changeParams, $workspaceId);
                array_push($changeParams, $user_id);

                $query_to_change_folder .= "UPDATE {$prefix}templaterights SET folder = ? where user_id = ? and role = 'creator' and folder in (";
                $first = true;
                foreach ($foldersToCheck as $folder) {
                    if (!$first) {
                        $query_to_change_folder .= ", ";
                    }
                    $first = false;
                    $query_to_change_folder .= "?";
                    array_push($changeParams, $folder);
                }

                $query_to_change_folder .= ");";
            }
        }
        if ($query_to_change_folder !== "") {
            db_query($query_to_change_folder, $changeParams);
        }

        /*

        // Step 2. Folders owned by the user (that is being unshared)
        // Do not only update the folders, but get the ids of the folders as well, we will use those again in step 3.
        $getParams = array($id);
        $changeParams = array($workspaceId, $id);

        $query_to_get_folders = "SELECT folder_id FROM {$prefix}folderrights where login_id = ? and role='creator' and folder_parent in (";
        $query_to_change_folders = "UPDATE {$prefix}folderrights SET folder_parent = ? where login_id = ? and role='creator' and folder_parent in (";
        $first = true;
        foreach ($foldersToCheck as $folder){
            if(!$first){
                $query_to_get_folder .= ", ";
                $query_to_change_folder .= ", ";
            }
            $query_to_get_folder .= "?";
            $query_to_change_folder .= "?";
            array_push($getParams, $folder);
            array_push($changeParams, $folder);
        }
        $query_to_get_folders .= ")";
        $query_to_change_folders .= ")";
        $folders = db_query($query_to_get_folders, $getParams);
        db_query($query_to_change_folders, $changeParams);

        // Step 3. Templates owned by anyone else then the user and stored in folders from 2 need to be moved to the workspace of the owner
        $getParams = array($id);
        $query_to_get_templates = "SELECT template_id, user_id FROM {$prefix}templaterights where user_id != ? and role='creator' and folder in (";
        $first = true;
        foreach ($folders as $folder){
            if(!$first){
                $query_to_get_templates .= ", ";
            }
            $query_to_get_templates .= "?";
            array_push($getParams, $folder);
        }
        $query_to_get_templates .= ")";

        $templates = db_query($query_to_get_templates, $getParams);
        // Step 3b for each user, move templates to the root folder of that user
        $changeParams = array();
        $query_to_change_folder = "";
        foreach ($templates as $template)
        {
            $workspaceId = get_user_root_folder_by_id($template['user_id']);
            $query_to_change_folder .= "UPDATE {$prefix}templaterights SET folder = ? where template_id = ? and user_id = ?;";
            $changeParams[] = $workspaceId;
            $changeParams[] = $template['template_id'];
            $changeParams[] = $template['user_id'];
        }
        db_query($query_to_change_folder, $params);

        */
    }
}
