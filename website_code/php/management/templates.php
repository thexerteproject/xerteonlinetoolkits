<?php

require_once("../../../config.php");

_load_language_file("/website_code/php/management/templates.inc");

require("../user_library.php");
require("management_library.php");

if(is_user_admin()){

    $database_id = database_connect("templates list connected","template list failed");



    echo "<p style=\"margin:20px 0 0 5px;\">" . TEMPLATE_UPDATE_EXPLANATION . "<br /><br /><button type=\"button\" class=\"xerte_button\" onclick='javascript:template_sync()'>" . TEMPLATE_UPDATE . "</button></p>";

    echo "<p style=\"margin:20px 0 0 5px\">" . TEMPLATE_MANAGE . "</p>";
	
    $last_template_type = "";
    
    $query="select * from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails";
    $query_response = db_query($query);
    foreach($query_response as $row) {
    

		if($row['template_framework']!=$last_template_type){
		
			echo "<h2 style='margin-left:5px'>" . ucfirst($row['template_framework']) . "</h2>";
		
			$last_template_type = $row['template_framework'];
		
		}

        echo "<div class=\"template\" id=\"" . $row['template_name'] . "\" savevalue=\"" . $row['template_type_id'] . "\"><p>" . $row['template_name'] . " <button type=\"button\" class=\"xerte_button\" id=\"" . $row['template_name'] . "_btn\" onclick=\"javascript:templates_display('" . $row['template_name'] . "')\">" . TEMPLATE_VIEW . "</button></p></div><div class=\"template_details\" id=\"" . $row['template_name']  . "_child\">";
        echo "<p>" . TEMPLATE_TYPE . " " . $row['template_framework'] . "</p>";

        if($row['template_framework']=="xerte"){

            $template_check = file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $row['template_name'] . "/" . $row['template_name']  . ".rlt");

            $folder = explode('"',substr($template_check,strpos($template_check,"targetFolder"),strpos($template_check,"version")-strpos($template_check,"targetFolder")));

            $start_point = strpos($template_check,"version");

            $version = explode('"',substr($template_check,$start_point,strpos($template_check," ",$start_point)-$start_point));

            echo "<p>" . TEMPLATE_VERSION . " " . $version[1] . "</p>";

        }

        echo "<p>" . TEMPLATE_DESCRIPTION . " <form><textarea id=\"" . $row['template_type_id'] . "desc\">" . $row['description'] . "</textarea></form></p>";
        echo "<p>" . TEMPLATE_UPLOAD_DATE . " " . $row['date_uploaded'] . "</p>";
        echo "<p>" . TEMPLATE_NAME . "<form><textarea id=\"" . $row['template_type_id'] . "display\">" . $row['display_name'] . "</textarea></form></p>";
        echo "<p>" . TEMPLATE_EXAMPLE . "<form><textarea id=\"" . $row['template_type_id'] . "example\">" .$row['display_id'] . "</textarea></form></p>";
        echo "<p>" . TEMPLATE_ACCESS . "<form><textarea id=\"" . $row['template_type_id'] . "access\">" .$row['access_rights'] . "</textarea></form></p>";
        echo "<p>" . TEMPLATE_DATE_UPLOAD . " <form><textarea id=\"" . $row['template_type_id'] . "_date_uploaded\">" . $row['date_uploaded'] . "</textarea></form></p>";
        echo "<p>" . TEMPLATE_STATUS . " ";

        echo "<select ";

        if($row['active']=="0"){

            echo " SelectedItem=\"true\" name=\"type\" id=\"" . $row['template_type_id'] . "active\" ><option value=\"true\">" . TEMPLATE_ACTIVE . "</option><option value=\"false\" selected=\"selected\">" . TEMPLATE_INACTIVE . "</option></select></p>";

        }else{

            echo " SelectedItem=\"true\" name=\"type\" id=\"" . $row['template_type_id'] . "active\" ><option value=\"true\" selected=\"selected\">" . TEMPLATE_ACTIVE . "</option><option value=\"false\">" . TEMPLATE_INACTIVE . "</option></select></p>";

        }

        echo "<p>" . TEMPLATE_REPLACE . "<br><form method=\"post\" enctype=\"multipart/form-data\" id=\"importpopup\" name=\"importform\" target=\"upload_iframe\" action=\"website_code/php/import/import_template.php\" onsubmit=\"javascript:iframe_check_initialise();\"><input name=\"filenameuploaded\" type=\"file\" /><br /><input type=\"hidden\" name=\"replace\" value=\"" . $row['template_type_id'] . "\" /><input type=\"hidden\" name=\"folder\" value=\"" . $row['template_name'] . "\" /><input type=\"hidden\" name=\"version\" value=\"" . $version[1] . "\" /><br /><button type=\"submit\" class=\"xerte_button\" name=\"submitBtn\" onsubmit=\"javascript:iframe_check_initialise()\" >" . TEMPLATE_UPLOAD_BUTTON . "</button></form></p>";

        echo "</div>";		

    }

}else{

    management_fail();

}

?>
