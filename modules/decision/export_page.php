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

	_load_language_file("/modules/decision/export_page.inc");

	echo "<p>" . XERTE_EXPORT_DESCRIPTION . "</p>";

    echo "<ol type='1'>";
    echo "<li>" . XERTE_EXPORT_ZIP . "<ul><li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', '', '', '" . $xerte_toolkits_site->site_url . url_return("export" , $_POST['template_id']) . "')\">" . XERTE_EXPORT_ZIP_LINK . "</button></li></ul></li><br />";
    echo "<li>" . XERTE_EXPORT_ZIP_ARCHIVE . "<ul><li><button type=\"button\" class=\"xerte_button\" onclick=\"property_tab_download('download_frame', '', '', '" . $xerte_toolkits_site->site_url . url_return("export_full" , $_POST['template_id']) . "')\">" . XERTE_EXPORT_ZIP_ARCHIVE_LINK . "</button></li></ul><br /></li>";
    echo "</ol>";

?>