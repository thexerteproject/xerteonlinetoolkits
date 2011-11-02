<?PHP 
require_once(dirname(__FILE__) . '/../config.php');

include ("../database.php");

$mysql_connect_id = mysql_connect($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password);

echo file_get_contents("page_top");

$magic_quotes = true;

if(get_magic_quotes_gpc()===0){

    echo "magic quotes setting is false";

    $magic_quotes = false;

}

mysql_select_db($xerte_toolkits_site->database_name);

$query = "insert  into " . $xerte_toolkits_site->database_table_prefix . "sitedetails(site_id) VALUES ( \"1\")";

$query_response = mysql_query($query);

$fail_string = "";

$success_string = "";

if(!$query_response){

    $fail_string .= "The sitedetails site ID query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails site ID query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set site_url=\"http://" . $_POST['site_url'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails site url query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails site url query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set apache=\"" . $_POST['apache'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails apache query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails apache query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set apache=\"" . $_POST['apache'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails apache query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails apache query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set mimetypes=\"" . $_POST['mimetypes'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails mimetypes query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails mimetypes query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set LDAP_preference=\"" . $_POST['LDAP_preference'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails LDAP preference query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails LDAP preference query succeeded <br>";

}

$query = "insert into " . $xerte_toolkits_site->database_table_prefix . "ldap(ldap_filter)values('" . $_POST['LDAP_filter'] . "')";

$query_response = mysql_query($query);

$ldap = mysql_insert_id();

if(!$query_response){

    $fail_string .= "The sitedetails LDAP preference query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails LDAP preference query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set LDAP_filter=\"" . $_POST['LDAP_filter'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

$query = "update " . $xerte_toolkits_site->database_table_prefix . "ldap set ldap_filter_attr=\"" . $_POST['LDAP_preference'] . "\" where ldap_id=\"" . $ldap . "\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails LDAP_filter query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails LDAP_filter query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set integration_config_path=\"" . $_POST['integration_config_path'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails integration_config_path query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails integration_config_path query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set admin_username=\"" . $_POST['admin_username']  . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails admin_username query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails admin_username query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set admin_password=\"" . $_POST['admin_password']  . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails admin_password query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails admin_password query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set site_session_name=\"" . $_POST['site_session_name']  . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails site_session_name query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails site_session_name query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set site_title=\"" . $_POST['site_title']  . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails site_title query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails site_title query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set site_name=\"" . $_POST['site_name']  . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails site_name query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails site_name query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set site_logo=\"" . $_POST['site_logo']  . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails site_logo query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails site_logo query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set organisational_logo=\"" . $_POST['organisational_logo']  . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails organisational_logo query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails organisational_logo query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set welcome_message=\"" . $_POST['welcome_message']  . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails welcome_message query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails welcome_message query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set site_text=\"" . $_POST['site_text']  . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails site_text query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails site_text query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set news_text=\"" . base64_encode(stripcslashes($_POST['news_text'])) . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails news_text query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails news_text query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set pod_one=\"" . base64_encode(stripcslashes($_POST['pod_one'])) . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails pod_one query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails pod_one query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set pod_two=\"" . base64_encode(stripcslashes($_POST['pod_two'])) . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails pod_two query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails pod_two query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set copyright=\"" . $_POST['copyright'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails copyright query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails copyright query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set rss_title=\"" . $_POST['rss_title'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails rss_title query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails rss_title query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set synd_publisher=\"" . $_POST['synd_publisher'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails synd_publisher query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails synd_publisher query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set synd_rights=\"" . $_POST['synd_rights'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails synd_rights query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails synd_rights query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set synd_license=\"" . $_POST['synd_license'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails synd_license query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails synd_license query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set demonstration_page=\"" . $_POST['demonstration_page'] . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails demonstration_page query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails demonstration_page query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set form_string=\"" . base64_encode(stripcslashes($_POST['form_string'])) . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails form_string query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails form_string query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set peer_form_string=\"" . base64_encode(stripcslashes($_POST['peer_form_string'])) . "\" where site_id=\"1\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails peer_form_string query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails peer_form_string query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set module_path=\"" . $_POST['module_path'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails module_path query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails module_path query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set website_code_path=\"" . $_POST['website_code_path'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails website_code_path query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails website_code_path query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set users_file_area_short=\"" . $_POST['users_file_area_short'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails users_file_area_short query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails users_file_area_short query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set php_library_path=\"" . $_POST['php_library_path'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails php_library_path query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails php_library_path query succeeded <br>";

}

if(!$magic_quotes){

    $import_path = addslashes($_POST['import_path']);

}else{

    $import_path = $_POST['import_path'];

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set import_path=\"" . str_replace("\\\\","/",$import_path) . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails import_path query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails import_path query succeeded <br>";

}

if(!$magic_quotes){

    $root_path = addslashes($_POST['root_file_path']);

}else{


    $root_path = $_POST['root_file_path'];

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set root_file_path='" . str_replace("\\\\","/",$root_path) . "' where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails root_file_path query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails root_file_path query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set play_edit_preview_query=\"" . base64_encode(stripcslashes($_POST['play_edit_preview_query'])) . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails play_edit_preview_query query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails play_edit_preview_queryquery succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set error_log_path=\"" . $_POST['error_log_path'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails error_log_path query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails error_log_path query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set email_error_list=\"" . $_POST['email_error_list'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails email_error_list query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails email_error_list query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set error_log_message=\"" . $_POST['error_log_message'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails error_log_message query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails error_log_message query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set max_error_size=\"" . $_POST['max_error_size'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails max_error_size query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails max_error_size query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set error_email_message=\"" . $_POST['error_email_message'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails error_email_message query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails error_email_message query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set ldap_host=\"" . $_POST['ldap_host'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

$query = "update " . $xerte_toolkits_site->database_table_prefix . "ldap set ldap_host=\"" . $_POST['ldap_host'] . "\" where ldap_id=\"" . $ldap . "\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails ldap_host query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails ldap_host query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set ldap_port=\"" . $_POST['ldap_port'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

$query = "update " . $xerte_toolkits_site->database_table_prefix . "ldap set ldap_port=\"" . $_POST['ldap_port'] . "\" where ldap_id=\"" . $ldap . "\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails ldap_port query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails ldap_port query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set bind_pwd=\"" . $_POST['bind_pwd'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

$query = "update " . $xerte_toolkits_site->database_table_prefix . "ldap set ldap_password=\"" . $_POST['bind_pwd'] . "\" where ldap_id=\"" . $ldap . "\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails bind_pwd query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails bind_pwd query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set basedn=\"" . $_POST['basedn'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

$query = "update " . $xerte_toolkits_site->database_table_prefix . "ldap set ldap_basedn=\"" . $_POST['basedn'] . "\" where ldap_id=\"" . $ldap . "\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails basedn query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails basedn query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set bind_dn=\"" . $_POST['bind_dn'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

$query = "update " . $xerte_toolkits_site->database_table_prefix . "ldap set ldap_username=\"" . $_POST['bind_dn'] . "\" where ldap_id=\"" . $ldap . "\"";

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails bind_dn query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails bind_dn query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set flash_save_path=\"" . $_POST['flash_save_path'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails flash_save_path query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails flash_save_path query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set flash_upload_path=\"" . $_POST['flash_upload_path'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails flash_upload_path query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails flash_upload_path query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set flash_preview_check_path=\"" . $_POST['flash_preview_check_path'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails flash_preview_check_path query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails flash_preview_check_path query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set flash_flv_skin=\"" . $_POST['flash_flv_skin'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails flash_flv_skin query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails flash_flv_skin query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set site_email_account=\"" . $_POST['site_email_account'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails site_email_account query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails site_email_account query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set headers=\"" . $_POST['headers'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails headers query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails headers query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set email_to_add_to_username=\"" . $_POST['email_to_add_to_username'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails email_to_add_to_username query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails email_to_add_to_username query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set proxy1=\"" . $_POST['proxy1'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails proxy1 query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails proxy1 query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set port1=\"" . $_POST['port1'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails port1 query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails port1 query succeeded <br>";

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set feedback_list=\"" . $_POST['feedback_list'] . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){

    $fail_string .= "The sitedetails feedback_list query " . $query . " has failed due to " . mysql_error() . "<br>";

}else{

    $success_string .= "The sitedetails feedback_list query succeeded <br>";

}

if($_POST['apache']=="true"){

    $replace = substr($_SERVER['PHP_SELF'],0,strpos($_SERVER['PHP_SELF'],"/",1));

    $buffer = file_get_contents("htaccess.conf");

    $buffer = str_replace("*",$replace,$buffer);

    $file_handle = fopen(".htaccess",'w');
    fwrite($file_handle,$buffer,strlen($buffer));
    fclose($file_handle);

    chmod(".htaccess",0777);

    rename(".htaccess","../.htaccess");	

    chmod("../.htaccess",0777);

}

?>

<h2 style="margin-top:15px">
    Install complete
</h2>
<?PHP

if($fail_string!=""){

    echo "<p><b?The following queries failed</b> - <br /> " . $fail_string . "</p>";
    echo "<p>These failures may affect your site, please see if they can be rectified using the management tools or altering the database directly.</p>";

}

if($success_string!=""){

    echo "<p>The following queries suceeded - <br /> " . $success_string . "</p>";

}

?>
<p>
    Your site URL is  <a href="http://<?PHP echo $_SERVER['HTTP_HOST'] . substr($_SERVER['PHP_SELF'],0,strlen($_SERVER['PHP_SELF'])-15); ?>"><?PHP echo $_SERVER['HTTP_HOST'] . substr($_SERVER['PHP_SELF'],0,strlen($_SERVER['PHP_SELF'])-15); ?></a> 

</p>
<p>
    If you have installed this on a public facing server, please look to remove the php file you are not planning to use. Index, demo, integration, webctlink and management.php all can access the site in some way. You should rename the files you do not plan to use.
</p>
<p>
            Please see the Xerte site at <a href="http://www.nottingham.ac.uk/xerte" target="new">http://www.nottingham.ac.uk/xerte</a> and please consider joining the mailing list.
        </p>

</body>
</html>
