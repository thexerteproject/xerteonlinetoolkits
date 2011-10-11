<?PHP

	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/management/management_library.inc";
	
	function category_list(){
	
		$query="select * from " . $xerte_toolkits_site->database_table_prefix . "syndicationcategories order by category_name ASC";
	
		echo "<p>" . MANAGEMENT_LIBRARY_ADD_CATEGORY . "</p>";

		echo "<p>" . MANAGEMENT_LIBRARY_NEW_CATEGORY . "<form><textarea cols=\"100\" rows=\"2\" id=\"newcategory\">" . MANAGEMENT_LIBRARY_NEW_CATEGORY_NAME . "</textarea></form></p>";
 	    echo "<p><form action=\"javascript:new_category();\"><input type=\"submit\" label=\"" . MANAGEMENT_LIBRARY_ADD . "\" /></form></p>"; 

		echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_CATEGORIES . "</p>";

		$query_response = mysql_query($query);

		while($row = mysql_fetch_array($query_response)){

			echo "<p>" . $row['category_name'] . " - <a href=\"javascript:remove_category('" . $row['category_id'] .  "')\">" . MANAGEMENT_LIBRARY_REMOVE . " </a></p>";

		}
	
	}
	
	function syndication_list(){
	
		$database_id = database_connect("templates list connected","template list failed");

		$query="select * from " . $xerte_toolkits_site->database_table_prefix . "templatesyndication," . $xerte_toolkits_site->database_table_prefix . "templatedetails where " . $xerte_toolkits_site->database_table_prefix . "templatesyndication.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and( rss=\"true\" or export=\"true\" or syndication=\"true\")";

		$query_response = mysql_query($query);

		while($row = mysql_fetch_array($query_response)){

			echo "<p>" . $row['template_name'];

			if($row['rss']=="true"){

				echo " - <a href=\"javascript:remove_feed('" . $row['template_id'] .  "','RSS')\">" . MANAGEMENT_LIBRARY_REMOVE_RSS . "</a> ";

			}

			if($row['export']=="true"){

				echo " - <a href=\"javascript:remove_feed('" . $row['template_id'] .  "', 'EXPORT')\">" . MANAGEMENT_LIBRARY_REMOVE_EXPORT . "</a> ";

			}

			if($row['syndication']=="true"){

				echo " - <a href=\"javascript:remove_feed('" . $row['template_id'] .  "','SYND')\">" . MANAGEMENT_LIBRARY_REMOVE_SYNDICATION . "</a> ";

			}

		}
	
	}
	
	function security_list(){
	
		$query_for_play_security = "select * from " . $xerte_toolkits_site->database_table_prefix . "play_security_details";

		$query_for_play_security_response = mysql_query($query_for_play_security);

		echo "<p>" . MANAGEMENT_LIBRARY_ADD_SECURITY . "</p>";

		echo "<p>" . MANAGEMENT_LIBRARY_NEW_SECURITY  . "<form><textarea cols=\"100\" rows=\"2\" id=\"newsecurity\">" . MANAGEMENT_LIBRARY_NEW_SECURITY_NAME . "</textarea></form></p>";
		echo "<p>" . MANAGEMENT_LIBRARY_NEW_SECURITY_DATA . "<form><textarea cols=\"100\" rows=\"2\" id=\"newdata\">" . MANAGEMENT_LIBRARY_NEW_SECURITY_DETAILS . "</textarea></form></p>";
		echo "<p>" . MANAGEMENT_LIBRARY_NEW_SECURITY_INFO . "<form><textarea cols=\"100\" rows=\"2\" id=\"newdesc\">" . MANAGEMENT_LIBRARY_NEW_SECURITY_DESCRIPTION . "</textarea></form></p>"; 
		echo "<p><form action=\"javascript:new_security();\"><input type=\"submit\" label=\"" . MANAGEMENT_LIBRARY_ADD . "\" /></form></p>"; 

		echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY . "</p>";

		while($row_security = mysql_fetch_array($query_for_play_security_response)){
		
			echo "<div class=\"template\" id=\"play" . $row_security['security_id'] . "\" savevalue=\"" . $row_security['security_id'] .  "\"><p>" . $row_security['security_setting'] . " <a href=\"javascript:templates_display('play" . $row_security['security_id'] . "')\">" . MANAGEMENT_LIBRARY_VIEW . "</a></p></div><div class=\"template_details\" id=\"play" . $row_security['security_id']  . "_child\">";
		
			echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY_IS . "<form><textarea id=\"" . $row_security['security_id'] . "security\">" . $row_security['security_setting']  . "</textarea></form></p>";
			echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY_DATA . "<form><textarea id=\"" . $row_security['security_id'] .  "data\">" .  $row_security['security_data']  . "</textarea></form></p>";
			echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY_INFO . "<form><textarea id=\"" . $row_security['security_id'] .  "info\">" .  $row_security['security_info']  . "</textarea></form></p>"; 
		
			echo "<p><a href=\"javascript:remove_security()\">" . MANAGEMENT_LIBRARY_EXISTING_SECURITY_REMOVE . "</a>. " . MANAGEMENT_LIBRARY_EXISTING_SECURITY_WARNING . "</p></div>";

		}
	
	}
	
	function licence_list(){
	
		$database_id = database_connect("licence list connected","licence list failed");
	
		echo "<p>" . MANAGEMENT_LIBRARY_NEW_LICENCE . "</p>";

		echo "<p>" . MANAGEMENT_LIBRARY_NEW_LICENCE_DETAILS . "<form><textarea cols=\"100\" rows=\"2\" id=\"newlicense\">" . MANAGEMENT_LIBRARY_NEW_LICENCE_NAME . "</textarea></form></p>";
		echo "<p><form action=\"javascript:new_license();\"><input type=\"submit\" label=\"" . MANAGEMENT_LIBRARY_ADD . "\" /></form></p>"; 

		echo "<p>" . MANAGEMENT_LIBRARY_MANAGE_LICENCES . "</p>";

		$query="select * from " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses";

		$query_response = mysql_query($query);

		while($row = mysql_fetch_array($query_response)){

			echo "<p>" . $row['license_name'] . " - <a href=\"javascript:remove_licenses('" . $row['license_id'] .  "')\">" . MANAGEMENT_LIBRARY_REMOVE . " </a></p>";

		}
	
	}

	function management_fail(){
	
		echo MANAGEMENT_LIBRARY_FAIL;
	
	}

?>