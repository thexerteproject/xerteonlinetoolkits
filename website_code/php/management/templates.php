<?PHP require("../../../config.php");
require("../../../session.php");

require("../database_library.php");
require("../user_library.php");
require("../error_library.php");

if(is_user_admin()){

	$database_id = database_connect("templates list connected","template list failed");
	
	$query="select * from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails";

	$query_response = mysql_query($query);

	echo "<p style=\"margin:5px\">Upload a template<br><form style=\"margin:5px\" method=\"post\" enctype=\"multipart/form-data\" id=\"importpopup\" name=\"importform\" target=\"upload_iframe\" action=\"website_code/php/import/import_template.php\" onsubmit=\"javascript:iframe_check_initialise();\"><input name=\"filenameuploaded\" type=\"file\" /><br /><input type=\"submit\" name=\"submitBtn\" value=\"Upload\" onsubmit=\"javascript:iframe_check_initialise()\" /></form></p>";

	echo "<p style=\"margin:20px 0 0 5px\">Manage Existing templates</p>";

	while($row = mysql_fetch_array($query_response)){

		echo "<div class=\"template\" id=\"" . $row['template_name'] . "\" savevalue=\"" . $row['template_type_id'] . "\"><p>" . $row['template_name'] . " <a href=\"javascript:templates_display('" . $row['template_name'] . "')\">View</a></p></div><div class=\"template_details\" id=\"" . $row['template_name']  . "_child\">";
		echo "<p>This template is of type " . $row['template_framework'] . "</p>";

		if($row['template_framework']=="xerte"){

			$template_check = file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $row['template_name'] . "/" . $row['template_name']  . ".rlt");

			$folder = explode('"',substr($template_check,strpos($template_check,"targetFolder"),strpos($template_check,"version")-strpos($template_check,"targetFolder")));

			$start_point = strpos($template_check,"version");

			$version = explode('"',substr($template_check,$start_point,strpos($template_check," ",$start_point)-$start_point));

			echo "<p>This template is version number " . $version[1] . "</p>";

		}

		echo "<p>The description for this template is <form><textarea id=\"" . $row['template_type_id'] . "desc\">" . $row['description'] . "</textarea></form></p>";
		echo "<p>This template was uploaded on " . $row['date_uploaded'] . "</p>";
		echo "<p>The template has the following name for users<form><textarea id=\"" . $row['template_type_id'] . "display\">" . $row['display_name'] . "</textarea></form></p>";
		echo "<p>The template has the following example (0 means no example)<form><textarea id=\"" . $row['template_type_id'] . "example\">" .$row['display_id'] . "</textarea></form></p>";
		echo "<p>The following users can access this template (* means everyone)<form><textarea id=\"" . $row['template_type_id'] . "access\">" .$row['access_rights'] . "</textarea></form></p>";
		echo "<p>This template is currently set as ";

		echo "<select ";

		if($row['active']=="0"){

			echo " SelectedItem=\"true\" name=\"type\" id=\"" . $row['template_type_id'] . "active\" ><option value=\"true\">Active</option><option value=\"false\" selected=\"selected\">Unactive</option></select></p>";

		}else{

			echo " SelectedItem=\"true\" name=\"type\" id=\"" . $row['template_type_id'] . "active\" ><option value=\"true\" selected=\"selected\">Active</option><option value=\"false\">Unactive</option></select></p>";

		}

		echo "<p>Upload a new version of this template<br><form method=\"post\" enctype=\"multipart/form-data\" id=\"importpopup\" name=\"importform\" target=\"upload_iframe\" action=\"website_code/php/import/import_template.php\" onsubmit=\"javascript:iframe_check_initialise();\"><input name=\"filenameuploaded\" type=\"file\" /><br /><input type=\"hidden\" name=\"replace\" value=\"" . $row['template_type_id'] . "\" /><input type=\"hidden\" name=\"folder\" value=\"" . $row['template_name'] . "\" /><input type=\"hidden\" name=\"version\" value=\"" . $version[1] . "\" /><input type=\"submit\" name=\"submitBtn\" value=\"Upload\" onsubmit=\"javascript:iframe_check_initialise()\" /></form></p>";

		echo "</div>";		

	}
			
}else{

	echo "the feature is for administrators only";

}

?>