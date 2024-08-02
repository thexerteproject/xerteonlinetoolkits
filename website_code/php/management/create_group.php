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

    $group_name = $_POST['group_name'];

    $database_id = database_connect("group list connected","group list failed");

    //check if group with that name already exists:
    $query = "SELECT * FROM " . $xerte_toolkits_site->database_table_prefix . "user_groups WHERE group_name=?";
    $exists = db_query_one($query, array($group_name));
    $id = null;
    if (!is_null($exists)){
        //group already exists
        return;
    }else{
        //Add new group to database
        $query = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "user_groups set group_name=?";
        $id = db_query($query, array($group_name));
    }

    //Update group selection list
    $query="select * from " . $xerte_toolkits_site->database_table_prefix . "user_groups order by group_name";
    $user_groups = db_query($query);
    foreach($user_groups as $group){
        if ($group['group_id'] == $id){
            echo "<option value=\"" . $group['group_id'] . "\" selected>" . $group['group_name'] ."</option>";
        }else{
            echo "<option value=\"" . $group['group_id'] . "\">" . $group['group_name'] ."</option>";
        }
    }

}else{

    management_fail();

}

