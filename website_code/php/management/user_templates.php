<?php
require_once("../../../config.php");

require("../user_library.php");
require("../url_library.php");

if(is_user_admin()){

	$database_id = database_connect("templates list connected","template list failed");
	
	$query="select * from " . $xerte_toolkits_site->database_table_prefix . "logindetails";

	$query_response = mysql_query($query);

	while($row = mysql_fetch_array($query_response)){

		echo "<div class=\"template\" id=\"" . $row['username'] . "\" savevalue=\"" . $row['login_id'] .  "\"><p>" . $row['firstname'] . " " . $row['surname'] . " <a href=\"javascript:templates_display('" . $row['username'] . "')\">View</a></p></div><div class=\"template_details\" id=\"" . $row['username']  . "_child\">";
		
		$query_templates="select * from " . $xerte_toolkits_site->database_table_prefix . "templatedetails," . $xerte_toolkits_site->database_table_prefix . "templaterights where " . $xerte_toolkits_site->database_table_prefix . "templaterights.user_id =\"" . $row['login_id'] . "\" and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id";

		$query_templates_response = mysql_query($query_templates);

		if(mysql_num_rows($query_templates_response)!=0){

			while($row_templates = mysql_fetch_array($query_templates_response)){

				echo "<div class=\"template\" id=\"" . $row['login_id'] . "template" . $row_templates['template_id'] . "\"><p>" . $row_templates['template_name'] .  " <a href=\"javascript:templates_display('" . $row['login_id'] . "template" . $row_templates['template_id'] . "')\">View</a></p></div><div class=\"template_details\" id=\"" . $row['login_id'] . "template" . $row_templates['template_id']  . "_child\">";
	
				echo "<p>The template id is " . $row_templates['template_id']  . "</p>";
				echo "<p>The date created was " . $row_templates['date_created']  . "</p>";
				echo "<p>The date modified was " . $row_templates['date_modified']  . "</p>";
				echo "<p>The date accessed was " . $row_templates['date_accessed']  . "</p>";
				echo "<p>The number of plays is " . $row_templates['number_of_uses']  . "</p>";
				echo "<p>Access for this is set as " . $row_templates['access_to_whom']  . "</p>";
				echo "<p><a href=\"javascript:edit_window('" . $row_templates['template_id'] . "')\">Edit</a> - <a href=\"javascript:preview_window('" . $row_templates['template_id'] . "')\">Preview</a> - <a href=\"javascript:properties_window('" . $row_templates['template_id'] . "')\">Properties</a></p>";
				
				echo "<p>Give this template to another user</p>";
				
				echo "<form name=\"" . $row['login_id'] . "_" . $row_templates['template_id'] . "\" action=\"javascript:change_owner('" . $row_templates['template_id'] . "')\"><select id=\"" . $row_templates['template_id'] . "_new_owner\">";
				
				$query_users="select * from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id !=" . $row['login_id'];

				$query_users_response = mysql_query($query_users);

				if(mysql_num_rows($query_users_response)!=0){

					while($row_users = mysql_fetch_array($query_users_response)){
				
						echo "<option value=\"" . $row_users['login_id'] . "\">" . $row_users['firstname'] . " " . $row_users['surname'] . " (" . $row_users['username'] . ")</option>";
				
					}
					
					echo "</select>";
					
				}
				
				echo "<br /><input type=\"hidden\" value=\"" . $row['login_id'] . "_" . $row_templates['template_id'] . "\" name=\"template_id\" /><input type=\"submit\" value=\"Give template\" /></form></div>";

			}

		}else{

				echo "<div class=\"template\" id=\"" . $row_templates['template_name'] . "\" savevalue=\"" . $row['template_id'] .  "\"><p>This user has no templates at present</p></div>";

		}

		echo "</div>";

	}
			
}else{

	echo "the feature is for administrators only";

}

?>
