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
 * workspace templates template page, used displays the User created
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");

_load_language_file("/website_code/php/workspaceproperties/folder_rss_templates_template.inc");

include "../url_library.php";
include "../display_library.php";

/**
 * connect to the database
 */

$database_connect_id = database_connect("my_propertes_template.php connect success","my_properties_template.php connect failed");

$prefix = $xerte_toolkits_site->database_table_prefix;
$query_for_folder = "select * from {$prefix}folderdetails where login_id= ? AND folder_parent != ? ";
$params = array($_SESSION['toolkits_logon_id'], "0");

$query_folder_response = db_query($query_for_folder, $params);

echo "<h2 class=\"header\">" . FOLDER_RSS_TEMPLATE_MY . "</h2>";

echo "<div id=\"mainContent\">";

if($_SESSION['toolkits_logon_id']) {

	echo "<h3>" . FOLDER_RSS_TEMPLATE_MY_FEED . ":</h3>";

	echo "<ul class=\"rssLists\">";

	echo "<li><a href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_user", $_SESSION['toolkits_firstname'] . "_" . $_SESSION['toolkits_surname'] ) . "\" target=\"new\"> ";

	echo $_SESSION['toolkits_firstname'] . " " . $_SESSION['toolkits_surname'];

	echo "<span class=\"sr-only\">" . FOLDER_RSS_TEMPLATE_LINKS . "</span></a></li>";

	echo "</ul>";

	if(sizeof($query_folder_response)!=0){

		echo "<h3>" . FOLDER_RSS_TEMPLATE_MY_FOLDER_FEED . ":</h3>";
		
		echo "<ul class=\"rssLists\">";
		
		foreach($query_folder_response as $row_folder) {

			echo "<li><a href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_user", $_SESSION['toolkits_firstname'] . "_" . $_SESSION['toolkits_surname'] );

			if($xerte_toolkits_site->apache=="true"){

				echo "/" . str_replace("_"," ",$row_folder['folder_name']) . "/";

			}else{

				echo "&folder_name=" . str_replace("_"," ",$row_folder['folder_name']);

			}

			echo "\" target=\"new\">";
			
			echo str_replace("_"," ",$row_folder['folder_name']);

			echo "<span class=\"sr-only\">" . FOLDER_RSS_TEMPLATE_LINKS . "</span></a></li>";

		}
		
		echo "</ul>";
		
		echo "<p>" . FOLDER_RSS_TEMPLATE_LINKS_NEW . "</p>";

	}
	
} else {
	
	echo "<p>" . FOLDER_RSS_TEMPLATE_ERROR . "</p>";
	
}

echo "</div>";