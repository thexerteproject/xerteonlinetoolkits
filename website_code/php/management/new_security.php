<?PHP require("../../../config.php");
require("../../../session.php");

require("../database_library.php");
require("../user_library.php");

if(is_user_admin()){

	$mysql_id = database_connect("New_securty.php database connect success","New_security.php database connect failed");

	$query = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "play_security_details (security_setting,security_data,security_info) values  ('" . $_POST['newsecurity'] . "','" . $_POST['newdata'] . "','" . $_POST['newdesc'] ."')";

	if(mysql_query($query)){

		// change these

		//receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder creation succeeded for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);

	}else{

		// change these

		//receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder creation failed for " . $_SESSION['toolkits_logon_username'], "Folder creation failed for " . $_SESSION['toolkits_logon_username']);


	}

	$query_for_play_security = "select * from " . $xerte_toolkits_site->database_table_prefix . "play_security_details";

	$query_for_play_security_response = mysql_query($query_for_play_security);

	echo "<p>Add a new setting</p>";

	echo "<p>The security setting's name is <form><textarea cols=\"100\" rows=\"2\" id=\"newsecurity\">Enter name here</textarea></form></p>";
	echo "<p>The security data is <form><textarea cols=\"100\" rows=\"2\" id=\"newdata\">Enter the web address or ip range</textarea></form></p>";
       echo "<p>The security info is <form><textarea cols=\"100\" rows=\"2\" id=\"newdesc\">Enter the description users see here</textarea></form></p>"; 
       echo "<p><form action=\"javascript:new_security();\"><input type=\"submit\" label=\"Add\" /></form></p>"; 

	echo "<p>Manage existing settings</p>";

	while($row_security = mysql_fetch_array($query_for_play_security_response)){
	
		echo "<div class=\"template\" id=\"play" . $row_security['security_id'] . "\" savevalue=\"" . $row_security['security_id'] .  "\"><p>" . $row_security['security_setting'] . " <a href=\"javascript:templates_display('play" . $row_security['security_id'] . "')\">View</a></p></div><div class=\"template_details\" id=\"play" . $row_security['security_id']  . "_child\">";
	
		echo "<p>The security setting is <form><textarea id=\"" . $row_security['security_id'] . $row_security['security_setting']  . "\">" . $row_security['security_setting']  . "</textarea></form></p>";
		echo "<p>The security data is <form><textarea id=\"" . $row_security['security_id'] .  $row_security['security_data']  . "\">" .  $row_security['security_data']  . "</textarea></form></p>";
	      echo "<p>The security info is <form><textarea id=\"" . $row_security['security_id'] .  $row_security['security_info']  . "\">" .  $row_security['security_info']  . "</textarea></form></p>"; 
	
		echo "<p><a href=\"remove_setting()\">Remove this setting</a>. In removing a setting all content with this option will be set to Private. You should inform your users of this change first.</p></div>";

	}

	mysql_close($mysql_id);

			
}else{

	echo "the feature is for administrators only";

}

?>

