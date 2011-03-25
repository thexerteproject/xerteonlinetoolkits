<?PHP     

require("../../../config.php");
require("../database_library.php");
require("../user_library.php");
require("../error_library.php");

if(is_user_admin()){

	$database_id = database_connect("templates list connected","template list failed");
	
	$query="select * from " . $xerte_toolkits_site->database_table_prefix . "sitedetails";

	$query_response = mysql_query($query);

	$row = mysql_fetch_array($query_response);

	echo "<div class=\"template\" id=\"sitedetails\"><p>Site settings (HTML / Images) <a href=\"javascript:templates_display('sitedetails')\">View</a></p></div><div class=\"template_details\" id=\"sitedetails_child\">";

		echo "<p>The site url is (This is the URL of the site - changing this will not change the URL)<form><textarea id=\"site_url\">" . $row['site_url'] . "</textarea></form></p>";

		echo "<p>The site title is (This is the HTML title tag content) <form><textarea id=\"site_title\">" . $row['site_title'] . "</textarea></form></p>";

		echo "<p>The site name is (This is part of index.php and the RSS and Syndication feeds)<form><textarea id=\"site_name\">" . $row['site_name'] . "</textarea></form></p>";

		echo "<p>The site logo is (The logo in the top left)<form><textarea id=\"site_logo\">" . $row['site_logo'] . "</textarea></form></p>";

		echo "<p>The organisational logo is (The logo in the top right)<form><textarea id=\"organisational_logo\">" . $row['organisational_logo'] . "</textarea></form></p>";

		echo "<p>The Welcome message is (The text above the tools on index.php)<form><textarea id=\"welcome_message\">" . $row['welcome_message'] . "</textarea></form></p>";

		echo "<p>The site text is (The text to the right of the tools on index.php)<form><textarea id=\"site_text\">" . $row['site_text'] . "</textarea></form></p>";

		echo "<p>The news text is (The second pod under the login pod on index.php)<form><textarea id=\"news_text\">" . base64_decode($row['news_text']) . "</textarea></form></p>";	

		echo "<p>The content of pod one is (The first pod underneath the file area on the logged in page)<form><textarea id=\"pod_one\">" . base64_decode($row['pod_one']) . "</textarea></form></p>";	

		echo "<p>The content of pod two is (The second pod underneath the file area on the logged in page)<form><textarea id=\"pod_two\">" . base64_decode($row['pod_two']) . "</textarea></form></p>";	

		echo "<p>The copyright message is <form><textarea id=\"copyright\">" . $row['copyright'] . "</textarea></form></p>";	

		echo "<p>The demonstration page URL is <form><textarea id=\"demonstration_page\">" . $row['demonstration_page'] . "</textarea></form></p>";	

		echo "<p>The form string is (The code to handle the HTML format for the login box)<form><textarea id=\"form_string\">" . base64_decode($row['form_string']) . "</textarea></form></p>";	

		echo "<p>The Peer form string is (The code to handle the HTML format for the peer review login box)<form><textarea id=\"peer_form_string\">" . base64_decode($row['peer_form_string']) . "</textarea></form></p>";	

		echo "<p>The site's feedback list is (A semi-colon separated list of email addresses to receive feedback from the feedback page)<form><textarea id=\"feedback_list\">" . $row['feedback_list'] . "</textarea></form></p>";

	echo "</div>";

	echo "<div class=\"template\" id=\"serverdetails\"><p>Server Settings <a href=\"javascript:templates_display('serverdetails')\">View</a></p></div><div class=\"template_details\" id=\"serverdetails_child\">";

		echo "<p>The HTACCESS setting is (Whether or not you are using a .htaccess file on the site)<form><textarea id=\"apache\">" . $row['apache'] . "</textarea></form>
</p>";	

		echo "<p>The PHP session name is <form><textarea id=\"site_session_name\">" . $row['site_session_name'] . "</textarea></form>
</p>";	

		echo "<p>The allowed upload types for the Media and quota page are <form><textarea id=\"mimetypes\">" . $row['mimetypes'] . "</textarea></form>
</p>";	
		echo "<p>The integration config path is  <form><textarea id=\"integration_config_path\">" . $row['integration_config_path'] . "</textarea></form>
</p>";	

		echo "<p>The admin username is <form><textarea id=\"admin_username\">" . $row['admin_username'] . "</textarea></form>
</p>";	

		echo "<p>The admin password is <form><textarea id=\"admin_password\">" . $row['admin_password'] . "</textarea></form>
</p>";	

	echo "</div>";

	echo "<div class=\"template\" id=\"rssdetails\"><p>RSS settings <a href=\"javascript:templates_display('rssdetails')\">View</a></p></div><div class=\"template_details\" id=\"rssdetails_child\">";

		echo "<p>The RSS Feed title is <form><textarea id=\"rss_title\">" . $row['rss_title'] . "</textarea></form></p>";	

		echo "<p>The institutional publisher as listed in the syndication feed is <form><textarea id=\"synd_publisher\">" . $row['synd_publisher'] . "</textarea></form></p>";

		echo "<p>The standard syndication rights for the syndicated content are <form><textarea id=\"synd_rights\">" . $row['synd_rights'] . "</textarea></form></p>";

		echo "<p>The standard syndication license for the syndicated content is <form><textarea id=\"synd_license\">" . $row['synd_license'] . "</textarea></form></p>";

	echo "</div>";

	echo "<div class=\"template\" id=\"pathdetails\"><p>Path settings <a href=\"javascript:templates_display('pathdetails')\">View</a></p></div><div class=\"template_details\" id=\"pathdetails_child\">";

		echo "<p>The module path is <form><textarea id=\"module_path\">" . $row['module_path'] . "</textarea></form></p>";	

		echo "<p>The website code path is <form><textarea id=\"website_code_path\">" . $row['website_code_path'] . "</textarea></form></p>";	

		echo "<p>The short file area path is <form><textarea id=\"users_file_area_short\">" . $row['users_file_area_short'] . "</textarea></form></p>";	

		echo "<p>The php library path is <form><textarea id=\"php_library_path\">" . $row['php_library_path'] . "</textarea></form></p>";	

		echo "<p>The root file path is <form><textarea id=\"root_file_path\">" . str_replace("\\","/",$row['root_file_path']) . "</textarea></form></p>";	

		echo "<p>The import path is <form><textarea id=\"import_path\">" . str_replace("\\","/",$row['import_path']) . "</textarea></form></p>";	

	echo "</div>";

	echo "<div class=\"template\" id=\"sqldetails\"><p>SQL query settings <a href=\"javascript:templates_display('sqldetails')\">View</a></p></div><div class=\"template_details\" id=\"sqldetails_child\">";

		echo "<p>The play edit preview query is <form><textarea rows=\"20\" id=\"play_edit_preview_query\">" . str_replace("$","\$",str_replace("\\","",base64_decode($row['play_edit_preview_query'])))  . "</textarea></form></p>";	

	echo "</div>";

	echo "<div class=\"template\" id=\"errordetails\"><p>Error handling settings <a href=\"javascript:templates_display('errordetails')\">View</a></p></div><div class=\"template_details\" id=\"errordetails_child\">";

		echo "<p>The email error list is (Accounts to receive email messages from the error logger)<form><textarea id=\"email_error_list\">" . $row['email_error_list'] . "</textarea></form></p>";	

		echo "<p>The error log message is (Set to true to log errors)<form><textarea id=\"error_log_message\">" . $row['error_log_message'] . "</textarea></form></p>";	

		echo "<p>The email error message is (Set to true to email errors)<form><textarea id=\"error_email_message\">" . $row['error_email_message'] . "</textarea></form></p>";	

		echo "<p>The maximum error size is (The maximum number of entries per error log)<form><textarea id=\"error_email_message\">" . $row['max_error_size'] . "</textarea></form></p>";

	echo "</div>";

	echo "<div class=\"template\" id=\"ldapdetails\"><p>LDAP settings <a href=\"javascript:templates_display('ldapdetails')\">View</a></p></div><div class=\"template_details\" id=\"ldapdetails_child\">";
	
		echo "<p>You can set up multiple hosts by separating entries in each of these fields with the $$$ string as a delimiter</p>";

		echo "<p>The ldap host is <form><textarea id=\"ldap_host\">" . $row['ldap_host'] . "</textarea></form></p>";

		echo "<p>The ldap port is <form><textarea id=\"ldap_port\">" . $row['ldap_port'] . "</textarea></form></p>";

		echo "<p>The ldap password is <form><textarea id=\"bind_pwd\">" . $row['bind_pwd'] . "</textarea></form></p>";

		echo "<p>The ldap base is <form><textarea id=\"base_dn\">" . $row['basedn'] . "</textarea></form></p>";

		echo "<p>The ldap bind is <form><textarea id=\"bind_dn\">" . $row['bind_dn'] . "</textarea></form></p>";

		echo "<p>The LDAP main filter is <form><textarea id=\"LDAP_preference\">" . $row['LDAP_preference'] . "</textarea></form>
</p>";	

		echo "<p>The LDAP second filter is <form><textarea id=\"LDAP_filter\">" . $row['LDAP_filter'] . "</textarea></form>
</p>";	

	echo "</div>";

	echo "<div class=\"template\" id=\"xertedetails\"><p>Xerte Settings <a href=\"javascript:templates_display('xertedetails')\">View</a></p></div><div class=\"template_details\" id=\"xertedetails_child\">";

		echo "<p>The flash save path is <form><textarea id=\"flash_save_path\">" . $row['flash_save_path'] . "</textarea></form></p>";

		echo "<p>The flash upload path is <form><textarea id=\"flash_upload_path\">" . $row['flash_upload_path'] . "</textarea></form></p>";

		echo "<p>The flash preview check path is <form><textarea id=\"flash_preview_check_path\">" . $row['flash_preview_check_path'] . "</textarea></form></p>";

		echo "<p>The flash flv skin is <form><textarea id=\"flash_flv_skin\">" . $row['flash_flv_skin'] . "</textarea></form></p>";

	echo "</div>";

	echo "<div class=\"template\" id=\"emaildetails\"><p>Email <a href=\"javascript:templates_display('emaildetails')\">View</a></p></div><div class=\"template_details\" id=\"emaildetails_child\">";

		echo "<p>The site email account is <form><textarea id=\"site_email_account\">" . $row['site_email_account'] . "</textarea></form></p>";

		echo "<p>The site email headers is (use the * symbol to represent a new line)<form><textarea id=\"headers\">" . $row['headers'] . "</textarea></form></p>";

		echo "<p>The site email to add to username is <form><textarea id=\"email_to_add_to_username\">" . $row['email_to_add_to_username'] . "</textarea></form></p>";

		echo "<p>The site's proxy host is <form><textarea id=\"proxy1\">" . $row['proxy1'] . "</textarea></form></p>";

		echo "<p>The site's proxy port is <form><textarea id=\"port1\">" . $row['port1'] . "</textarea></form></p>";

		echo "<p>By directly editing the rss proxy.php file (in the root folder), you can add up to 4 proxys and ports should you wish.</p>";
		
	echo "</div>";

}else{

	echo "the feature is for administrators only";

}

?>