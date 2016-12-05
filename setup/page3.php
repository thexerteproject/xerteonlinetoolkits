<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
require_once('page_header.php'); ?>

        <h2>Toolkits Set up page</h2>

        <p>Use this page to set up Xerte Online Toolkits. The various settings have been grouped into areas depending on what part of the site they effect or change. <b>Please note that this code comes with management features that will allow you to change all these settings at a later point.</b></p>

        <form action="page4.php" method="post" enctype="multipart/form-data" name="setup">

<?php echo "<h3>Site formatting settings - Customising the first login page</h3><p>Please see <a href=\"page1.gif\" target=\"new\">this screen shot</a> for guidance.";

echo "<p>The site url is (This is the URL of the site - changing this will not change the URL)<textarea name=\"site_url\">" . $xot_setup->getProtocol() . $_SERVER['HTTP_HOST'] . substr($_SERVER['PHP_SELF'],0,strlen($_SERVER['PHP_SELF'])-15) . "</textarea><p><b>WARNING:</b> If you are installing this via localhost on a server, but wish to provide this service from a URL hosted on this server, please remove localhost from the above textarea and replace it with a url</p>";

echo "<p>The site title is (This is the HTML title tag content) <textarea name=\"site_title\">Welcome to Xerte Online Toolkits</textarea></p>";

echo "<p>The site name is (This is part of index.php and the RSS and Syndication feeds)<textarea name=\"site_name\">Xerte Online Toolkits</textarea></p>";

echo "<p>The site logo is (The logo in the top left, as you can currently see - number 3 on the diagram)<textarea name=\"site_logo\">website_code/images/xerteLogo.jpg</textarea></p>";

echo "<p>The organisational logo is (The logo in the top right, as you can currently see - number 4 on the diagram)<textarea name=\"organisational_logo\">website_code/images/UofNLogo.jpg</textarea></p>";

echo "<p>The Welcome message is (number 1 on the diagram)<textarea name=\"welcome_message\">Welcome to Xerte Online Toolkits</textarea></p>";

echo "<p>The site text is (number 2 on the diagram)<textarea name=\"site_text\">Welcome to the toolkits front page, developed by the Apereo Foundation</textarea></p>";

echo "<p>The news text is (number 5 on the diagram)<textarea name=\"news_text\"><p class=\"news_title\">Other resources</p><p class=\"news_story\"><a href=\"\">Site 1</a></p><p class=\"news_story\"><a href=\"\">Site 2</a></p><p class=\"news_story\"><a href=\"\">Site 3</a></p></textarea></p>";	

echo "<p>The copyright message (number 6 on the diagram) is <textarea name=\"copyright\">Copyright Apereo Foundation 2015</textarea></p>";	

echo "<p>The demonstration page (linked to from number 7 on the diagram) URL is <textarea name=\"demonstration_page\">modules/xerte/training/toolkits.htm</textarea></p>";	

echo "<p>The form string is (The code to handle the HTML format for the login box, this should only be changed by advanced users - number 8 on the diagram)<br/><br/><textarea name=\"form_string\"><html><body><center><p><form method=\"post\" action=\"\"><p>Username <input type=\"text\" size=\"20\" maxlength=\"12\" name=\"login\" /></p><p>Password <input type=\"password\" size=\"20\" maxlength=\"36\" name=\"password\" /></p><p><input type=\"image\" src=\"website_code/images/Bttn_LoginOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_LoginOn.gif'\" onmousedown=\"this.src='website_code/images/Bttn_LoginClick.gif'\" onmouseout=\"this.src='website_code/images/Bttn_LoginOff.gif'\" /></p></textarea></p>";	

echo "<br><br><h3 style=\"clear:left\">Site formatting settings - Customising the logged in page</h3>";

