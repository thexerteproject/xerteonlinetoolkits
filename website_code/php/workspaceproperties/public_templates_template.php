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
 * @package
 */


require_once("../../../config.php");


include "../display_library.php";

include "workspace_library.php";

/**
 * connect to the database
 */

$prefix = $xerte_toolkits_site->database_table_prefix;

$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$query_for_public_templates = "select * from {$prefix}templatedetails, {$prefix}templaterights where "
. "(access_to_whom = ? or access_to_whom = ? or access_to_whom like ?) AND "
. "user_id = ? and "
. " {$prefix}templaterights.template_id = {$prefix}templatedetails.template_id ORDER BY template_name DESC";

$params = array('public', 'password', 'other%', $_SESSION['toolkits_logon_id']);
$query_public_response = db_query($query_for_public_templates, $params);

usort($query_public_response, function($first, $second){
    return $first['template_id'] > $second['template_id'];
});

echo "<table class=\"workspaceProjectsTable\">";

echo "<caption>" . WORKSPACE_LIBRARY_PUBLIC_PROJECTS_INTRO . "</caption>";

echo "<tr><th class=\"narrow\">" . WORKSPACE_LIBRARY_TEMPLATE_ID . "</th><th>" . WORKSPACE_LIBRARY_TEMPLATE_NAME . "</th><th>" . WORKSPACE_LIBRARY_ACCESS . "</th></tr>";

foreach($query_public_response as $row_template_name) {
	
	$path = $xerte_toolkits_site->site_url . "play.php?template_id=";

    echo "<tr><td>" . $row_template_name['template_id'] . "</td>";
	
	echo "<td><a href=\"" . $path . $row_template_name['template_id'] . "\" target=\"_blank\">";
	
	echo str_replace("_"," ",$row_template_name['template_name']);
	
	echo "<span class=\"sr-only\">(" . WORKSPACE_LIBRARY_LINK_WINDOW . ")</span></a></td>";
	
	echo "<td>" . $row_template_name['access_to_whom'] . "</td></tr>";
	
}

echo "</table>";
