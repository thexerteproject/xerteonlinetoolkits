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
require("../../../config.php");

_load_language_file("/website_code/php/management/users.inc");
_load_language_file("/management.inc");

require("../user_library.php");
require("management_library.php");
require("get_user_roles.php");
require("get_active_users.php");

if(is_user_permitted("useradmin")){
    global $authmech, $xerte_toolkits_site;;
    if (!isset($authmech))
    {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    if ($authmech->check() && $authmech->canManageUser($jsscript))
    {
        $authmech_can_manage_users = true;
    }
    else
    {
        $authmech_can_manage_users = false;
    }

    if ($xerte_toolkits_site->altauthentication != "")
    {
        $altauthmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->altauthentication);
        if ($altauthmech->check() && $altauthmech->canManageUser($jsscript))
        {
            $altauthmech_can_manage_users = true;
        }
        else
        {
            $altauthmech_can_manage_users = false;
        }
    }

    $prefix = $xerte_toolkits_site->database_table_prefix;
	echo "<h2>" . MANAGEMENT_MENUBAR_USERS . "</h2>";


    if ($authmech_can_manage_users || $altauthmech_can_manage_users)
    {
        echo "  <div class=\"template\" id=\"db_user_mngmnt\"><p>" . USERS_MANAGE_AUTH . " <button type=\"button\" class=\"xerte_button\" id=\"db_user_mngmnt_btn\" onclick=\"javascript:templates_display('db_user_mngmnt')\">" . USERS_TOGGLE . "</button></p></div>";
        echo "  <div class=\"template_details\" id=\"db_user_mngmnt_child\">";
        //echo "    <h2>" . USERS_MANAGE_AUTH . "</h2>";
        echo "    <div id=\"manage_auth_users\">";
        if ($authmech_can_manage_users) {
            $authmech->getUserList(true, "");
        }
        else if ($altauthmech_can_manage_users) {
            $altauthmech->getUserList(true, "");
        }
        echo "    </div>";
        echo "  </div>";
    }

    if (is_user_admin()) {
        $user_roles_title = USERS_MANAGE_ROLES;
    }
    else {
        $user_roles_title = USERS_SHOW_ROLES;
    }
    echo "  <div class=\"template\" id=\"user_roles_mngmnt\"><p>" . $user_roles_title . " <button type=\"button\" class=\"xerte_button\" id=\"user_roles_mngmnt_btn\" onclick=\"javascript:templates_display('user_roles_mngmnt')\">" . USERS_TOGGLE . "</button></p></div>";
    echo "  <div class=\"template_details\" id=\"user_roles_mngmnt_child\">";
    echo "<div id=\"manage_user_roles\">";
    x_get_user_roles();
    echo "</div>";
    $query = "SELECT ld.*, r.name FROM {$prefix}logindetails ld, {$prefix}role r, {$prefix}logindetailsrole ldr WHERE ld.login_id = ldr.userid AND r.roleid = ldr.roleid ORDER BY ld.surname, ld.firstname, ld.username, r.roleid";
    $result = db_query($query);
    echo "<h3>" . USERS_MANAGE_ROLES_OVERVIEW . "</h3>";
    echo "  <div id=\"manage_user_roles_overview\"></div>";
    $prevuser = -1;
    echo "  <table class='user-role-overview'>";
    echo "    <thead>";
    echo "      <tr>";
    echo "          <th>" . USERS_MANAGE_ROLES_OVERVIEW_USERNAME . "</th>";
    echo "          <th>" . USERS_MANAGE_ROLES_OVERVIEW_ASSIGNED_ROLES . "</th>";
    echo "          <th></th>";
    echo "      </tr>";
    echo "    </thead>";
    echo "    <tbody>";
    foreach($result as $row)
    {
        if ($prevuser != $row['login_id'])
        {
            if ($prevuser != -1) {
                echo "</td>";
                // select button
                if (is_user_admin()) {
                    echo "<td><button type=\"button\" class=\"xerte_button\" id=\"user_id_" . $row['login_id'] . "_btn\" title=\"" . USERS_MANAGE_ROLES_OVERVIEW_SELECT_USER . "\" onclick=\"javascript:manage_user_roles_select('" . $prevuser . "')\"><i class='fa fa-pen-to-square'></i></button></td>";
                }
                else{
                    // Empty column
                    echo "<td></td>";
                }
                echo "</tr>";
            }
            echo "<tr><td class=\"user-roles-username\">";
            echo $row['surname'] . ", " . $row['firstname'] . " (" . $row['username'] . ")";
            echo "</td>";
        }
        if ($prevuser != $row['login_id'])
        {
            echo "<td class=\"user-roles-roles\">";
            echo constant("USERS_ROLE_".strtoupper($row["name"]));
        }
        else{
            echo ", " . constant("USERS_ROLE_".strtoupper($row["name"]));
        }
        $prevuser = $row['login_id'];
    }
    echo "</td>";
    // select button
    if (is_user_admin()) {
        echo "<td><button type=\"button\" class=\"xerte_button\" id=\"user_id_" . $row['login_id'] . "_btn\" title=\"" . USERS_MANAGE_ROLES_OVERVIEW_SELECT_USER . "\" onclick=\"javascript:manage_user_roles_select('" . $prevuser . "')\"><i class='fa fa-pen-to-square'></i></button></td>";
    }
    else{
        // Empty column
        echo "<td></td>";
    }
    echo "</tr>";
    echo "    </tbody>";
    echo "  </table>";
    echo "</div>";

    echo "  <div class=\"template\" id=\"manage_users\"><p>" . USERS_MANAGE_USERS . " <button type=\"button\" class=\"xerte_button\" id=\"manage_users_btn\" onclick=\"javascript:templates_display('manage_users')\">" . USERS_TOGGLE . "</button></p></div>";
    echo "  <div class=\"template_details\" id=\"manage_users_child\">";
    echo "<div id=\"active_user_management\">";
    x_get_users();
    echo "</div>";

    echo "<br>";
    echo "</div>";

    //echo "<h2>" . USERS_MANAGE_DISABLE_USERS_BASED_ON_LASTLOGIN . "</h2>";
    echo "  <div class=\"template\" id=\"disable_users\"><p>" . USERS_MANAGE_DISABLE_USERS_BASED_ON_LASTLOGIN . " <button type=\"button\" class=\"xerte_button\" id=\"disable_users_btn\" onclick=\"javascript:templates_display('disable_users')\">" . USERS_TOGGLE . "</button></p></div>";
    echo "  <div class=\"template_details\" id=\"disable_users_child\">";
    echo "<p>" . USERS_MANAGE_DISABLE_USERS_BASED_ON_LASTLOGIN_TEXT . "</p>";
    echo "<p><label for=\"disable_users_last_login_date\">" . USERS_MANAGE_DISABLE_USERS_BASED_ON_LASTLOGIN_DATE . "&nbsp;</label>";
    echo "<input type=\"date\" id=\"disable_users_last_login_date\" name=\"disable_users_last_login_date\" value=\"" . date("Y-m-d", strtotime("-1 year")) . "\" />";
    echo "&nbsp;<button type=\"button\" class=\"xerte_button\" id=\"disable_users_last_login_btn\" onclick=\"javascript:disable_users_based_on_last_login()\">" . USERS_MANAGE_DISABLE_USERS_BASED_ON_LASTLOGIN_BUTTON . "</button>";
    echo "</p></div>";
    /*
    echo "  </div>";

    $query="select * from {$prefix}logindetails where disabled=0 order by surname,firstname,username";
    $active_users = db_query($query);

    echo "<h2>" . USERS_MANAGE_ACTIVE . "(" . count($active_users) . ")</h2>";

    echo "<select onchange=\"changeUserSelection_active_users()\" multiple id=\"users\" class=\"selectize selectize_multi\">";
    echo "<option value=\"\">" . USERS_MANAGE_ACTIVE_SELECT_USER . "</option>";

    foreach ($active_users as $row_users) {
        if ($row_users["login_id"] == "*") {
            echo "<option selected=\"selected\" value=\"" . $row_users['login_id'] . "\">" . $row_users['surname'] . ", " . $row_users['firstname'] . " (" . $row_users['username'] . ")</option>";
        } else {
            echo "<option value=\"" . $row_users['login_id'] . "\">" . $row_users['surname'] . ", " . $row_users['firstname'] . " (" . $row_users['username'] . ")</option>";
        }
    }

    echo "</select>";

    foreach($active_users as $row) {
        echo "<div class=\"template\" id=\"" . $row['username'] . "\" savevalue=\"" . $row['login_id'] .  "\"><p>" . $row['surname'] . ", " . $row['firstname'] . " <button type=\"button\" class=\"xerte_button\" id=\"" . $row['username'] . "_btn\" onclick=\"javascript:templates_display('" . $row['username'] . "')\">" . USERS_TOGGLE . "</button></p></div><div class=\"template_details\" id=\"" . $row['username']  . "_child\">";

        echo "<p>" . USERS_ID . "<form><textarea id=\"user_id" . $row['login_id'] .  "\">" . $row['login_id'] . "</textarea></form></p>";
        echo "<p>" . USERS_FIRST . "<form><textarea id=\"firstname" . $row['login_id'] .  "\">" . $row['firstname'] . "</textarea></form></p>";
        echo "<p>" . USERS_KNOWN . "<form><textarea id=\"surname" . $row['login_id'] .  "\">" . $row['surname'] . "</textarea></form></p>";
        echo "<p>" . USERS_USERNAME . "<form><textarea id=\"username" . $row['login_id'] .  "\">" . $row['username'] . "</textarea></form></p>";
        echo "</div>";

    }
	
	echo "</div>";
    */
}else{

    management_fail();

}

