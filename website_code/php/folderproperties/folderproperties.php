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
 * folder properties template page, used by the site to display the default panel for the properties page
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
include "../folder_status.php";

_load_language_file("/website_code/php/folderproperties/folderproperties.inc");

include "../url_library.php";
include "../user_library.php";

echo "<h2 class=\"header\">" . FOLDER_PROPERTIES_PROPERTIES . "</h2>";

echo "<div id=\"mainContent\">";

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
	
	echo "<p>" . FOLDER_PROPERTIES_FAIL . "</p>";
	
	echo "</div>";
	
    die();
}


if(!isset($_POST['folder_id'])){

    echo "<p>" . FOLDER_PROPERTIES_FAIL . "</p>";

    echo "</div>";

    exit(0);
}

$folder_id =x_clean_input($_POST['folder_id'], 'numeric');
if(has_rights_to_this_folder($folder_id, $_SESSION['toolkits_logon_id']) || is_user_permitted("projectadmin")){

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $query_for_folder_name = "select folder_name from {$prefix}folderdetails where folder_id=?";
    $params = array($folder_id);

    $row_template_name = db_query_one($query_for_folder_name, $params);
	
    if(is_user_creator_or_coauthor_folder($folder_id)){

        echo "<form id=\"rename_form\" action=\"javascript:rename_folder('" .
			$_POST['folder_id'] ."', 'rename_form')\">"
			. "<label class=\"block\" for=\"newfoldername\">" . FOLDER_PROPERTIES_CALLED . ":</label>"
			. "<input type=\"text\" value=\"" . str_replace("_", " ", $row_template_name['folder_name']) . "\" name=\"newfoldername\" id=\"newfoldername\" />"
			. "<button type=\"submit\" class=\"xerte_button\" style=\"padding-left:5px;\" align=\"top\" ><i class=\"fa fa-floppy-o\"></i>&nbsp;" . FOLDER_PROPERTIES_BUTTON_SAVE . "</button>"
			. "</form>";

    } else {
		
		echo "<p>" . FOLDER_PROPERTIES_CALLED . ": " . str_replace("_", " ", $row_template_name['folder_name']) . "</p>";
		
	}
	
}else{
	
    echo "<p>" . FOLDER_PROPERTIES_FAIL . "</p>";
	
}

echo "</div>";