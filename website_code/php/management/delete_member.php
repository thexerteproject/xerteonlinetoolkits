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
function delete_members_from_group($login_ids, $group_id){

    $entries = array();
    foreach($login_ids as $login_id){
        $entries[] = "('" . $login_id . "', '". $group_id . "')";
    }

    return "DELETE FROM " . $xerte_toolkits_site->database_table_prefix . "user_group_members WHERE login_id IN ?(login_id, group_id) VALUES " . implode(', ', $entries);

}

if(is_user_admin()){

    $login_id = $_POST['login_id'];
    $group_id = $_POST['group_id'];

    $database_id = database_connect("Delete member list connected","Delete member list failed");
    $query = "DELETE FROM " . $xerte_toolkits_site->database_table_prefix . "user_group_members WHERE login_id=? AND group_id=?";
    $params = array($login_id, $group_id);
    db_query($query, $params);

}else{

    management_fail();

}

