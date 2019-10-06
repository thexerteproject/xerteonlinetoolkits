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

if(is_user_admin()) {

    $database_id = database_connect("templates list connected", "template list failed");

    $copyright = str_replace("AAA", "&copy;", $_POST['copyright']);

    $site_texts = $_POST['site_text'] . "~~~" . $_POST['tutorial_text'];


    /* Ensure that the various check values are valid before saving them. */

    $enable_mime_check = true_or_false($_POST['enable_mime_check']) ? 'true' : 'false';
    $enable_file_ext_check = true_or_false($_POST['enable_file_ext_check']) ? 'true' : 'false';
    $enable_clamav_check = true_or_false($_POST['enable_clamav_check']) ? 'true' : 'false';

    $clamav_cmd = trim($_POST['clamav_cmd']);
    $clamav_cmd = preg_replace('/[;&<>|]/', '', $clamav_cmd);
    $clam_cmd = strlen($clamav_cmd) > 0 ? realpath($clamav_cmd) : '';
    $clamav_cmd = ($clam_cmd === false) ? $clamav_cmd : $clam_cmd;

    $clamav_opts = trim($_POST['clamav_opts']);
    $clamav_opts = preg_replace('/[^a-zA-Z0-9\s_-]/', '', $clamav_opts);
    $clamav_opts = preg_replace('/(^|\s)[^-]\S*/', '', $clamav_opts);


    $enable_file_ext_check = true_or_false($_POST['enable_file_ext_check']) ? 'true' : 'false';

    $query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set site_url = ?, site_title = ?, site_name=?, site_logo=?, organisational_logo=?, welcome_message=?,
        site_text=?, news_text=?, pod_one=?, pod_two=?, copyright=?, demonstration_page=?, form_string=?, peer_form_string=?, feedback_list=?,
        rss_title=?, module_path=?, website_code_path=?, users_file_area_short=?, php_library_path=?, root_file_path=?, play_edit_preview_query=?, email_error_list=?,
        error_log_message=?, max_error_size=?, authentication_method=?, ldap_host=?, ldap_port=?, bind_pwd=?, basedn=?, bind_dn=?, flash_save_path=?, flash_upload_path=?, flash_preview_check_path=?, flash_flv_skin=?,
        site_email_account=?, headers=?, email_to_add_to_username=?, proxy1=?, port1=?, site_session_name=?, synd_publisher=?, synd_rights=?, synd_license=?, import_path=?,
        apache=?, enable_mime_check=?, mimetypes=?, enable_file_ext_check=?, file_extensions=?, enable_clamav_check=?, clamav_cmd=?, clamav_opts=?, LDAP_preference=?, LDAP_filter=?, integration_config_path=?,
        admin_username=?, admin_password=?, LRS_Endpoint=?, LRS_Key=?, LRS_Secret=?, dashboard_enabled=?, dashboard_nonanonymous=?, xapi_dashboard_minrole=?, dashboard_period=?, dashboard_allowed_links=?";

    $data = array($_POST['site_url'], $_POST['site_title'], $_POST['site_name'], $_POST['site_logo'], $_POST['organisational_logo'], $_POST['welcome_message'], $site_texts, base64_encode(stripcslashes($_POST['news_text'])), base64_encode(stripcslashes($_POST['pod_one'])), base64_encode(stripcslashes($_POST['pod_two'])), $copyright, $_POST['demonstration_page'], base64_encode(stripcslashes($_POST['form_string'])),
        base64_encode(stripcslashes($_POST['peer_form_string'])), $_POST['feedback_list'], $_POST['rss_title'], $_POST['module_path'], $_POST['website_code_path'], $_POST['users_file_area_short'],
        $_POST['php_library_path'], str_replace("\\", "/", $_POST['root_file_path']), base64_encode(stripcslashes($_POST['play_edit_preview_query'])), $_POST['email_error_list'], $_POST['error_log_message'],
        $_POST['max_error_size'], $_POST['authentication_method'], $_POST['ldap_host'], $_POST['ldap_port'], $_POST['bind_pwd'], $_POST['base_dn'], $_POST['bind_dn'], $_POST['flash_save_path'], $_POST['flash_upload_path'],
        $_POST['flash_preview_check_path'], $_POST['flash_flv_skin'], $_POST['site_email_account'], $_POST['headers'], $_POST['email_to_add_to_username'], $_POST['proxy1'], $_POST['port1'],
        $_POST['site_session_name'], $_POST['synd_publisher'], $_POST['synd_rights'], $_POST['synd_license'], str_replace("\\", "/", $_POST['import_path']), $_POST['apache'],
        $enable_mime_check, str_replace(' ', '', $_POST['mimetypes']), $enable_file_ext_check, str_replace(' ', '', $_POST['file_extensions']), $enable_clamav_check, str_replace("\\", "/", $clamav_cmd), $clamav_opts,
        $_POST['LDAP_preference'], $_POST['LDAP_filter'], $_POST['integration_config_path'], $_POST['admin_username'], $_POST['admin_password'], $_POST['site_xapi_endpoint'], $_POST['site_xapi_key'], $_POST['site_xapi_secret'],
        $_POST['site_xapi_dashboard_enable'], $_POST['site_xapi_dashboard_nonanonymous'], $_POST['xapi_dashboard_minrole'], $_POST['site_xapi_dashboard_period'], $_POST['xapi_dashboard_urls']);

    $res = db_query($query, $data);

    if ($res!==false) {
        $query = "UPDATE {$xerte_toolkits_site->database_table_prefix}ldap SET ldap_knownname = 'from_sitedetails', ldap_host = ?, ldap_port = ?, ldap_username = ?, ldap_password = ?, ldap_basedn = ?, ldap_filter = ?, ldap_filter_attr = ? where ldap_id=1";

        $numaffected = db_query($query, array($_POST['ldap_host'], $_POST['ldap_port'], $_POST['bind_dn'], $_POST['bind_pwd'], $_POST['base_dn'], $_POST['LDAP_filter'], $_POST['LDAP_preference']));

        // Extra code to make sure ldap is updated)
        if ($numaffected === false) {
            $res2 = false;
        } else {
            $res2 = true;
            _debug("Num affected: " . $numaffected);
            if ($numaffected == 0) {
                $query = "select * from {$xerte_toolkits_site->database_table_prefix}ldap";
                $res3 = db_query($query);
                if (empty($res3)) {
                    $query = "insert {$xerte_toolkits_site->database_table_prefix}ldap SET ldap_knownname = 'from_sitedetails', ldap_host = ?, ldap_port = ?, ldap_username = ?, ldap_password = ?, ldap_basedn = ?, ldap_filter = ?, ldap_filter_attr = ?, ldap_id=1";
                    $res3 = db_query($query, array($_POST['ldap_host'], $_POST['ldap_port'], $_POST['bind_dn'], $_POST['bind_pwd'], $_POST['base_dn'], $_POST['LDAP_filter'], $_POST['LDAP_preference']));
                    _debug("Result of insert: " . $res3);
                }
            }
        }
    }
    if($res!==false && $res2){

        $msg = "Site changes saved by user from " . $_SERVER['REMOTE_ADDR'];
        receive_message("", "SYSTEM", "MGMT", "Changes saved", $msg);

        /* Clear the file cache because of the file check below. */
        clearstatcache();

        if ($enable_clamav_check === 'true' && (! is_file($clamav_cmd) || ! is_executable($clamav_cmd))) {
            echo MANAGEMENT_SITE_CHANGES_OK_NOT_AV;
        }
        else {
            echo MANAGEMENT_SITE_CHANGES_SUCCESS;
        }

    }else{

        echo MANAGEMENT_SITE_CHANGES_FAIL . " " . mysql_error($database_id);

    }

}

?>
