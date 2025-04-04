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
 * User: NoudL
 * Date: 04-11-20
 */

require_once("../../../config.php");

_load_language_file("/website_code/php/management/user_groups.inc");
_load_language_file("/website_code/php/management/users.inc");

require_once("../user_library.php");
require_once("../url_library.php");
require_once "../folder_library.php";
require_once("management_library.php");

global $xerte_toolkits_site;
$prefix = $xerte_toolkits_site->database_table_prefix;

if(is_user_permitted("useradmin")){

    $login_id= x_clean_input($_POST['login_id'], 'numeric');
    $group_id = x_clean_input($_POST['group_id'], 'numeric');

    // Get all folders shared with this group
    $shared_folders = get_all_folders_shared_with_group($group_id);
    $workspaceId = get_user_root_folder_id_by_id($login_id);
    $templates = array();

    foreach ($shared_folders as $folder_id)
    {
        // Check if user is in this folder in any other capacity
        $shared_groups = get_shared_groups_of_folder($folder_id, true);
        $shared_users = get_shared_users_of_folder($folder_id, true);

        // Remove the group from the list of shared groups
        $shared_groups = array_diff($shared_groups, array($group_id));

        $users = array();
        foreach($shared_groups as $shared_group) {
            $users = array_merge($users, get_users_from_group($shared_group));
        }

        // Check if $id is in $users
        if (in_array($login_id, $users, true) !== false && in_array($login_id, $shared_users, true) !== false) {
            // User has access in a different way
            // No need to check the rest for this folder
            continue;
        }

        // Update templates owned by login_id
        $folder_templates = get_all_templates_of_user_in_folder($folder_id, $login_id);

        $templates = array_merge($templates, $folder_templates);
    }

    if (count($templates) > 0) {
        $questionmarks = str_repeat("?,", count($templates) - 1) . "?";
        $query = "update {$prefix}templaterights SET folder = ? where user_id = ? and role = 'creator' and template_id in ({$questionmarks})";
        $params = array($workspaceId, $login_id);
        $params = array_merge($params, $templates);
        db_query($query, $params);
    }
    $query = "DELETE FROM " . $xerte_toolkits_site->database_table_prefix . "user_group_members WHERE login_id=? AND group_id=?";
    $params = array($login_id, $group_id);
    db_query($query, $params);

}else{

    management_fail();

}

