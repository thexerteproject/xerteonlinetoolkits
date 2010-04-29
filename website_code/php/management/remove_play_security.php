<?PHP require("../../../config.php");
require("../../../session.php");

require("../database_library.php");
require("../user_library.php");

if(is_user_admin()){

	$query="delete from " . $xerte_toolkits_site->database_table_prefix . "play_security_details where security_id=\"" . $_POST['play_id']  . "\"";

	mysql_query($query);

	echo "<p>Add a new setting</p>";

	echo "<p>The security setting's name is <form><textarea cols=\"100\" rows=\"2\" id=\"newsecurity\">Enter name here</textarea></form></p>";
	echo "<p>The security data is <form><textarea cols=\"100\" rows=\"2\" id=\"newdata\">Enter the web address or ip range</textarea></form></p>";
       echo "<p>The security info is <form><textarea cols=\"100\" rows=\"2\" id=\"newdesc\">Enter the description users see here</textarea></form></p>"; 
       echo "<p><form action=\"javascript:new_security();\"><input type=\"submit\" label=\"Add\" /></form></p>"; 

	echo "<p>Manage existing settings</p>";

	$query_for_play_security = "select * from " . $xerte_toolkits_site->database_table_prefix . "play_security_details";

	$query_for_play_security_response = mysql_query($query_for_play_security);

	while($row_security = mysql_fetch_array($query_for_play_security_response)){
	
		echo "<div class=\"template\" id=\"play" . $row_security['security_id'] . "\" savevalue=\"" . $row_security['security_id'] .  "\"><p>" . $row_security['security_setting'] . " <a href=\"javascript:templates_display('play" . $row_security['security_id'] . "')\">View</a></p></div><div class=\"template_details\" id=\"play" . $row_security['security_id']  . "_child\">";
	
	       echo "<p>The security setting is <form><textarea id=\"" . $row_security['security_id'] . "security\">" . $row_security['security_setting']  . "</textarea></form></p>";
	       echo "<p>The security data is <form><textarea id=\"" . $row_security['security_id'] .  "data\">" .  $row_security['security_data']  . "</textarea></form></p>";
	       echo "<p>The security info is <form><textarea id=\"" . $row_security['security_id'] .  "info\">" .  $row_security['security_info']  . "</textarea></form></p>"; 
	
		echo "<p><a href=\"javascript:remove_security()\">Remove this setting</a>. In removing a setting all content with this option will be set to Private. You should inform your users of this change first.</p></div>";

	}

			
}else{

	echo "the feature is for administrators only";

}

?>