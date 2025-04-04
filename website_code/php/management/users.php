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

if(is_user_permitted("useradmin")){
    global $authmech;
    if (!isset($authmech))
    {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    if ($xerte_toolkits_site->altauthentication != "" && !$authmech->canManageUser($jsscript))
    {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->altauthentication);
    }

    $prefix = $xerte_toolkits_site->database_table_prefix;
	echo "<h2>" . MANAGEMENT_MENUBAR_USERS . "</h2>";
	echo "<div class=\"admin_block\">";

    if ($authmech->check() && $authmech->canManageUser($jsscript))
    {
        echo "<h2>" . USERS_MANAGE_AUTH . "</h2>";
        echo "<div id=\"manage_auth_users\">";
        $authmech->getUserList(false, "");
        echo "</div>";
    }
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
                echo "<td><button type=\"button\" class=\"xerte_button\" id=\"user_id_" . $row['login_id'] . "_btn\" title=\"" . USERS_MANAGE_ROLES_OVERVIEW_SELECT_USER . "\" onclick=\"javascript:manage_user_roles_select('" . $prevuser . "')\"><i class='fa fa-pen-to-square'></i></button></td>";
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
    echo "<td><button type=\"button\" class=\"xerte_button\" id=\"user_id_" . $row['login_id'] . "_btn\" title=\"" . USERS_MANAGE_ROLES_OVERVIEW_SELECT_USER . "\" onclick=\"javascript:manage_user_roles_select('" . $prevuser . "')\"><i class='fa fa-pen-to-square'></i></button></td>";
    echo "</tr>";
    echo "    </tbody>";
    echo "  </table>";
    echo "  </div>";
    echo "<h2>" . USERS_MANAGE_ACTIVE . "</h2>";

    $database_id = database_connect("templates list connected","template list failed");

    $query="select * from {$prefix}logindetails order by surname,firstname,username";

	$query_response = db_query($query);

    foreach($query_response as $row) { 
        echo "<div class=\"template\" id=\"" . $row['username'] . "\" savevalue=\"" . $row['login_id'] .  "\"><p>" . $row['surname'] . ", " . $row['firstname'] . " <button type=\"button\" class=\"xerte_button\" id=\"" . $row['username'] . "_btn\" onclick=\"javascript:templates_display('" . $row['username'] . "')\">" . USERS_TOGGLE . "</button></p></div><div class=\"template_details\" id=\"" . $row['username']  . "_child\">";

        echo "<p>" . USERS_ID . "<form><textarea id=\"user_id" . $row['login_id'] .  "\">" . $row['login_id'] . "</textarea></form></p>";
        echo "<p>" . USERS_FIRST . "<form><textarea id=\"firstname" . $row['login_id'] .  "\">" . $row['firstname'] . "</textarea></form></p>";
        echo "<p>" . USERS_KNOWN . "<form><textarea id=\"surname" . $row['login_id'] .  "\">" . $row['surname'] . "</textarea></form></p>";
        echo "<p>" . USERS_USERNAME . "<form><textarea id=\"username" . $row['login_id'] .  "\">" . $row['username'] . "</textarea></form></p>";
        echo "</div>";

    }
	
	echo "</div>";

}else{

    management_fail();

}

?>
