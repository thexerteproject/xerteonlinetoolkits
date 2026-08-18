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

_load_language_file("/website_code/php/management/user_groups.inc");
_load_language_file("/website_code/php/management/users.inc");

require_once("../user_library.php");
require("../url_library.php");
require_once("management_library.php");

if (is_user_permitted("useradmin")) {
    global $xerte_toolkits_site;

    $group_id = $_POST['group_id'];
    $group_name = trim($_POST['group_name']);

    // Does another group already have this name?
    $query_to_check_group =
        "SELECT group_id
         FROM ".$xerte_toolkits_site->database_table_prefix."user_groups
         WHERE group_name=?
         AND group_id<>?";

    $params = array($group_name, $group_id);
    $res = db_query_one($query_to_check_group, $params);

    if ($res !== null) {
        // Duplicate name found
        return;
    }

    // Rename the group
    $query_to_rename_group =
        "UPDATE ".$xerte_toolkits_site->database_table_prefix."user_groups
         SET group_name=?
         WHERE group_id=?";

    $params = array($group_name, $group_id);
    $result = db_query($query_to_rename_group, $params);

    if ($result === false) {
        management_fail();
    }

    // Rebuild the group list
    $query = "SELECT * FROM ".$xerte_toolkits_site->database_table_prefix."
              user_groups
              ORDER BY group_name";

    $user_groups = db_query($query);

    foreach ($user_groups as $group) {
        if ($group['group_id'] == $group_id) {
            echo "<option value=\"".$group['group_id']."\" selected>".
                $group['group_name']."</option>";
        } else {
            echo "<option value=\"".$group['group_id']."\">".
                $group['group_name']."</option>";
        }
    }

} else {
    management_fail();
}