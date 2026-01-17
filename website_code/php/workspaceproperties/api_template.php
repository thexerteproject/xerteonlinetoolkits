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
 * api template page, displays API info
 *
 * @author John Smith
 */

require_once("../../../config.php");

include "../display_library.php";

_load_language_file("/website_code/php/workspaceproperties/api_template.inc");

/**
 * connect to the database
 */

echo "<h2 class=\"header\">" . API_HEADER . "</h2>";

echo "<div id=\"mainContent\">";

if($_SESSION['toolkits_logon_id']) {

	$database_connect_id = database_connect("api_template.php connect success","api_template.php connect failed");
	$prefix = $xerte_toolkits_site->database_table_prefix;
	$query = "select * from {$prefix}api_keys where user_id= ? ORDER BY created DESC";
	$params = array($_SESSION['toolkits_logon_id']);

	$response = db_query($query, $params);
	if ($response) {
		$count = 0;
		foreach($response as $row) {
			echo "<p><strong>" . $row['description'] . "</strong><br />";
			echo API_KEY . ": " . $row['consumer_key'] . "<br />";
			echo API_SECRET . ": " . $row['consumer_secret'] . "<br />";
			echo API_STATUS . ": " . ($row['active'] ? "ENABLED" : "DISABLED") . "<br />";
			echo API_CREATED . " " . $row['created'] . "<br />";
			echo API_MODIFIED . " " . $row['last_modified'] . "<br />";
			echo (is_null($row['last_used']) ? API_NEVER_USED : API_LAST_USED . " " . $row['last_used']) . "<br />";
			echo ($row['uses_count']>0 ? str_replace("{x}", $row['uses_count'], API_USED) : API_NEVER_USED) . "</p>";
			
			$count++;
		}
		if ($count == 0) {
			echo "<p>" . API_NO_APPLICATIONS . "</p>";
		}
	}
	else {
		echo "<p>" . API_NOT_INSTALLED . "</p>";
	}
	
} else {
	
	echo "<p>" . API_ERROR . "</p>";
	
}

echo "</div>";