echo "<p>The content of pod one is (The first pod underneath the file area on the logged in page)<textarea name=\"pod_one\"><p class=\"news_title\">Resources</p><p class=\"demo\"><a href=\"http://www.xerte.org.uk\">Community Resources</a><br />The Xerte user community website.</p><p class=\"demo\"><a href=\"http://www.nottingham.ac.uk/toolkits/play_560\">Learning Object Demo</a><br />A comprehensive demo of all the page templates.</p></textarea></p>";	

echo "<p>The content of pod two is (The second pod underneath the file area on the logged in page)<textarea name=\"pod_two\"><p class=\"news_title\">Want to share some thoughts?</p><p class=\"general\">If you have any questions, requests for help, ideas for new projects or problems to report, then please get in touch.</p><p class=\"general\">Please use our <a href=\"feedback/\" style=\"color:#000\">Feedback Form</a></p></textarea></p>";

echo "<br><br><h3 style=\"clear:left\">Server settings - some technical aspects for the site</h3>";

echo "<p>The HTACCESS setting is (Whether or not you are using a .htaccess file on the site - the apache config must allow for overrides)<textarea name=\"apache\">false</textarea>
    </p>";	

echo "<p>The PHP session name (you do not need to change this unless integrating with another service) is <textarea name=\"site_session_name\">XERTE_TOOLKITS</textarea>
    </p>";	
echo "<p>The integration config path (for use if integrating with other systems is)<textarea name=\"integration_config_path\"></textarea></p>";

echo "<p>The admin username is <textarea name=\"admin_username\">" . $_POST['account'] . "</textarea></p>";

echo "<p>The admin password is <textarea name=\"admin_password\">" . $_POST['password'] . "</textarea></p>";	

echo "<p>The allowed upload types for the Media and quota page are <textarea name=\"mimetypes\">text/xml,application/msword,application/x-shockwave-flash,image/jpeg,image/pjpeg,image/png,image/gif,image/x-png,audio/mpeg,application/vnd.ms-excel,application/pdf,application/vnd.ms-powerpoint,video/x-ms-wmv,text/html,video/mp4,video/avi,audio/wav,text/plain,video/quicktime,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation</textarea>
    </p>";	

echo "<br><br><h3 style=\"clear:left\">RSS Feed and Syndication settings - formatting for the RSS feeds and for the syndication</h3>";

echo "<p>The RSS Feed title is <textarea name=\"rss_title\">Xerte Online Toolkits RSS Feed</textarea></p>";	

echo "<p>The institutional publisher as listed in the syndication feed is <textarea name=\"synd_publisher\">Put your institution's name here</textarea></p>";

echo "<p>The standard syndication rights for the syndicated content are <textarea name=\"synd_rights\">Licensed under a Creative Commons Attribution - NonCommercial-ShareAlike 2.0 Licence - see http://creativecommons.org/licenses/by-nc-sa/2.0/uk/</textarea></p>";

echo "<p>The standard syndication license for the syndicated content is <textarea name=\"synd_license\">Licensed under a Creative Commons Attribution - NonCommercial-ShareAlike 2.0 Licence - see http://creativecommons.org/licenses/by-nc-sa/2.0/uk/</textarea></p>";

echo "<br><br><h3 style=\"clear:left\">Server paths - where files will be hosted on the server</h3>";

echo "<p>The module path is <textarea name=\"module_path\">modules/</textarea></p>";	

echo "<p>The website code path is <textarea name=\"website_code_path\">website_code/</textarea></p>";	

echo "<p>The short file area path is <textarea name=\"users_file_area_short\">USER-FILES/</textarea></p>";	

echo "<p>The php library path is <textarea name=\"php_library_path\">website_code/php/</textarea></p>";	

echo "<p>The root file path is <textarea name=\"root_file_path\">" . str_replace('\\', '/', substr(getcwd(),0,strlen(getcwd())-5)) . "</textarea></p>";

echo "<p>The import path (where imported files will be processed to check they are valid) is <textarea name=\"import_path\">" . str_replace('\\', '/', substr(getcwd(),0,strlen(getcwd())-5)) . "import/</textarea><br><br><b style=\"clear:left\"><br><br>You may wish to move this folder to be outside the webroot</b></p>";

