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
 * Date: 03-11-20
 */

require_once("../../../config.php");

_load_language_file("/website_code/php/management/user_groups.inc");
_load_language_file("/website_code/php/management/users.inc");

require_once("../user_library.php");
require("../url_library.php");
require_once("management_library.php");

function get_group_members($group_id){

    if (is_null($group_id) or $group_id=="") {
        return false;
    }
    $database_id = database_connect("member list connected","member list failed");

    $query="select * from " . $xerte_toolkits_site->database_table_prefix . "logindetails, user_group_members WHERE logindetails.login_id=user_group_members.login_id AND user_group_members.group_id=? ORDER BY logindetails.surname";

    $query_response = db_query($query, array($group_id));

    //get selected group name:
    $group = db_query_one("SELECT * FROM " . $xerte_toolkits_site->database_table_prefix . "user_groups WHERE group_id=?", array($group_id));
    echo "<h2>" . USER_GROUPS_MANAGEMENT_GROUP_MEMBERS . $group['group_name'] . ".</h2>";

    $membercount = count($query_response);
    if (empty($query_response)){
        echo "<p>" . USER_GROUPS_MANAGEMENT_NO_MEMBERS . "</p>";
    }else{
        if ($membercount == 1){
            echo "<p>" . USER_GROUPS_MANAGEMENT_ONE_MEMBER . "</p>";
        }else{
            echo "<p>" . str_replace("{n}", $membercount, USER_GROUPS_MANAGEMENT_MEMBERS_COUNT) . "</p>";
        }
        foreach($query_response as $row) {

            echo "<div class=\"template\" id=\"" . $row['username'] . "\" savevalue=\"" . $row['login_id'] .  "\"><p>" . $row['firstname'] . " " . $row['surname'] . " <button type=\"button\" class=\"xerte_button\" id=\"" . $row['username'] . "_btn\" onclick=\"javascript:templates_display('" . $row['username'] . "')\">" . USERS_TOGGLE . "</button><button style=\"float:right;\" type=\"button\" class=\"xerte_button\" id=\"" . $row['username'] . "_btn\" onclick=\"javascript:delete_member('" . $row['login_id'] . "', 'group')\">" . USER_GROUPS_MANAGEMENT_REMOVE_MEMBER . "</button></p></div><div class=\"template_details\" id=\"" . $row['username']  . "_child\">";

            echo "<p>" . USERS_ID . "<form><textarea id=\"user_id" . $row['login_id'] .  "\">" . $row['login_id'] . "</textarea></form></p>";
            echo "<p>" . USERS_FIRST . "<form><textarea id=\"firstname" . $row['login_id'] .  "\">" . $row['firstname'] . "</textarea></form></p>";
            echo "<p>" . USERS_KNOWN . "<form><textarea id=\"surname" . $row['login_id'] .  "\">" . $row['surname'] . "</textarea></form></p>";
            echo "<p>" . USERS_USERNAME . "<form><textarea id=\"username" . $row['login_id'] .  "\">" . $row['username'] . "</textarea></form></p>";
            echo "</div>";

        }
    }
}

if(is_user_admin()){

    $group_id = $_POST['group_id'];
    get_group_members($group_id);


}else{

    management_fail();

}

