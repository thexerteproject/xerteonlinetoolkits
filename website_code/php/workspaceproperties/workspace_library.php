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
		
		echo "<h2 class=\"header\">" . WORKSPACE_LIBRARY_MY . "</h2>";

		echo "<div id=\"mainContent\">";
		
		echo "<div id=\"panelTabs\" role=\"tabList\" class=\"menu_holder\">";
		echo "<button id=\"tabMyProjects\" type=\"button\" role=\"tab\" aria-controls=\"panelMyProjects\" aria-selected=\"true\" class=\"menu_button tabSelected\" onclick=\"javascript:my_templates_template(); panelTabClicked('tabMyProjects');\">" . WORKSPACE_LIBRARY_MY . "</button>";
		echo "<button id=\"tabShared\" type=\"button\" role=\"tab\" aria-controls=\"panelShared\" aria-selected=\"false\" class=\"menu_button\" onclick=\"javascript:shared_templates_template(); panelTabClicked('tabShared');\">" . WORKSPACE_LIBRARY_SHARED . "</button>";
		echo "<button id=\"tabPublic\" type=\"button\" role=\"tab\" aria-controls=\"panelPublic\" aria-selected=\"false\" class=\"menu_button\" onclick=\"javascript:public_templates_template(); panelTabClicked('tabPublic');\">" . WORKSPACE_LIBRARY_PUBLIC . "</button>";
		echo "<button id=\"tabUsage\" type=\"button\" role=\"tab\" aria-controls=\"panelUsage\" aria-selected=\"false\" class=\"menu_button\" onclick=\"javascript:usage_templates_template(); panelTabClicked('tabUsage');\">" . WORKSPACE_LIBRARY_USAGE . "</button>";
		echo "<button id=\"tabPeer\" type=\"button\" role=\"tab\" aria-controls=\"panelPeer\" aria-selected=\"false\" class=\"menu_button\" onclick=\"javascript:peer_templates_template(); panelTabClicked('tabPeer');\">" . WORKSPACE_LIBRARY_PEER . "</button>";
		echo "<button id=\"tabRss\" type=\"button\" role=\"tab\" aria-controls=\"panelRss\" aria-selected=\"false\" class=\"menu_button\" onclick=\"javascript:rss_templates_template(); panelTabClicked('tabRss');\">" . WORKSPACE_LIBRARY_RSS . "</button>";
		echo "<button id=\"tabXml\" type=\"button\" role=\"tab\" aria-controls=\"panelXml\" aria-selected=\"false\" class=\"menu_button\" onclick=\"javascript:xml_templates_template(); panelTabClicked('tabXml');\">" . WORKSPACE_LIBRARY_XML . "</button>";
		echo "</div>";
		
		echo "<div id=\"sub_dynamic_area\">";
		echo "<div id=\"panelMyProjects\" class=\"tabPanel\" role=\"tabpanel\" aria-labelledby=\"tabMyProjects\"></div>";
		echo "<div id=\"panelShared\" class=\"tabPanel\" role=\"tabpanel\" aria-labelledby=\"tabShared\"></div>";
		echo "<div id=\"panelPublic\" class=\"tabPanel\" role=\"tabpanel\" aria-labelledby=\"tabPublic\"></div>";
		echo "<div id=\"panelUsage\" class=\"tabPanel\" role=\"tabpanel\" aria-labelledby=\"tabUsage\"></div>";
		echo "<div id=\"panelPeer\" class=\"tabPanel\" role=\"tabpanel\" aria-labelledby=\"tabPeer\"></div>";
		echo "<div id=\"panelRss\" class=\"tabPanel\" role=\"tabpanel\" aria-labelledby=\"tabRss\"></div>";
		echo "<div id=\"panelXml\" class=\"tabPanel\" role=\"tabpanel\" aria-labelledby=\"tabXml\"></div>";
		echo "</div>";
		
		echo "</div>";
		
		echo '<script type="text/javascript">my_templates_template();</script>';
		
	}
	
	function workspace_fail() {
		
		echo "<h2 class=\"header\">" . WORKSPACE_LIBRARY_MY . "</h2>";

		echo "<div id=\"mainContent\">";
		
		echo "<p>" . WORKSPACE_LIBRARY_ERROR . "</p>";
		
		echo "</div>";
		
	}

?>
