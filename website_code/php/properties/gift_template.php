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
 
/**
 * 
 * gif template, allows the site ti display the html for the gift panel
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/gift_template.inc");
_load_language_file("/properties.inc");

include "../template_status.php";
include "../user_library.php";

$database_id=database_connect("Sharing status template database connect success","Sharing status template database connect failed");

/*
 * show a different view if you are the file creator
 */ 

if(!is_numeric($_POST['template_id'])){
	echo "<h2 class=\"header\">" . PROPERTIES_TAB_SHARED . "</h2>";
	echo "<div id=\"mainContent\">";
    echo "<p>" . GIFT_ERROR . "</p>";
	echo "</div>";
    exit(0);
}


if(!has_rights_to_this_template($_POST['template_id'], $_SESSION['toolkits_logon_id']) && !is_user_permitted("projectadmin")) {
    echo "<h2 class=\"header\">" . PROPERTIES_TAB_SHARED . "</h2>";
	echo "<div id=\"mainContent\">";
    echo "<p>" . GIFT_ERROR . "</p>";
	echo "</div>";
    exit(0);
}

if(is_user_creator_or_coauthor($_POST['template_id']) || is_user_permitted("projectadmin")){
		
	echo "<h2 class=\"header\">" . PROPERTIES_TAB_GIVE . "</h2>";

	echo "<div id=\"mainContent\">";
	
	echo "<p>" . GIFT_INSTRUCTIONS . "</p>";
	
	echo "<form id=\"share_form\">";
	
	echo "<label id=\"searchareaLabel\" class=\"block\" for=\"searcharea\">" . GIFT_SEARCH_LABEL . ":</label>";
	
	echo "<input name=\"searcharea\" id=\"searcharea\" onkeyup=\"javascript:name_select_gift_template()\" type=\"text\" size=\"20\" /></form>";
	
	echo "<div id=\"area2\"><p><span class=\"placeholderTxt\">" . GIFT_NAMES . "</span></p></div><p id=\"area3\">";
	
	echo "</div>";	

}else{

	echo "<h2 class=\"header\">" . PROPERTIES_TAB_GIVE . "</h2>";
	
	echo "<div id=\"mainContent\">";
	
	echo "<p>" . GIFT_FAIL . "</p>";
	
	echo "</div>";

}


?>
