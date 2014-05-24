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
