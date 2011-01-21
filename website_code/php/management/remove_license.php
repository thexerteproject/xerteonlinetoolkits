<?PHP require("../../../config.php");
require("../../../session.php");

require("../database_library.php");
require("../user_library.php");
require("../error_library.php");

if(is_user_admin()){

	$database_id = database_connect("templates list connected","template list failed");
	
	$query="delete from " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses where license_id=\"" . $_POST['remove']  . "\"";

	$query_response = mysql_query($query);

	$query="select * from " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses";

	echo "<p>Add a new license</p>";

	echo "<p>The new license is <form><textarea cols=\"100\" rows=\"2\" id=\"newlicense\">Enter license name here</textarea></form></p>";
       echo "<p><form action=\"javascript:new_license();\"><input type=\"submit\" label=\"Add\" /></form></p>"; 

	echo "<p>Manage existing licenses</p>";

	$query_response = mysql_query($query);

	while($row = mysql_fetch_array($query_response)){

		echo "<p>" . $row['license_name'] . " - <a href=\"javascript:remove_licenses('" . $row['license_id'] .  "')\">Remove </a></p>";

	}

			
}else{

	echo "the feature is for administrators only";

}

?>