<?php
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