echo "<br><br><h3 style=\"clear:left\">MySQL query string - The default string for many of the sites mysql queries</h3>";

echo "<p>The play edit preview query is <textarea name=\"play_edit_preview_query\">select \" . \$xerte_toolkits_site->database_table_prefix . \"originaltemplatesdetails.template_name, \" . \$xerte_toolkits_site->database_table_prefix . \"logindetails.username, \" . \$xerte_toolkits_site->database_table_prefix . \"originaltemplatesdetails.template_framework, \" . \$xerte_toolkits_site->database_table_prefix . \"templaterights.user_id, \" . \$xerte_toolkits_site->database_table_prefix . \"templaterights.folder, \" . \$xerte_toolkits_site->database_table_prefix . \"templaterights.template_id, \" . \$xerte_toolkits_site->database_table_prefix . \"templatedetails.access_to_whom from \" . \$xerte_toolkits_site->database_table_prefix . \"originaltemplatesdetails, \" . \$xerte_toolkits_site->database_table_prefix . \"templaterights, \" . \$xerte_toolkits_site->database_table_prefix . \"templatedetails, \" . \$xerte_toolkits_site->database_table_prefix . \"logindetails where \" . \$xerte_toolkits_site->database_table_prefix . \"templatedetails.template_type_id = \" . \$xerte_toolkits_site->database_table_prefix . \"originaltemplatesdetails.template_type_id and \" . \$xerte_toolkits_site->database_table_prefix . \"templatedetails.creator_id = \" . \$xerte_toolkits_site->database_table_prefix . \"logindetails.login_id and \" . \$xerte_toolkits_site->database_table_prefix . \"templaterights.template_id = \" . \$xerte_toolkits_site->database_table_prefix . \"templatedetails.template_id and \" . \$xerte_toolkits_site->database_table_prefix . \"templaterights.template_id=\"TEMPLATE_ID_TO_REPLACE\" and role=\"creator\"</textarea></p>";

echo "<br><br><h3 style=\"clear:left\">Error handling - where files will be hosted on the server</h3>";	

echo "<p>The error log path is <textarea name=\"error_log_path\">error_logs/</textarea></p>";	

echo "<p>The email error list is (Accounts to receive email messages from the error logger)<textarea name=\"email_error_list\"></textarea></p>";	

echo "<p>The error log message is (Set to true to log errors)<textarea name=\"error_log_message\">false</textarea></p>";	

echo "<p>The email error message is (Set to true to email errors)<textarea name=\"error_email_message\">false</textarea></p>";	

echo "<p>The maximum error size is (The maximum number of entries per error log)<textarea name=\"max_error_size\">10</textarea></p>";

echo "<br><br><h3 style=\"clear:left\">LDAP handling - where files will be hosted on the server</h3>";

echo "<p>You can set up multiple hosts by separating entries in each of these fields with the ";?>\n<?PHP echo "string as a delimiter</p>";

echo "<p>The ldap host is <textarea name=\"ldap_host\"></textarea></p>";

echo "<p>The ldap port is <textarea name=\"ldap_port\"></textarea></p>";

echo "<p>The ldap password is (this can be left blank for lighter LDAP)<textarea name=\"bind_pwd\"></textarea></p>";

echo "<p>The ldap base is <textarea name=\"basedn\"></textarea></p>";

echo "<p>The ldap bind is <textarea name=\"bind_dn\"></textarea></p>";

echo "<p>The first LDAP filter is <textarea name=\"LDAP_preference\">sAMAccountName</textarea></p>";	

echo "<p>The second LDAP filter is <textarea name=\"LDAP_filter\">cn=</textarea></p>";	

echo "<br><br><h3 style=\"clear:left\">Peer review settings - Customising the peer review page</h3>";

