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
 * 
 * workspace templates template page, used displays the User created
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */


require_once("../../../config.php");

_load_language_file("/website_code/php/workspaceproperties/my_properties_template.inc");

include "../display_library.php";

/**
 * connect to the database
 */

$database_connect_id = database_connect("my_propertes_template.php connect success","my_properties_template.php connect failed");

$prefix = $xerte_toolkits_site->database_table_prefix ;

$query_for_user = "select * from {$prefix}logindetails where login_id= ?";
$params = array($_SESSION['toolkits_logon_id']);

$row_user = db_query_one($query_for_user, $params);


echo "<p class=\"header\"><span>" . MY_PROPERTIES_DETAILS . "</span></p>";

echo "<p>" . MY_PROPERTIES_NAME_DETAILS . " " . $row_user['firstname'] . " " . $row_user['surname'] . "</p>";

echo "<p>" . MY_PROPERTIES_LOGIN_DETAILS . " " . $row_user['lastlogin'] . "</p>";

echo "<p>" . MY_PROPERTIES_USERNAME_DETAILS . " " . $row_user['username'] . "</p>";
