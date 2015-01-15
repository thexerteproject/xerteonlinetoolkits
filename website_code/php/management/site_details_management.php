<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
require_once("../../../config.php");

_load_language_file("/website_code/php/management/site_details_management.inc");

require("../user_library.php");

if(is_user_admin()){

    $database_id = database_connect("templates list connected","template list failed");

    $copyright = str_replace("AAA","&copy;",$_POST['copyright']);

    $site_texts = $_POST['site_text'] . "~~~" . $_POST['tutorial_text'];

    $query="update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set site_url = ?, site_title = ?, site_name=?, site_logo=?, organisational_logo=?, welcome_message=?,
        site_text=? ,news_text=? ,pod_one=? , pod_two= ? ,copyright=? ,demonstration_page=? ,form_string= ? ,peer_form_string=?,feedback_list=?,
        rss_title=?, module_path=?, website_code_path=?, users_file_area_short=?, php_library_path=?, root_file_path=?, play_edit_preview_query=?, email_error_list=?, 
        error_log_message=?, error_email_message=?, ldap_host=?, ldap_port=?, bind_pwd=?, basedn=?, bind_dn=?, flash_save_path=?, flash_upload_path=?, flash_preview_check_path=?, flash_flv_skin=? , site_email_account=?,
        headers=?, email_to_add_to_username=?, proxy1=?, port1=?, site_session_name=?, synd_publisher=?, synd_rights=?, synd_license=?,import_path=? ,
        apache=?, mimetypes=?, LDAP_preference=? ,LDAP_filter=? , integration_config_path=?, admin_username=? ,admin_password=? ";
		
    $data = array($_POST['site_url'], $_POST['site_title'], $_POST['site_name'], $_POST['site_logo'], $_POST['organisational_logo'], $_POST['welcome_message'], $site_texts, base64_encode(stripcslashes($_POST['news_text'])), base64_encode(stripcslashes($_POST['pod_one'])), base64_encode(stripcslashes($_POST['pod_two'])), $copyright, $_POST['demonstration_page'], base64_encode(stripcslashes($_POST['form_string'])),
    base64_encode(stripcslashes($_POST['peer_form_string'])) , $_POST['feedback_list'] ,  $_POST['rss_title'] , $_POST['module_path'] ,  $_POST['website_code_path'] ,  $_POST['users_file_area_short'] ,
    $_POST['php_library_path'] ,  str_replace("\\","/",$_POST['root_file_path']) , base64_encode(stripcslashes($_POST['play_edit_preview_query'])) ,  $_POST['email_error_list'] ,  $_POST['error_log_message'] ,
    $_POST['error_email_message'] , $_POST['ldap_host']	, $_POST['ldap_port'] , $_POST['bind_pwd'] , $_POST['base_dn'] , $_POST['bind_dn'] , $_POST['flash_save_path'], $_POST['flash_upload_path'] ,  
    $_POST['flash_preview_check_path'] ,  $_POST['flash_flv_skin'] ,  $_POST['site_email_account'] ,  $_POST['headers'] , $_POST['email_to_add_to_username'] , $_POST['proxy1'] , $_POST['port1'] ,
    $_POST['site_session_name'] ,  $_POST['synd_publisher'] ,  $_POST['synd_rights'] ,  $_POST['synd_license'] ,  str_replace("\\","/",$_POST['import_path']) ,  $_POST['apache'] , 
    $_POST['mimetypes'] ,  $_POST['LDAP_preference'] , $_POST['LDAP_filter'] ,  $_POST['integration_config_path'] , $_POST['admin_username'] , $_POST['admin_password'] );

    $res = db_query($query, $data);

    $query = "replace {$xerte_toolkits_site->database_table_prefix}ldap SET ldap_id=1, ldap_host = ?, ldap_port = ?, ldap_username = ?, ldap_password = ?, ldap_basedn = ?, ldap_filter = ?, ldap_filter_attr = ?";

    $res2 = db_query($query, array($_POST['ldap_host'], $_POST['ldap_port'], $_POST['bind_dn'], $_POST['bind_pwd'], $_POST['base_dn'], $_POST['LDAP_filter'], $_POST['LDAP_preference']));

    if($res && $res2){

        echo MANAGEMENT_SITE_CHANGES_SUCCESS;

    }else{

        echo MANAGEMENT_SITE_CHANGES_FAIL . " " . mysql_error($database_id);

    }

}

?>
