<?PHP     require("../../../config.php");
require("../../../session.php");

require("../database_library.php");
require("../user_library.php");

if(is_user_admin()){

	$mysql_id = database_connect("New_license.php database connect success","New_license.php database connect failed");

	$query = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses (license_name) values  ('" . $_POST['newlicense'] . "')";

	if(mysql_query($query)){

		// change these

		//receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder creation succeeded for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);

	}else{

		// change these

		//receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder creation failed for " . $_SESSION['toolkits_logon_username'], "Folder creation failed for " . $_SESSION['toolkits_logon_username']);


	}

	$database_id = database_connect("templates list connected","template list failed");
	
	echo "<p>Add a new license</p>";

	echo "<p>The new license is <form><textarea cols=\"100\" rows=\"2\" id=\"newlicense\">Enter license name here</textarea></form></p>";
       echo "<p><form action=\"javascript:new_license();\"><input type=\"submit\" label=\"Add\" /></form></p>"; 

	echo "<p>Manage existing licenses</p>";

	$query="select * from " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses";

	$query_response = mysql_query($query);

	while($row = mysql_fetch_array($query_response)){

		echo "<p>" . $row['license_name'] . " - <a href=\"javascript:remove_licenses('" . $row['license_id'] .  "')\">Remove </a></p>";

	}

			
}else{

	echo "the feature is for administrators only";

}

?>