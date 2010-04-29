<?PHP require("../../../config.php");
require("../../../session.php");

require("../database_library.php");
require("../user_library.php");

if(is_user_admin()){

	$database_id = database_connect("templates list connected","template list failed");

	$copyright = str_replace("AAA","&copy;",$_POST['copyright']);

	$query="update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set site_url=\"" .  $_POST['site_url'] . "\",site_title=\"" .  $_POST['site_title'] . "\",site_name=\"" .  $_POST['site_name'] . "\",site_logo=\"" .  $_POST['site_logo'] . "\",organisational_logo=\"" .  $_POST['organisational_logo'] . "\",welcome_message=\"" .  $_POST['welcome_message'] . "\",site_text=\"" .  $_POST['site_text'] . "\",news_text=\"" .  base64_encode(stripcslashes($_POST['news_text'])) . "\",pod_one=\"" .  base64_encode(stripcslashes($_POST['pod_one'])) . "\",pod_two=\"" .  base64_encode(stripcslashes($_POST['pod_two'])) . "\",copyright=\"" .  $copyright . "\",demonstration_page=\"" .  $_POST['demonstration_page'] . "\",form_string=\"" .  base64_encode(stripcslashes($_POST['form_string'])) . "\",peer_form_string=\"" .  base64_encode(stripcslashes($_POST['peer_form_string'])) . "\",feedback_list=\"" .  $_POST['feedback_list'] . "\",rss_title=\"" .  $_POST['rss_title'] . "\",module_path=\"" .  $_POST['module_path'] . "\",website_code_path=\"" .  $_POST['website_code_path'] . "\",users_file_area_short=\"" .  $_POST['users_file_area_short'] . "\",php_library_path=\"" .  $_POST['php_library_path'] . "\",root_file_path=\"" .  $_POST['root_file_path'] . "\",play_edit_preview_query=\"" .  base64_encode(stripcslashes($_POST['play_edit_preview_query'])) . "\",email_error_list=\"" .  $_POST['email_error_list'] . "\",error_log_message=\"" .  $_POST['error_log_message'] . "\",error_email_message=\"" .  $_POST['error_email_message'] . "\",ldap_host=\"" .  $_POST['ldap_host']	. "\",ldap_port=\"" .  $_POST['ldap_port'] . "\",bind_pwd=\"" .  $_POST['bind_pwd'] . "\",basedn=\"" .  $_POST['base_dn'] . "\",bind_dn=\"" .  $_POST['bind_dn'] . "\",flash_save_path=\"" .  $_POST['flash_save_path'] . "\",flash_upload_path=\"" .  $_POST['flash_upload_path'] . "\",flash_preview_check_path=\"" .  $_POST['flash_preview_check_path'] . "\",flash_flv_skin=\"" .  $_POST['flash_flv_skin'] . "\",site_email_account=\"" .  $_POST['site_email_account'] . "\",headers=\"" .  $_POST['headers'] . "\",email_to_add_to_username=\"" .  $_POST['email_to_add_to_username'] . "\",proxy1=\"" .  $_POST['proxy1'] . "\",port1=\"" .  $_POST['port1'] . "\",site_session_name=\"" .  $_POST['site_session_name'] . "\",synd_publisher=\"" .  $_POST['synd_publisher'] . "\",synd_rights=\"" .  $_POST['synd_rights'] . "\",synd_license=\"" .  $_POST['synd_license'] . "\",import_path=\"" .  $_POST['import_path'] . "\",apache=\"" .  $_POST['apache'] . "\",mimetypes=\"" .  $_POST['mimetypes'] . "\",LDAP_preference=\"" .  $_POST['LDAP_preference'] . "\",LDAP_filter=\"" .  $_POST['LDAP_filter'] . "\",integration_config_path=\"" .  $_POST['integration_config_path'] . "\",admin_username=\"" .  $_POST['admin_username'] . "\",admin_password=\"" .  $_POST['admin_password'] . "\"";

	if(mysql_query($query)){

		echo "Template changes made";

	}else{

		echo "Template changes failed";

	}
			
}

?>