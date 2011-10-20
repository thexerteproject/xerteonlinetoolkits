<?php
require_once("../../../config.php");

require("../user_library.php");

if(is_user_admin()){

	$database_id = database_connect("templates list connected","template list failed");
	
	$query="select * from " . $xerte_toolkits_site->database_table_prefix . "logindetails";

	$query_response = mysql_query($query);

	while($row = mysql_fetch_array($query_response)){

		echo "<div class=\"template\" id=\"" . $row['username'] . "\" savevalue=\"" . $row['login_id'] .  "\"><p>" . $row['firstname'] . " " . $row['surname'] . " <a href=\"javascript:templates_display('" . $row['username'] . "')\">View</a></p></div><div class=\"template_details\" id=\"" . $row['username']  . "_child\">";

		echo "<p>The user's ID is <form><textarea id=\"user_id" . $row['login_id'] .  "\">" . $row['login_id'] . "</textarea></form></p>";
		echo "<p>The user's first name is <form><textarea id=\"firstname" . $row['login_id'] .  "\">" . $row['firstname'] . "</textarea></form></p>";
		echo "<p>The user's surname is <form><textarea id=\"surname" . $row['login_id'] .  "\">" . $row['surname'] . "</textarea></form></p>";
		echo "<p>The user's username is <form><textarea id=\"username" . $row['login_id'] .  "\">" . $row['username'] . "</textarea></form></p>";
		echo "</div>";

	}
			
}else{

	echo "the feature is for administrators only";

}

?>
