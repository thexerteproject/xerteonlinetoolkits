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

/**
 * connect to the database
 */

echo "<p class=\"header\"><span>API</span></p>";

$database_connect_id = database_connect("api_template.php connect success","api_template.php connect failed");
$prefix = $xerte_toolkits_site->database_table_prefix;
$query = "select * from {$prefix}api_keys where user_id= ? ORDER BY created DESC";
$params = array($_SESSION['toolkits_logon_id']);

$response = db_query($query, $params);
if ($response) {
	$count = 0;
	foreach($response as $row) {
		echo "<p><strong>" . $row['description'] . "</strong><br />";
		echo "Key: " . $row['consumer_key'] . "<br />";
		echo "Secret: " . $row['consumer_secret'] . "<br />";
		echo "Status: " . ($row['active'] ? "ENABLED" : "DISABLED") . "<br />";
		echo "Created on " . $row['created'] . "<br />";
		echo "Last modified on " . $row['last_modified'] . "<br />";
		echo (is_null($row['last_used']) ? "Has never been used." : "Last used on " . $row['last_used']) . "<br />";
		echo ($row['uses_count']>0 ? "Has been used " . $row['uses_count'] . " times." : "Has never been used.") . "</p>";

		$count++;
	}
	if ($count == 0) {
		echo "<p>No applications registered.</p>";
	}
}
else {
	echo "<p>API not yet installed.</p>";
}
