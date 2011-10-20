<?php 
require_once("../../../config.php");

require("../user_library.php");

if(is_user_admin()){

	$database_id = database_connect("templates list connected","template list failed");
	
	$query="select * from " . $xerte_toolkits_site->database_table_prefix . "syndicationcategories order by category_name ASC";

	echo "<p>Add a new category</p>";

	echo "<p>The new category is <form><textarea cols=\"100\" rows=\"2\" id=\"newcategory\">Enter name here</textarea></form></p>";
       echo "<p><form action=\"javascript:new_category();\"><input type=\"submit\" label=\"Add\" /></form></p>"; 

	echo "<p>Manage existing categories</p>";

	$query_response = mysql_query($query);

	while($row = mysql_fetch_array($query_response)){

		echo "<p>" . $row['category_name'] . " - <a href=\"javascript:remove_category('" . $row['category_id'] .  "')\">Remove </a></p>";

	}
			
}else{

	echo "the feature is for administrators only";

}

?>