echo "<p>The Peer form string is (The code to handle the HTML format for the peer review login box)<textarea name=\"peer_form_string\"><html><body><center><p><form method=\"post\" action=\"\"><p>Password <input type=\"password\" size=\"20\" maxlength=\"36\" name=\"password\" /></p><p><input type=\"image\" src=\"website_code/images/Bttn_LoginOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_LoginOn.gif'\" onmousedown=\"this.src='website_code/images/Bttn_LoginClick.gif'\" onmouseout=\"this.src='website_code/images/Bttn_LoginOff.gif'\" /></p></textarea></p>";	

echo "<br><br><h3 style=\"clear:left\">Xerte Settings - some files Xerte uses to work on the server - you do not need to change any of these.</h3>";

echo "<p>The flash save path is <textarea name=\"flash_save_path\">modules/xerte/engine/save.php</textarea></p>";

echo "<p>The flash upload path is <textarea name=\"flash_upload_path\">upload.php?path=</textarea></p>";

echo "<p>The flash preview check path is <textarea name=\"flash_preview_check_path\">modules/xerte/engine/file_exists.php</textarea></p>";

echo "<p>The flash flv skin is <textarea name=\"flash_flv_skin\">modules/xerte/engine/tools/SteelOverAll.swf</textarea></p>";

echo "<br><br><h3 style=\"clear:left\">Email Settings - settings to manage how the site sets up email.</h3>";

echo "<p>The site email account is <textarea name=\"site_email_account\"></textarea></p>";

echo "<p>The site email headers is (use the * symbol to represent a new line ";?>'\n'<?PHP echo ")<textarea name=\"headers\"></textarea></p>";

echo "<p>The site email to add to username is <textarea name=\"email_to_add_to_username\"></textarea></p>";

echo "<p>The site's feedback list is (A semi-colon separated list of email addresses to receive feedback from the feedback page)<textarea name=\"feedback_list\"></textarea></p>";

echo "<br><br><h3 style=\"clear:left\">Web Proxy Settings - settings to manage how the site can connect to the internet for certain Xerte pages.</h3>";

echo "<p>The site's proxy host is <textarea name=\"proxy1\"></textarea></p>";

echo "<p>The site's proxy port is <textarea name=\"port1\"></textarea></p>";

echo "<p>By directly editing the rss proxy.php file (in the root folder), you can add up to 4 proxies and ports should you wish.</p>";

echo "<br><br><h3 style=\"clear:left\">XAPI LRS Endpoint Settings - settings to manage which LRS the XAPI statements are sent to.</h3>";

echo "<p>The LRS endpoint (URL) is  <textarea name=\"LRS_Endpoint\"></textarea></p>";

echo "<p>The username (key) for the endpoint is <textarea name=\"LRS_Key\"></textarea></p>";

echo "<p>The password (secret) for the endpoint is <textarea name=\"LRS_Secret\"></textarea></p>";

// Authentication method
echo "<br><h3 style=\"clear:left\">Authentication Method</h3>";

echo "<p>The default setting for user authentication is 'Guest' - which allows ANY visitor to access Xerte's front end with privileges to create, edit and delete ALL content. So… <span style=\"color: red;\">using <strong>'Guest' on a public web server</strong> (where anyone could access it) unless you have other security measures in place</span> is <strong  style=\"color: red;\">NOT recommended</strong>.</p>";

echo "<p>See: <code>documentation/ToolkitsInstallationGuide.pdf</code> for details about each of the authentication options (Guest, Ldap, Db, Static, Moodle).</p>";

echo "<label>Choose an authentication method:</label><br>";

echo "<select name=\"authentication_method\" style=\"padding: 0.4em 0.15em; \">
    		<option value=\"Guest\">Guest</option>
    		<option value=\"Ldap\">Ldap</option>
    		<option value=\"Db\">Db</option>
    		<option value=\"Static\">Static</option>
    		<option value=\"Moodle\">Moodle</option>
    		<option value=\"Saml2\">Saml2</option>
  		</select>";

echo "<br><br>";

?>
        <button type="submit">Save</button>
    </form>

<?php require_once('page_footer.php'); ?>