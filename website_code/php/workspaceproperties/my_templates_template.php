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

_load_language_file("/website_code/php/workspaceproperties/shared_templates_template.inc");

include "../display_library.php";

include "workspace_library.php";

/**
 * connect to the database
 */

$database_connect_id = database_connect("workspace_template.php connect success","workspace_template.php connect failed");

$prefix =  $xerte_toolkits_site->database_table_prefix ;

$query_for_created_templates = "select * from {$prefix}templatedetails where creator_id= ? ORDER BY date_created DESC";

$params = array($_SESSION['toolkits_logon_id']);

$query_created_response = db_query($query_for_created_templates, $params);

usort($query_created_response, function($first, $second){
    return $first['template_id'] > $second['template_id'];
});

echo "<table class=\"workspaceProjectsTable\">";

echo "<caption>" . WORKSPACE_LIBRARY_MY_PROJECTS_INTRO . "</caption>";

echo "<tr><th class=\"narrow\">" . WORKSPACE_LIBRARY_TEMPLATE_ID . "</th>";

echo "<th>" . WORKSPACE_LIBRARY_TEMPLATE_NAME . "</th></tr>";

foreach($query_created_response as $row_template_name) {
	
	$path = $xerte_toolkits_site->site_url . "preview.php?template_id=";
	
	echo "<tr><td>" . $row_template_name['template_id'] . "</td><td><a href=\"" . $path . $row_template_name['template_id'] . "\" target=\"_blank\">";

	echo str_replace("_"," ",$row_template_name['template_name']);
	
	echo "<span class=\"sr-only\">(" . WORKSPACE_LIBRARY_LINK_WINDOW . ")</span></a>";
	
	echo "</td></tr>";

}

echo "</table>";