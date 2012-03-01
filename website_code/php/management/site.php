<?php
require_once("../../../config.php");

_load_language_file("/website_code/php/management/site.inc");

require("../user_library.php");

if(is_user_admin()){

    $database_id = database_connect("templates list connected","template list failed");

    $query="select * from " . $xerte_toolkits_site->database_table_prefix . "sitedetails";

    $query_response = mysql_query($query);

    $row = mysql_fetch_array($query_response);

    echo "<div class=\"template\" id=\"sitedetails\"><p>" . MANAGEMENT_SITE_TITLE . "<a href=\"javascript:templates_display('sitedetails')\">" . MANAGEMENT_VIEW . "</a></p></div><div class=\"template_details\" id=\"sitedetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_URL . "<form><textarea id=\"site_url\">" . $row['site_url'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_TITLE_HTML . "<form><textarea id=\"site_title\">" . $row['site_title'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_NAME . "<form><textarea id=\"site_name\">" . $row['site_name'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_LOGO . "<form><textarea id=\"site_logo\">" . $row['site_logo'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_LOGO_ORG . "<form><textarea id=\"organisational_logo\">" . $row['organisational_logo'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_WELCOME . "<form><textarea id=\"welcome_message\">" . $row['welcome_message'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_TEXT . "<form><textarea id=\"site_text\">" . $row['site_text'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_NEWS . "<form><textarea id=\"news_text\">" . base64_decode($row['news_text']) . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_POD_ONE . "<form><textarea id=\"pod_one\">" . base64_decode($row['pod_one']) . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_POD_TWO . "<form><textarea id=\"pod_two\">" . base64_decode($row['pod_two']) . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_COPYRIGHT . "<form><textarea id=\"copyright\">" . $row['copyright'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_DEMONSTRATION . "<form><textarea id=\"demonstration_page\">" . $row['demonstration_page'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_LOGIN_FORM . "<form><textarea id=\"form_string\">" . base64_decode($row['form_string']) . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PEER_FORM . "<form><textarea id=\"peer_form_string\">" . base64_decode($row['peer_form_string']) . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_FEEDBACK . "<form><textarea id=\"feedback_list\">" . $row['feedback_list'] . "</textarea></form></p>";

    echo "</div>";

    echo "<div class=\"template\" id=\"serverdetails\"><p>" . MANAGEMENT_SITE_SERVER . "<a href=\"javascript:templates_display('serverdetails')\">" . MANAGEMENT_VIEW . "</a></p></div><div class=\"template_details\" id=\"serverdetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_HTACCESS . "<form><textarea id=\"apache\">" . $row['apache'] . "</textarea></form>
        </p>";	

    echo "<p>" . MANAGEMENT_SITE_SESSION_NAME . "<form><textarea id=\"site_session_name\">" . $row['site_session_name'] . "</textarea></form>
        </p>";	

    echo "<p>" . MANAGEMENT_SITE_MIME . "<form><textarea id=\"mimetypes\">" . $row['mimetypes'] . "</textarea></form>
        </p>";	
    echo "<p>" . MANAGEMENT_SITE_INTEGRATION . "<form><textarea id=\"integration_config_path\">" . $row['integration_config_path'] . "</textarea></form>
        </p>";	

    echo "<p>" . MANAGEMENT_SITE_ADMIN_USER . "<form><textarea id=\"admin_username\">" . $row['admin_username'] . "</textarea></form>
        </p>";	

    echo "<p>" . MANAGEMENT_SITE_ADMIN_PASSWORD . "<form><textarea id=\"admin_password\">" . $row['admin_password'] . "</textarea></form>
        </p>";	

    echo "</div>";

    echo "<div class=\"template\" id=\"rssdetails\"><p>" . MANAGEMENT_SITE_RSS . "<a href=\"javascript:templates_display('rssdetails')\">" . MANAGEMENT_VIEW . "</a></p></div><div class=\"template_details\" id=\"rssdetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_RSS_TITLE . "<form><textarea id=\"rss_title\">" . $row['rss_title'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_RSS_PUBLISHER . "<form><textarea id=\"synd_publisher\">" . $row['synd_publisher'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_RSS_RIGHTS . "<form><textarea id=\"synd_rights\">" . $row['synd_rights'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_RSS_LICENCE . "<form><textarea id=\"synd_license\">" . $row['synd_license'] . "</textarea></form></p>";

    echo "</div>";

    echo "<div class=\"template\" id=\"pathdetails\"><p>" . MANAGEMENT_SITE_PATH . "<a href=\"javascript:templates_display('pathdetails')\">" . MANAGEMENT_VIEW . "</a></p></div><div class=\"template_details\" id=\"pathdetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_PATH_MODULE . "<form><textarea id=\"module_path\">" . $row['module_path'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PATH_MODULE . "<form><textarea id=\"website_code_path\">" . $row['website_code_path'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PATH_SHORT . "<form><textarea id=\"users_file_area_short\">" . $row['users_file_area_short'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PATH_LIBRARY . "<form><textarea id=\"php_library_path\">" . $row['php_library_path'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PATH_ROOT . "<form><textarea id=\"root_file_path\">" . str_replace("\\","/",$row['root_file_path']) . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PATH_IMPORT . "<form><textarea id=\"import_path\">" . str_replace("\\","/",$row['import_path']) . "</textarea></form></p>";	

    echo "</div>";

    echo "<div class=\"template\" id=\"sqldetails\"><p>" . MANAGEMENT_SITE_SQL . "<a href=\"javascript:templates_display('sqldetails')\">" . MANAGEMENT_VIEW . "</a></p></div><div class=\"template_details\" id=\"sqldetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_QUERY . "<form><textarea rows=\"20\" id=\"play_edit_preview_query\">" . str_replace("$","\$",str_replace("\\","",base64_decode($row['play_edit_preview_query'])))  . "</textarea></form></p>";	

    echo "</div>";

    echo "<div class=\"template\" id=\"errordetails\"><p>" . MANAGEMENT_SITE_ERROR_HANDLING . "<a href=\"javascript:templates_display('errordetails')\">" . MANAGEMENT_VIEW . "</a></p></div><div class=\"template_details\" id=\"errordetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_ERROR_EMAIL . "<form><textarea id=\"email_error_list\">" . $row['email_error_list'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_ERROR_EMAIL_ACCOUNT . "<form><textarea id=\"error_log_message\">" . $row['error_log_message'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_ERROR_EMAIL . "<form><textarea id=\"error_email_message\">" . $row['error_email_message'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_ERROR_MAX . "<form><textarea id=\"error_email_message\">" . $row['max_error_size'] . "</textarea></form></p>";

    echo "</div>";

    echo "<div class=\"template\" id=\"ldapdetails\"><p>" . MANAGEMENT_SITE_LDAP . "<a href=\"javascript:templates_display('ldapdetails')\">" . MANAGEMENT_VIEW . "</a></p></div><div class=\"template_details\" id=\"ldapdetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_LDAP_DELIMIT . "</p>";

    echo "<p>" . MANAGEMENT_SITE_LDAP_HOST . "<form><textarea id=\"ldap_host\">" . $row['ldap_host'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_LDAP_PORT . "<form><textarea id=\"ldap_port\">" . $row['ldap_port'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_LDAP_PASSWORD . "<form><textarea id=\"bind_pwd\">" . $row['bind_pwd'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_LDAP_BASE . "<form><textarea id=\"base_dn\">" . $row['basedn'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_LDAP_BIND . "<form><textarea id=\"bind_dn\">" . $row['bind_dn'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_LDAP_FILTER_ONE . "<form><textarea id=\"LDAP_preference\">" . $row['LDAP_preference'] . "</textarea></form>
        </p>";	

    echo "<p>" . MANAGEMENT_SITE_LDAP_FILTER_TWO . "<form><textarea id=\"LDAP_filter\">" . $row['LDAP_filter'] . "</textarea></form>
        </p>";	

    echo "</div>";

    echo "<div class=\"template\" id=\"xertedetails\"><p>" . MANAGEMENT_SITE_XERTE . " <a href=\"javascript:templates_display('xertedetails')\">" . MANAGEMENT_VIEW . "</a></p></div><div class=\"template_details\" id=\"xertedetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_XERTE_SAVE . "<form><textarea id=\"flash_save_path\">" . $row['flash_save_path'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_XERTE_UPLOAD . "<form><textarea id=\"flash_upload_path\">" . $row['flash_upload_path'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_XERTE_PREVIEW . "<form><textarea id=\"flash_preview_check_path\">" . $row['flash_preview_check_path'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_XERTE_SKIN . "<form><textarea id=\"flash_flv_skin\">" . $row['flash_flv_skin'] . "</textarea></form></p>";

    echo "</div>";

    echo "<div class=\"template\" id=\"emaildetails\"><p>" . MANAGEMENT_SITE_EMAIL . " <a href=\"javascript:templates_display('emaildetails')\">" . MANAGEMENT_VIEW . "</a></p></div><div class=\"template_details\" id=\"emaildetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_EMAIL_ACCOUNT . "<form><textarea id=\"site_email_account\">" . $row['site_email_account'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_EMAIL_HEADERS . "<form><textarea id=\"headers\">" . $row['headers'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_EMAIL_SUFFIX . "<form><textarea id=\"email_to_add_to_username\">" . $row['email_to_add_to_username'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_PROXY . "<form><textarea id=\"proxy1\">" . $row['proxy1'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_PROXY_PORT . "<form><textarea id=\"port1\">" . $row['port1'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_PROXY_EXPLAINED . "</p>";

    echo "</div>";

}else{

    echo "the feature is for administrators only";

}

?>
