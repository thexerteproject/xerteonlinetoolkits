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
* Created by JetBrains PhpStorm.
* User: tom
* Date: 28-2-13
* Time: 18:48
* To change this template use File | Settings | File Templates.
*/

require_once("../../../config.php");

_load_language_file("/website_code/php/management/user_templates.inc");

require("../user_library.php");
require("../url_library.php");
require("management_library.php");

if(is_user_permitted("projectadmin", "system")) {

    $database_id = database_connect("templates list connected", "template list failed");

    // get the current login_id
    if (!isset($_REQUEST['user_id'])) {
        exit;
    }
    $login_id = x_clean_input($_REQUEST['user_id']);

    // Get all users
    $query = "SELECT * FROM " . $xerte_toolkits_site->database_table_prefix . "logindetails order by surname,firstname,username";

    $query_response = db_query($query);
    // Fetch users only once and put the results in a php array
    $logins = array();
    foreach ($query_response as $login) {
        $logins[] = $login;
        if ($login['login_id'] == $login_id) {
            $row = $login; // record of current login
        }
    }

    echo str_replace("{user}", $row['firstname'] .  " "  . $row['surname'], USERS_MANAGEMENT_TEMPLATE_TRANSFER_EXPLANATION);

    echo "<form name=\"doTransfer\" action=\"javascript:do_transfer_user_templates('" . $login_id . "', 'select_new_owner', 'transfer_private', 'transfer_shared_folders', 'delete_user')\"><select id=\"select_new_owner\">";

    foreach ($logins as $row_users) {

        if ($row['login_id'] != $row_users['login_id']) {
            echo "<option value=\"" . $row_users['login_id'] . "\">" . $row_users['surname'] . ", " . $row_users['firstname'] . " (" . $row_users['username'] . ")</option>";
        }

    }

    echo "</select><br>";
    echo "<input type=\"checkbox\" name=\"transfer_private\" id=\"transfer_private\"><label for=\"transfer_private\">" .  USERS_MANAGEMENT_TEMPLATE_TRANSFER_PRIVATE . "</label><br>";
    echo "<input type=\"checkbox\" name=\"transfer_shared_folders\" id=\"transfer_shared_folders\"><label for=\"transfer_shared_folders\">" .  USERS_MANAGEMENT_TEMPLATE_TRANSFER_SHARED_FOLDERS . "</label><br>";
    echo "<input type=\"checkbox\" checked name=\"delete_user\" id=\"delete_user\"><label for=\"delete_user\">" .  USERS_MANAGEMENT_TEMPLATE_TRANSFER_DELETEUSER . "</label><br>";
    echo "<button type=\"submit\" class=\"xerte_button\"><i class=\"fa fa-share\"></i> " . USERS_MANAGEMENT_TEMPLATE_TRANSFER_BUTTON . "</button></form>";
    echo "<div id=\"transfer_result\" style=\"display:none;\"><img src=\"website_code/images/loading16.gif\"></div>";

}else{

    management_fail();

}
