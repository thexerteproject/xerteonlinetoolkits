<?PHP

	_load_language_file("/website_code/php/management/management_library.inc");
	require_once("../language_library.php");
	function category_list(){
	
		global $xerte_toolkits_site;
	
		$query="select * from " . $xerte_toolkits_site->database_table_prefix . "syndicationcategories order by category_name ASC";
	
		echo "<p>" . MANAGEMENT_LIBRARY_ADD_CATEGORY . "</p>";

		echo "<p>" . MANAGEMENT_LIBRARY_NEW_CATEGORY . "<form><textarea cols=\"100\" rows=\"2\" id=\"newcategory\">" . MANAGEMENT_LIBRARY_NEW_CATEGORY_NAME . "</textarea></form></p>";
 	    echo "<p><form action=\"javascript:new_category();\"><button class=\"xerte_button\" type=\"submit\">" . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";

		echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_CATEGORIES . "</p>";

		$query_response = mysql_query($query);

		while($row = mysql_fetch_array($query_response)){

			echo "<p>" . $row['category_name'] . " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_category('" . $row['category_id'] .  "')\">" . MANAGEMENT_LIBRARY_REMOVE . " </button></p>";

		}
	
	}
	
	function syndication_list(){
	
		global $xerte_toolkits_site;
	
		$database_id = database_connect("templates list connected","template list failed");

		$query="select * from " . $xerte_toolkits_site->database_table_prefix . "templatesyndication," . $xerte_toolkits_site->database_table_prefix . "templatedetails where " . $xerte_toolkits_site->database_table_prefix . "templatesyndication.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and( rss=\"true\" or export=\"true\" or syndication=\"true\")";

		$query_response = mysql_query($query);

		while($row = mysql_fetch_array($query_response)){

			echo "<p>" . $row['template_name'];

			if($row['rss']=="true"){

				echo " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_feed('" . $row['template_id'] .  "','RSS')\">" . MANAGEMENT_LIBRARY_REMOVE_RSS . "</button> ";

			}

			if($row['export']=="true"){

				echo " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_feed('" . $row['template_id'] .  "', 'EXPORT')\">" . MANAGEMENT_LIBRARY_REMOVE_EXPORT . "</button> ";

			}

			if($row['syndication']=="true"){

				echo " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_feed('" . $row['template_id'] .  "','SYND')\">" . MANAGEMENT_LIBRARY_REMOVE_SYNDICATION . "</button> ";

			}

		}
	
	}
	
	function security_list(){
	
		global $xerte_toolkits_site;
	
		$query_for_play_security = "select * from " . $xerte_toolkits_site->database_table_prefix . "play_security_details";

		$query_for_play_security_response = mysql_query($query_for_play_security);

		echo "<p>" . MANAGEMENT_LIBRARY_ADD_SECURITY . "</p>";

		echo "<p>" . MANAGEMENT_LIBRARY_NEW_SECURITY  . "<form><textarea cols=\"100\" rows=\"2\" id=\"newsecurity\">" . MANAGEMENT_LIBRARY_NEW_SECURITY_NAME . "</textarea></form></p>";
		echo "<p>" . MANAGEMENT_LIBRARY_NEW_SECURITY_DATA . "<form><textarea cols=\"100\" rows=\"2\" id=\"newdata\">" . MANAGEMENT_LIBRARY_NEW_SECURITY_DETAILS . "</textarea></form></p>";
		echo "<p>" . MANAGEMENT_LIBRARY_NEW_SECURITY_INFO . "<form><textarea cols=\"100\" rows=\"2\" id=\"newdesc\">" . MANAGEMENT_LIBRARY_NEW_SECURITY_DESCRIPTION . "</textarea></form></p>"; 
		echo "<p><form action=\"javascript:new_security();\"><button type=\"submit\" class=\"xerte_button\">" . MANAGEMENT_LIBRARY_ADD_SECURITY . " </button></form></p>";

		echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY . "</p>";

		while($row_security = mysql_fetch_array($query_for_play_security_response)){
		
			echo "<div class=\"template\" id=\"play" . $row_security['security_id'] . "\" savevalue=\"" . $row_security['security_id'] .  "\"><p>" . $row_security['security_setting'] . " <button type=\"button\" class=\"xerte_button\" id=\"play" . $row_security['security_id'] . "_btn\" onclick=\"javascript:templates_display('play" . $row_security['security_id'] . "')\">" . MANAGEMENT_LIBRARY_VIEW . "</button></p></div><div class=\"template_details\" id=\"play" . $row_security['security_id']  . "_child\">";
		
			echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY_IS . "<form><textarea id=\"" . $row_security['security_id'] . "security\">" . $row_security['security_setting']  . "</textarea></form></p>";
			echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY_DATA . "<form><textarea id=\"" . $row_security['security_id'] .  "data\">" .  $row_security['security_data']  . "</textarea></form></p>";
			echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY_INFO . "<form><textarea id=\"" . $row_security['security_id'] .  "info\">" .  $row_security['security_info']  . "</textarea></form></p>"; 
		
			echo "<p><button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_security()\">" . MANAGEMENT_LIBRARY_EXISTING_SECURITY_REMOVE . "</button>. " . MANAGEMENT_LIBRARY_EXISTING_SECURITY_WARNING . "</p></div>";

		}
	
	}



	function licence_list(){
	
		global $xerte_toolkits_site;
	
		$database_id = database_connect("licence list connected","licence list failed");
	
		echo "<p>" . MANAGEMENT_LIBRARY_NEW_LICENCE . "</p>";

		echo "<p>" . MANAGEMENT_LIBRARY_NEW_LICENCE_DETAILS . "<form><textarea cols=\"100\" rows=\"2\" id=\"newlicense\">" . MANAGEMENT_LIBRARY_NEW_LICENCE_NAME . "</textarea></form></p>";
		echo "<p><form action=\"javascript:new_license();\"><button type=\"submit\" class=\"xerte_button\" >" . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";

		echo "<p>" . MANAGEMENT_LIBRARY_MANAGE_LICENCES . "</p>";

		$query="select * from " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses";

		$query_response = mysql_query($query);

		while($row = mysql_fetch_array($query_response)){

			echo "<p>" . $row['license_name'] . " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_licenses('" . $row['license_id'] .  "')\">" . MANAGEMENT_LIBRARY_REMOVE . " </button></p>";

		}
	
	}

	function management_fail(){
	
		echo MANAGEMENT_LIBRARY_FAIL;
	
	}

    function language_details($changed){

        global $xerte_toolkits_site;


        echo "<p>" . MANAGEMENT_LIBRARY_LANGUAGES_EXPLAINED . "</p>";
        echo "<p>" . MANAGEMENT_LIBRARY_ADD_LANGUAGE . "</p>";
        echo "<p><br><form method=\"post\" enctype=\"multipart/form-data\" id=\"languagepopup\" name=\"languageform\" target=\"upload_iframe\" action=\"website_code/php/language/import_language.php\" onsubmit=\"javascript:iframe_upload_language_check_initialise();\"><input name=\"filenameuploaded\" type=\"file\" /><br /><br/><button type=\"submit\" class=\"xerte_button\" name=\"submitBtn\" onsubmit=\"javascript:iframe_language_check_initialise()\" >" . MANAGEMENT_LIBRARY_LANGUAGE_INSTALL . "</button></form></p>";
        echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_LANGUAGES . "</p>";
        $langs = getLanguages();
        $codes = array_keys($langs);
        echo "<ul>";
        foreach($codes as $code)
        {
            echo "<li>" . $langs[$code];
            if ($code != "en-GB")
            {
                echo " <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_language('" . $code .  "')\">" . MANAGEMENT_LIBRARY_REMOVE . " </button></li>";
            }
            else{
                echo "</li>";
            }
        }
        echo "</ul>";
        if ($changed)
        {
            echo "<p>". MANAGEMENT_LIBRARY_LANGUAGES_UPDATED . "</p>";
        }

    }
?>