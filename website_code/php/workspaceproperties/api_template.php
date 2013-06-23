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

$query = "select * from {$xerte_toolkits_site->database_table_prefix}api_keys where user_id={$_SESSION['toolkits_logon_id']} ORDER BY created DESC";

$response = mysql_query($query);
if ($response) {
	$count = 0;
	while($row = mysql_fetch_array($response)) {
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

?>
