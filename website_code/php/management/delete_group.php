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

if(is_user_permitted("useradmin")){

    $group_id = $_POST['group_id'];

    $database_id = database_connect("Delete group database connect success","Delete group database connect failed");

    //delete all instances of members in this group:
    $params = array($group_id);
    $query_to_delete_group_members = "delete from ". $xerte_toolkits_site->database_table_prefix . "user_group_members where group_id=?";
    db_query($query_to_delete_group_members, $params);

    // delete group:
    $query_to_delete_group = "delete from ". $xerte_toolkits_site->database_table_prefix . "user_groups where group_id=?";

    db_query($query_to_delete_group, $params);


}else{

    management_fail();

}

