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

	_load_language_file("/website_code/php/workspaceproperties/workspace_library.inc");

	function workspace_templates_menu(){
	
		echo "<p class=\"header\"><span>My projects</span></p>";	
		echo "<div class=\"menu_holder\"><div class=\"menu_button\"><a href=\"javascript:workspace_templates_template()\">" . WORKSPACE_LIBRARY_MY . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:shared_templates_template()\">" . WORKSPACE_LIBRARY_SHARED . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:public_templates_template()\">" . WORKSPACE_LIBRARY_PUBLIC . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:usage_templates_template()\">" . WORKSPACE_LIBRARY_USAGE . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:rss_templates_template()\">" . WORKSPACE_LIBRARY_RSS . "</div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:syndication_templates_template()\">" . WORKSPACE_LIBRARY_OPEN . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:peer_templates_template()\">" . WORKSPACE_LIBRARY_PEER . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:xml_templates_template()\">" . WORKSPACE_LIBRARY_XML . "</a></div>";
		echo "</div>";

	}
	
	function workspace_menu_create($size){
	
		echo "<div style=\"clear:left; margin-left:20px; margin-top:10px; width:90%; float:left;\">";

		echo "<div style=\"float:left; width:" . $size . "%; height:20px;\">" . WORKSPACE_LIBRARY_TEMPLATE_NAME . "</div>";
	
	}

?>
