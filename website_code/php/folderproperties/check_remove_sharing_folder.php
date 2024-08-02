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
 * check remove sharing template, returns nr of templates owned by user to be removed to be able to give warning
 *
 * @author Tom Reijnders
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

_load_language_file("/website_code/php/folderproperties/check_remove_sharing_folder.inc");

$id = $_POST['id'];
$folder_id = $_POST['folder_id'];
$group = $_POST['group'];

if(is_numeric($_POST['folder_id'])) {

    if (is_user_creator_or_coauthor_folder($_POST['folder_id']) || is_user_permitted("projectadmin") || $_POST['user_deleting_self'] == "true") {
        $prefix = $xerte_toolkits_site->database_table_prefix;

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
            // Check if $id is in $users
            if (in_array($id, $users, true) !== false) {
                // User is in a shared group
                // No need to check the rest
                echo "OK";
                return;
            }
            else{
                $removeusers[] = $id;
            }
        }

        // For all users in $removeusers, move the projects to the root of the respective workspace
        $query_to_change_folder = "";
        $changeParams = array();
        foreach($removeusers as $user_id) {
            // Check if $id is in $users
            if (in_array($user_id, $users, true) !== false) {
                // User is in a shared group
                // No need to check the rest
                echo "OK";
                return;

            } else {
                // Get all templates of user in folder structure
                if (in_array($user_id, $shared_users, true) === false) {
                    // User is not in the list of shared users

                    $templates = get_all_templates_of_user_in_folder($folder_id, $user_id);

                    if (count($templates) > 0) {
                        if ($_POST['user_deleting_self'] == "true") {
                            echo YOU_HAVE_TEMPLATES_IN_FOLDER;
                        } else if ($group === "false") {
                            echo USER_HAS_TEMPLATES_IN_FOLDER;
                        } else {
                            echo GROUP_HAS_TEMPLATES_IN_FOLDER;
                        }
                        return;
                    }
                }
            }
        }
        echo "OK";
    }
}