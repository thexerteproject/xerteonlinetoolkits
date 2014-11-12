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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
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

if(is_user_creator($_POST['template_id'])){

    echo "<div>";
		echo "<p class=\"header\"><span>" . PROPERTIES_TAB_GIVE . "</span></p>";
		echo "<p <span>" . GIFT_INSTRUCTIONS . "</span></p>";
		echo "<form id=\"share_form\"><input name=\"searcharea\" onkeyup=\"javascript:name_select_gift_template()\" type=\"text\" size=\"20\" /></form>";
		echo "<div id=\"area2\"><p>" . GIFT_NAMES . "</p></div><p id=\"area3\">";
		echo "</div>";	

}else{

    echo "<p>" . GIFT_FAIL . "</p>";

}


?>
