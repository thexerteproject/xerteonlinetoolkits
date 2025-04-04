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
 * check whether member to be removed owns templates in a folder shared with the group
 *
 * @author Tom Reijnders
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
require_once "../folder_library.php";

_load_language_file("/website_code/php/management/check_delete_member.inc");

if(is_user_permitted("useradmin")) {

    $login_id = $_POST['login_id'];
    $group_id = $_POST['group_id'];

    // Get all folders shared with this group
    $shared_folders = get_all_folders_shared_with_group($group_id);
    foreach ($shared_folders as $folder_id) {
        // Check if user is in this folder in any other capacity
        $shared_groups = get_shared_groups_of_folder($folder_id, true);
        $shared_users = get_shared_users_of_folder($folder_id, true);

        // Remove the group from the list of shared groups
        $shared_groups = array_diff($shared_groups, array($group_id));

        $users = array();
        foreach ($shared_groups as $shared_group) {
            $users = array_merge($users, get_users_from_group($shared_group));
        }

        // Check if $id is in $users
        if (in_array($login_id, $users, true) !== false && in_array($login_id, $shared_users, true) !== false) {
            // User has access in a different way
            // No need to check the rest for this folder
            continue;
        }

        // Check for templates owned by login_id
        $templates = get_all_templates_of_user_in_folder($folder_id, $login_id);

        if (count($templates) > 0) {
            echo USER_HAS_TEMPLATES_IN_FOLDER;
            return;
        }
    }

    echo 'OK';

}else{
    management_fail();
}
