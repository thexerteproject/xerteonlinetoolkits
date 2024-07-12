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
require("../url_library.php");
require_once("management_library.php");

//returns an insert query to add a list of login_ids to a group
function add_members_to_group($login_ids, $group_id){
    global $xerte_toolkits_site;

    $prefix = $xerte_toolkits_site->database_table_prefix;
    $entries = array();
    foreach($login_ids as $login_id){
        $entries[] = "(" . $login_id . ", ". $group_id . ")";
    }

    return "INSERT INTO {$prefix}user_group_members (login_id, group_id) VALUES " . implode(', ', $entries);

}

if(is_user_admin()){
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $login_ids= x_clean_input($_POST['login_id']);
    $group_id = x_clean_input($_POST['group_id']);

    // Check whther group_id is numeric
    if (!is_numeric($group_id)){
        management_fail();
    }

    $logins = implode(',', $login_ids);
    // Check whether items in logins array are numeric
    foreach ($login_ids as $login_id){
        if (!is_numeric($login_id)){
            management_fail();
        }
    }

    $database_id = database_connect("member list connected","member list failed");

    $params = array( $group_id);
    $query = "SELECT * FROM {$prefix}user_group_members WHERE group_id=? AND login_id in (" . $logins . ")";
    $exists = db_query($query, $params);

    $existing_arr = array();
    foreach($exists as $row){
        array_push($existing_arr, $row['login_id']);
    }

    $logins_arr = array_diff($login_ids, $existing_arr);  //select only users who aren't in this group yet

    $query = add_members_to_group($logins_arr, $group_id);
    //$query = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "user_group_members (login_id, group_id) VALUES (?,?)";
    db_query($query);

}else{

    management_fail();

}

