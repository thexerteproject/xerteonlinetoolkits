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
 * public templates template page, used displays the User created
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */


require_once("../../../config.php");


include "../display_library.php";

include "workspace_library.php";

/**
 * connect to the database
 */

workspace_templates_menu();

$prefix = $xerte_toolkits_site->database_table_prefix;

$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$query_for_public_templates = "select * from {$prefix}templatedetails, {$prefix}templaterights where "
. "access_to_whom = ? AND "
. "user_id = ? and "
. " {$prefix}templaterights.template_id = {$prefix}templatedetails.template_id ORDER BY template_name DESC";
$params = array('public', $_SESSION['toolkits_logon_id']);

$query_public_response = db_query($query_for_public_templates, $params);

workspace_menu_create(100);

foreach($query_public_response as $row_template_name) {
    echo "<div style=\"float:left; width:100%;\">" . str_replace("_","",$row_template_name['template_name']) . "</div>";

}

echo "</div>";
