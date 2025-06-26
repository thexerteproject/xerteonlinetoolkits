<?PHP
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

	_load_language_file("/modules/xerte/export_page.inc");

	echo "<p>" . XERTE_EXPORT_DESCRIPTION . "</p>";

    if (get_default_engine($_POST['template_id']) == 'javascript')
    {
		echo "<fieldset id=\"exportFS\" class=\"plainFS\"><legend>" . XERTE_EXPORT_INTERFACE . "</legend>";
		echo "<div><input checked=\"true\" type=\"radio\" id=\"html5\" name=\"exportEngine\" value=\"html5\"><label for=\"html5\">" . XERTE_EXPORT_HTML5 . "</label></div>";
		echo "<div><input type=\"radio\" id=\"flash\" name=\"exportEngine\" value=\"flash\"><label for=\"flash\">" . XERTE_EXPORT_FLASH . "</label></div>";
		echo "</fieldset>";
    }
    else
    {
        echo "<fieldset id=\"exportFS\" class=\"plainFS\"><legend>" . XERTE_EXPORT_INTERFACE . "</legend>";
		echo "<div><input type=\"radio\" id=\"html5\" name=\"exportEngine\" value=\"html5\"><label for=\"html5\">" . XERTE_EXPORT_HTML5 . "</label></div>";
		echo "<div><input checked=\"true\" type=\"radio\" id=\"flash\" name=\"exportEngine\" value=\"flash\"><label for=\"flash\">" . XERTE_EXPORT_FLASH . "</label></div>";
		echo "</fieldset>";
    }

    echo "<ol id=\"exportList\" type='1'>";
    echo "<li>" . XERTE_EXPORT_ZIP_TITLE . "<br/>" . XERTE_EXPORT_ZIP . "<br/><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', 'html5', 'flash', '" . $xerte_toolkits_site->site_url . url_return("export" , $_POST['template_id']) . "')\"><i class=\"fa fa-download\"></i> " . XERTE_EXPORT_ZIP_LINK . "</button></li>";
    echo "<li>" . XERTE_EXPORT_SCORM_TITLE . "<br/>" . XERTE_EXPORT_SCORM;
    echo "<ol type='a'>";
    echo "<li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', 'html5', 'flash', '" . $xerte_toolkits_site->site_url . url_return("scorm_rich" , $_POST['template_id']) . "')\"><i class=\"fa fa-download\"></i> " . XERTE_EXPORT_SCORM_12_LINK . "</button></li>";
    echo "<li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', 'html5', 'flash', '" . $xerte_toolkits_site->site_url . url_return("scorm2004" , $_POST['template_id']) . "')\"><i class=\"fa fa-download\"></i> " . XERTE_EXPORT_SCORM_2004_LINK . "</button></li></ol></li>";
    echo "<li>" . XERTE_EXPORT_ZIP_ARCHIVE_TITLE . "<br/>" . XERTE_EXPORT_ZIP_ARCHIVE . "<br/><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', 'html5', 'flash', '" . $xerte_toolkits_site->site_url . url_return("export_full" , $_POST['template_id']) . "')\"><i class=\"fa fa-download\"></i> " . XERTE_EXPORT_ZIP_ARCHIVE_LINK . "</button></li>";
    echo "<li>" . XERTE_EXPORT_ZIP_OFFLINE_TITLE . "<br/>" . XERTE_EXPORT_ZIP_OFFLINE . "<br/><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', 'html5', 'flash', '" . $xerte_toolkits_site->site_url . url_return("export_offline" , $_POST['template_id']) . "')\"><i class=\"fa fa-download\"></i> " . XERTE_EXPORT_ZIP_OFFLINE_LINK . "</button></li>";
    echo "</ol>";

?>