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
_load_language_file("/management.inc");

require("../user_library.php");
require("management_library.php");
require("get_group_members.php");

/***
 * TODO:
 * group aanmaken DONE
 * checken of al lid is van groep DONE
 * remove van groep DONE
 * groep verwijderen DONE
 *
 */

if (is_user_permitted("useradmin")) {

    $database_id = database_connect("user groups list connected","user groups list failed");

    $query="select * from " . $xerte_toolkits_site->database_table_prefix . "user_groups order by group_name";
    $user_groups = db_query($query);

    echo "<h2>" . MANAGEMENT_MENUBAR_USER_GROUPS . "</h2>";
	
	echo "<div class=\"admin_block\">";
	echo "<h3>" . USER_GROUPS_MANAGEMENT_ADD . "</h3>";
	echo "<form><input type=\"textinput\" name=\"newgroup\" id=\"newgroup\" /><button type=\"button\" class=\"xerte_button\" onclick=\"javascript:add_new_group('newgroup')\">" . USER_GROUPS_MANAGEMENT_ADD_GROUP . "</button></form>";
	echo "</div>";
	
	echo "<div class=\"admin_block\">";
	echo "<h3>" . USER_GROUPS_MANAGEMENT_MANAGE . "</h3>";
	
	echo "<form name=\"user_groups\" action=\"javascript:list_group_members('group')\">";
    echo "<label for=\"group\"><p>" . USER_GROUPS_MANAGEMENT_SELECT_GROUP . "</p></label>";
    echo "<select id=\"group\" onchange=\"this.form.submit();\">";
    $firstgroup = null;
    foreach($user_groups as $group){
        if ($firstgroup == null){
            $firstgroup = $group['group_id'];
        }
            echo "<option value=\"" . $group['group_id'] . "\">" . $group['group_name'] ."</option>";
    }

    echo "</select>";
    echo "<button class=\"xerte_button\" onclick=\"javascript:delete_group('group')\"><i class=\"fa fa-minus-circle\"></i> " . USER_GROUPS_MANAGEMENT_REMOVE_GROUP . "</button><br>";
    echo "</form>";

//    $database_id = database_connect("user list connected","user list failed");

    $query="select * from " . $xerte_toolkits_site->database_table_prefix . "logindetails order by surname,firstname,username" ;

    $logins = db_query($query);

    echo "<br><form name=\"all_users\" action=\"javascript:add_member('list_user', 'group')\">";
    echo "<label for=\"list_user\"><p>" . USER_GROUPS_MANAGEMENT_ALL_USERS. "</p></label>";

    echo "<select id=\"list_user\" multiple placeholder='". USER_GROUPS_MANAGEMENT_SELECT . "'>";
    foreach($logins as $row_users){
        echo "<option value=\"" . $row_users["login_id"] . "\">" . $row_users['surname'] . ", " . $row_users['firstname'] . " (" . $row_users['username'] . ")</option>";
    }

    echo "</select>";
    echo "<button type=\"submit\" style=\"display:inline;\" class=\"xerte_button\"><i class=\"fa fa-plus-circle\"></i> " . USER_GROUPS_MANAGEMENT_ADD_MEMBER . "</button>";

    /*
    foreach($query_response as $row) {

        echo "<div class=\"template\" id=\"" . $row['username'] . "\" savevalue=\"" . $row['login_id'] .  "\"><p>" . $row['firstname'] . " " . $row['surname'] . " <button type=\"button\" class=\"xerte_button\" id=\"" . $row['username'] . "_btn\" onclick=\"javascript:templates_display('" . $row['username'] . "')\">" . USERS_TOGGLE . "</button><button style=\"float:right;\" type=\"button\" class=\"xerte_button\" id=\"" . $row['username'] . "_btn\" onclick=\"javascript:add_member('" . $row['login_id'] . "', 'group')\">" . USER_GROUPS_MANAGEMENT_ADD_MEMBER . "</button></p></div><div class=\"template_details\" id=\"" . $row['username']  . "_child\">";

        echo "<p>" . USERS_ID . "<form><textarea id=\"user_id" . $row['login_id'] .  "\">" . $row['login_id'] . "</textarea></form></p>";
        echo "<p>" . USERS_FIRST . "<form><textarea id=\"firstname" . $row['login_id'] .  "\">" . $row['firstname'] . "</textarea></form></p>";
        echo "<p>" . USERS_KNOWN . "<form><textarea id=\"surname" . $row['login_id'] .  "\">" . $row['surname'] . "</textarea></form></p>";
        echo "<p>" . USERS_USERNAME . "<form><textarea id=\"username" . $row['login_id'] .  "\">" . $row['username'] . "</textarea></form></p>";
        echo "</div>";

    }

    */
    echo "</form>";
	echo "</div>";

    echo "<div id=\"memberlist\" class=\"admin_block\">";
    get_group_members($firstgroup);
	echo "</div>";

}else{

    management_fail();

}

?>
