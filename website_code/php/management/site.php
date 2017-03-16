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

_load_language_file("/website_code/php/management/site.inc");

require_once("../user_library.php");
require_once("management_library.php");

if(is_user_admin()){

    $database_id = database_connect("templates list connected","template list failed");

    $query="select * from " . $xerte_toolkits_site->database_table_prefix . "sitedetails";

    $row = db_query_one($query);

    $site_texts = explode("~~~", $row['site_text']);
    if (count($site_texts) > 1)
    {
        $site_text = $site_texts[0];
        $tutorial_text=$site_texts[1];
    }
    else
    {
        $site_text = $site_texts[0];
        $tutorial_text="";
    }

    echo "<p>" . MANAGEMENT_SITE_REGISTER_TEXT . "</p>";

    echo "<p><button type=\"button\" class=\"xerte_button\" onclick=\"javascript:register();\"><i class=\"fa fa-globe\"></i> " .  MANAGEMENT_SITE_REGISTER . "</button>";

    echo "<div class=\"template\" id=\"sitedetails\"><p>" . MANAGEMENT_SITE_TITLE . " <button type=\"button\" class=\"xerte_button\" id=\"sitedetails_btn\" onclick=\"javascript:templates_display('sitedetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"sitedetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_URL . "<form><textarea id=\"site_url\">" . $row['site_url'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_TITLE_HTML . "<form><textarea id=\"site_title\">" . $row['site_title'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_NAME . "<form><textarea id=\"site_name\">" . $row['site_name'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_LOGO . "<form><textarea id=\"site_logo\">" . $row['site_logo'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_LOGO_ORG . "<form><textarea id=\"organisational_logo\">" . $row['organisational_logo'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_WELCOME . "<form><textarea id=\"welcome_message\">" . $row['welcome_message'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_TEXT . "<form><textarea id=\"site_text\">" . $site_text . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_TUTORIAL_TEXT . "<form><textarea id=\"tutorial_text\">" . $tutorial_text . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_NEWS . "<form><textarea id=\"news_text\">" . base64_decode($row['news_text']) . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_POD_ONE . "<form><textarea id=\"pod_one\">" . base64_decode($row['pod_one']) . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_POD_TWO . "<form><textarea id=\"pod_two\">" . base64_decode($row['pod_two']) . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_COPYRIGHT . "<form><textarea id=\"copyright\">" . $row['copyright'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_DEMONSTRATION . "<form><textarea id=\"demonstration_page\">" . $row['demonstration_page'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_LOGIN_FORM . "<form><textarea id=\"form_string\">" . base64_decode($row['form_string']) . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PEER_FORM . "<form><textarea id=\"peer_form_string\">" . base64_decode($row['peer_form_string']) . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_FEEDBACK . "<form><textarea id=\"feedback_list\">" . $row['feedback_list'] . "</textarea></form></p>";

    echo "</div>";

    echo "<div class=\"template\" id=\"serverdetails\"><p>" . MANAGEMENT_SITE_SERVER . " <button type=\"button\" class=\"xerte_button\" id=\"serverdetails_btn\" onclick=\"javascript:templates_display('serverdetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"serverdetails_child\">";

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

    echo "<div class=\"template\" id=\"rssdetails\"><p>" . MANAGEMENT_SITE_RSS . " <button type=\"button\" class=\"xerte_button\" id=\"rssdetails_btn\" onclick=\"javascript:templates_display('rssdetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"rssdetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_RSS_TITLE . "<form><textarea id=\"rss_title\">" . $row['rss_title'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_RSS_PUBLISHER . "<form><textarea id=\"synd_publisher\">" . $row['synd_publisher'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_RSS_RIGHTS . "<form><textarea id=\"synd_rights\">" . $row['synd_rights'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_RSS_LICENCE . "<form><textarea id=\"synd_license\">" . $row['synd_license'] . "</textarea></form></p>";

    echo "</div>";

    echo "<div class=\"template\" id=\"pathdetails\"><p>" . MANAGEMENT_SITE_PATH . " <button type=\"button\" class=\"xerte_button\" id=\"pathdetails_btn\" onclick=\"javascript:templates_display('pathdetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"pathdetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_PATH_MODULE . "<form><textarea id=\"module_path\">" . $row['module_path'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PATH_MODULE . "<form><textarea id=\"website_code_path\">" . $row['website_code_path'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PATH_SHORT . "<form><textarea id=\"users_file_area_short\">" . $row['users_file_area_short'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PATH_LIBRARY . "<form><textarea id=\"php_library_path\">" . $row['php_library_path'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PATH_ROOT . "<form><textarea id=\"root_file_path\">" . str_replace("\\","/",$row['root_file_path']) . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_PATH_IMPORT . "<form><textarea id=\"import_path\">" . str_replace("\\","/",$row['import_path']) . "</textarea></form></p>";	

    echo "</div>";

    echo "<div class=\"template\" id=\"sqldetails\"><p>" . MANAGEMENT_SITE_SQL . " <button type=\"button\" class=\"xerte_button\" id=\"sqldetails_btn\" onclick=\"javascript:templates_display('sqldetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"sqldetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_QUERY . "<form><textarea rows=\"20\" id=\"play_edit_preview_query\">" . str_replace("$","\$",str_replace("\\","",base64_decode($row['play_edit_preview_query'])))  . "</textarea></form></p>";	

    echo "</div>";

    echo "<div class=\"template\" id=\"errordetails\"><p>" . MANAGEMENT_SITE_ERROR_HANDLING . " <button type=\"button\" class=\"xerte_button\" id=\"errordetails_btn\" onclick=\"javascript:templates_display('errordetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"errordetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_ERROR_EMAIL_ACCOUNT . "<form><textarea id=\"error_log_message\">" . $row['error_log_message'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_ERROR_EMAIL . "<form><textarea id=\"error_email_list\">" . $row['email_error_list'] . "</textarea></form></p>";	

    echo "<p>" . MANAGEMENT_SITE_ERROR_MAX . "<form><textarea id=\"error_email_message\">" . $row['max_error_size'] . "</textarea></form></p>";

    echo "</div>";

    echo "<div class=\"template\" id=\"authdetails\"><p>" . MANAGEMENT_SITE_AUTH_DETAILS . " <button type=\"button\" class=\"xerte_button\" id=\"authdetails_btn\" onclick=\"javascript:templates_display('authdetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"authdetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_AUTH_METHOD . "<form style=\"margin: top: 20px; padding: 4em 0.15em; \">";

        echo "<select name=\"authentication_method\" id=\"authentication_method\" style=\"margin: 15px 0 0 10px; padding: 0.4em 0.15em; \">";

        if(isset($row['authentication_method'])) {
          echo "<option value=\"". $row['authentication_method'] . "\">". $row['authentication_method'] . "</option>";
        }

        echo "<option value=\"Guest\">Guest</option>
              <option value=\"Ldap\">Ldap</option>
              <option value=\"Db\">Db</option>
              <option value=\"Static\">Static</option>
              <option value=\"Moodle\">Moodle</option>
              <option value=\"Saml2\">Saml2</option>
              <option value=\"OAuth2\">OAuth2</option>
            </select>";

        echo "</form></p>"; 

    echo "</div>";

    echo "<div class=\"template\" id=\"ldapdetails\"><p>" . MANAGEMENT_SITE_LDAP . " <button type=\"button\" class=\"xerte_button\" id=\"ldapdetails_btn\" onclick=\"javascript:templates_display('ldapdetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"ldapdetails_child\">";

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

    echo "<div class=\"template\" id=\"xertedetails\"><p>" . MANAGEMENT_SITE_XERTE . " <button type=\"button\" class=\"xerte_button\" id=\"xertedetails_btn\" onclick=\"javascript:templates_display('xertedetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"xertedetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_XERTE_SAVE . "<form><textarea id=\"flash_save_path\">" . $row['flash_save_path'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_XERTE_UPLOAD . "<form><textarea id=\"flash_upload_path\">" . $row['flash_upload_path'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_XERTE_PREVIEW . "<form><textarea id=\"flash_preview_check_path\">" . $row['flash_preview_check_path'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_XERTE_SKIN . "<form><textarea id=\"flash_flv_skin\">" . $row['flash_flv_skin'] . "</textarea></form></p>";

    echo "</div>";

    echo "<div class=\"template\" id=\"emaildetails\"><p>" . MANAGEMENT_SITE_EMAIL . " <button type=\"button\" class=\"xerte_button\" id=\"emaildetails_btn\" onclick=\"javascript:templates_display('emaildetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"emaildetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_EMAIL_ACCOUNT . "<form><textarea id=\"site_email_account\">" . $row['site_email_account'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_EMAIL_HEADERS . "<form><textarea id=\"headers\">" . $row['headers'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_EMAIL_SUFFIX . "<form><textarea id=\"email_to_add_to_username\">" . $row['email_to_add_to_username'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_PROXY . "<form><textarea id=\"proxy1\">" . $row['proxy1'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_PROXY_PORT . "<form><textarea id=\"port1\">" . $row['port1'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_PROXY_EXPLAINED . "</p>";

    echo "</div>";

    echo "<div class=\"template\" id=\"languagedetails\">";
    echo "<p>" . MANAGEMENT_LIBRARY_LANGUAGES . " <button type=\"button\" class=\"xerte_button\" id=\"languagedetails_btn\" onclick=\"javascript:templates_display('languagedetails')\">" . MANAGEMENT_LIBRARY_VIEW . "</button></p></div><div class=\"template_details\" id=\"languagedetails_child\">";
    language_details(false);
    echo "</div>";
    echo "</div>";

    echo "<div class=\"template\" id=\"xapidetails\"><p>" . MANAGEMENT_SITE_XAPI . " <button type=\"button\" class=\"xerte_button\" id=\"xapidetails_btn\" onclick=\"javascript:templates_display('xapidetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"xapidetails_child\">";

    echo "<p>" . MANAGEMENT_SITE_XAPI_ENDPOINT . "<form><textarea id=\"site_xapi_endpoint\">" . $row['LRS_Endpoint'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_XAPI_KEY . "<form><textarea id=\"site_xapi_key\">" . $row['LRS_Key'] . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_SITE_XAPI_SECRET . "<form><textarea id=\"site_xapi_secret\">" . $row['LRS_Secret'] . "</textarea></form></p>";

    echo "</div>";


  echo "<div class=\"template\" id=\"ltidetails\"><p>" . MANAGEMENT_SITE_LTI . " <button type=\"button\" class=\"xerte_button\" id=\"ltidetails_btn\" onclick=\"javascript:templates_display('ltidetails')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"ltidetails_child\">";


  echo "<div class=\"template\" id=\"ltikeys\"><p>" . MANAGEMENT_SITE_LTI_KEYS . " <button type=\"button\" class=\"xerte_button\" id=\"ltikeys_btn\"onclick=\"javascript:templates_display('ltikeys')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"ltikeys_child\">";


    echo "<div id=\"ltikeys\">";


if(!isset($mysqli)) {

  $mysqli = new mysqli($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password, $xerte_toolkits_site->database_name);
  if ($mysqli->error) {
    try {
      throw new Exception("0MySQL error $mysqli->error <br> Query:<br> $query", $mysqli->errno);
    }
    catch (Exception $e) {
      echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
      echo nl2br($e->getTraceAsString());
    }
  }
}
if(!isset($lti)) {
  require_once('../../../LTI/ims-lti/UoN_LTI.php');
  $lti = new UoN_LTI($mysqli);
}



  $dataret=$lti->get_lti_keys();

  $dataret['NEW']=array('lti_keys_id'=>'NEW', 'lti_keys_key'=>'', 'lti_keys_secret'=>'', 'lti_keys_name'=>LTI_KEYS_NEW, 'lti_keys_context_id'=>'', 'lti_keys_deleted'=>'', 'lti_keys_updated_on'=>'');

  foreach($dataret as $lti_key_id=>$row) {
//array('lti_keys_id'=>$lti_keys_id, 'lti_keys_key'=>$lti_keys_key, 'lti_keys_secret'=>$lti_keys_secret, 'lti_keys_name'=>$lti_keys_name, 'lti_keys_context_id'=>$lti_keys_context_id, 'lti_keys_deleted'=>$lti_keys_deleted, 'lti_keys_updated_on'=>$lti_keys_updated_on);

    $click=LTI_TOGGLE;
    $click2="&nbsp;&nbsp;<a href=\"javascript:delete_LTI_key('" . $row['lti_keys_id'] . "')\">" . LTI_KEYS_DELETE . "</a>";
    if($row['lti_keys_id']=='NEW') {
      $click=LTI_KEYS_ADD;
      $click2='';
    }

    echo "<div class=\"template\" id=\"" . $row['lti_keys_id'] . "\" savevalue=\"" . $row['lti_keys_id'] .  "\"><p>" . $row['lti_keys_name'] . " <a href=\"javascript:templates_display('" . $row['lti_keys_id'] . "')\">" . $click . "</a>$click2</p></div><div class=\"template_details\" id=\"" . $row['lti_keys_id']  . "_child\">";

    echo "<p>" . LTI_KEYS_NAME . "<form><textarea id=\"lti_keys_name" . $row['lti_keys_id'] .  "\">" . $row['lti_keys_name'] . "</textarea></form></p>";
    echo "<p>" . LTI_KEYS_KEY . "<form><textarea id=\"lti_keys_key" . $row['lti_keys_id'] .  "\">" . $row['lti_keys_key'] . "</textarea></form></p>";
    echo "<p>" . LTI_KEYS_SECRET . "<form><textarea id=\"lti_keys_secret" . $row['lti_keys_id'] .  "\">" . $row['lti_keys_secret'] . "</textarea></form></p>";
    echo "<p>" . LTI_KEYS_CONTEXT_ID . "<form><textarea id=\"lti_keys_context_id" . $row['lti_keys_id'] .  "\">" . $row['lti_keys_context_id'] . "</textarea></form></p>";

    if($row['lti_keys_id']=='NEW') {
      echo "<div><p><form action=\"javascript:new_LTI_key();\"><input type=\"submit\" name=\"new-lti\" value=\"". LTI_KEYS_ADD_SUBMIT ."\"></form></p></div>";
    } else {
      echo "<div style=\"width:300px;\">";
      echo "<div style=\"float:left;width:100px;\"><p><form action=\"javascript:edit_LTI_key(" . $row['lti_keys_id'] . ");\"><input type=\"submit\" name=\"edit-lti\" value=\"". LTI_KEYS_EDIT_SUBMIT ."\"></form></p></div>";
    //  echo "<div style=\"float:right;width:100px;\"><p><form><input type=\"submit\" name=\"delete-lti\" value=\"". LTI_KEYS_DELETE_SUBMIT ."\"></form></p></div>";
      echo "</div>";

    }

    echo "</div>";

  }
    echo "</div>";

    echo "</div>";

    echo "</div>";

}else{

    echo "the feature is for administrators only";

}

?>
