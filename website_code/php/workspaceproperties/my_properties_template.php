<?php
/**
 * 
 * workspace templates template page, used displays the User created
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */


require_once("../../../config.php");

include "../display_library.php";

/**
 * connect to the database
 */

$database_connect_id = database_connect("my_propertes_template.php connect success","my_properties_template.php connect failed");

$query_for_user = "select * from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id=\"" . $_SESSION['toolkits_logon_id'] . "\"";

$query_user_response = mysql_query($query_for_user);

$row_user = mysql_fetch_array($query_user_response);

echo "<p class=\"header\"><span>My Details</span></p>";

echo "<p>My name on the system is " . $row_user['firstname'] . " " . $row_user['surname'] . "</p>";

echo "<p>My last login was on " . $row_user['lastlogin'] . "</p>";

echo "<p>My username is " . $row_user['username'] . "</p>";

?>
