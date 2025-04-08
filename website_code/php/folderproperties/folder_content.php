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
 * folder content page, used by the site to display a folder's contents
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */


require_once("../../../config.php");
include "../folder_status.php";
include "../user_library.php";

_load_language_file("/website_code/php/folderproperties/folder_content.inc");


include "../display_library.php";

echo "<h2 class=\"header\">" . FOLDER_CONTENT_TEMPLATE_CONTENTS . "</h2>";

echo "<div id=\"mainContent\">";

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
	
	echo "<p>" . FOLDER_CONTENT_FAIL . "</p>";
	echo "</div>";
	
    die();
}

/**
 * connect to the database
 */

if (!isset($_POST['folder_id']))
{
    echo "<p>" . FOLDER_CONTENT_FAIL . "</p>";
    echo "</div>";
    exit(0);
}

$folder_id = x_clean_input($_POST['folder_id'], 'numeric');

if(has_rights_to_this_folder($folder_id, $_SESSION['toolkits_logon_id']) || is_user_permitted("project")){
	echo "<ul class=\"dynamic_area_folder\">";
	
    list_folder_contents_event_free($folder_id);
	
    echo "</ul>";
    
}else{
    echo "<p>" . FOLDER_CONTENT_FAIL . "</p>";
}

echo "</div>";
