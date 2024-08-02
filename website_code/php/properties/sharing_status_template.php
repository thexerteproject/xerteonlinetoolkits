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
 * sharing status template, shows who is sharing a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/sharing_status_template.inc");
_load_language_file("/properties.inc");

include "../template_status.php";
include "../user_library.php";



if(!isset($_POST['template_id'])){
	echo "<h2 class=\"header\">" . PROPERTIES_TAB_SHARED . "</h2>";
	echo "<div id=\"mainContent\">";
    echo "<p>" . SHARING_FAIL . "</p>";
	echo "</div>";
    exit(0);
}

$template_id = x_clean_input($_POST['template_id'], 'numeric');

if(!has_rights_to_this_template($template_id, $_SESSION['toolkits_logon_id']) && !is_user_permitted("projectadmin")) {
    echo "<h2 class=\"header\">" . PROPERTIES_TAB_SHARED . "</h2>";
	echo "<div id=\"mainContent\">";
    echo "<p>" . SHARING_FAIL . "</p>";
	echo "</div>";
    exit(0);
}
echo "<h2 class=\"header\">" . PROPERTIES_TAB_SHARED . "</h2>";
echo "<div id=\"mainContent\">";

/*
 * show a different view if you are the file creator
 */

if(is_user_creator_or_coauthor($template_id) || is_user_permitted("projectadmin")){
	
	echo "<p>" . SHARING_INSTRUCTION . "</p>";
	
    echo "<form id=\"share_form\">";
	
	echo "<label class=\"block\" for=\"searcharea\">" . SHARING_NAME_LABEL . ":</label>";
    echo "<input id=\"searcharea\" name=\"searcharea\" onkeyup=\"javascript:name_select_template()\" type=\"text\" size=\"20\" />";
	
	echo "<fieldset id=\"rolebutton\" class=\"plainFS\">" .
		"<legend>" . SHARING_ROLE_LABEL . ":</legend>" .
        "<div><input type=\"radio\" name=\"role\" id=\"co-author\" value=\"co-author\">" .
        "<label for=\"co-author\">" . SHARING_COAUTHOR . "</label></div>" .
        "<div><input type=\"radio\" name=\"role\" id=\"editor\" value=\"editor\"checked>" .
		"<label for=\"editor\">" . SHARING_EDITOR . "</label></div>" .
        "<div><input type=\"radio\" name=\"role\" id=\"read-only\" value=\"read-only\">" .
		"<label for=\"read-only\">" . SHARING_READONLY . "</label></div>" .
        "</fieldset>";
	
	echo "</form>";
    echo "<div id=\"area2\"><p><span class=\"placeholderTxt\">" . SHARING_NAMES . "</span></p></div>";
    echo "<p id=\"area3\">";
}



/*
 * find out how many times it has been shares (analgous to number of rows for this template)
 */

$sql = "SELECT template_id, user_id, firstname, surname, username, role FROM " .
    " {$xerte_toolkits_site->database_table_prefix}templaterights, {$xerte_toolkits_site->database_table_prefix}logindetails WHERE " .
    " {$xerte_toolkits_site->database_table_prefix}logindetails.login_id = {$xerte_toolkits_site->database_table_prefix}templaterights.user_id and template_id= ? AND user_id != ? ";

$query_sharing_rows = db_query($sql, array($template_id, $_SESSION['toolkits_logon_id']));


$sql = "SELECT ug.group_id, group_name, role FROM " .
    " {$xerte_toolkits_site->database_table_prefix}template_group_rights tgr, {$xerte_toolkits_site->database_table_prefix}user_groups ug WHERE ".
    "tgr.group_id = ug.group_id and template_id= ?";

$query_sharing_rows_group = db_query($sql, array($template_id));
if(sizeof($query_sharing_rows)==0 && sizeof($query_sharing_rows_group)==0){
    echo "<p class=\"share_files_paragraph\"><span>" . SHARING_NOT_SHARED . "</span></p></div>";
    exit(0);
}

echo "<p class=\"share_intro_p\"><span>" . SHARING_CURRENT . "</span></p>";

echo "<ul class='share_users " . (is_user_creator_or_coauthor($template_id)|| is_user_permitted("projectadmin") ? "" : "show_list") . "'>";

foreach($query_sharing_rows_group as $row) {
	
	echo "<li>" . $row['group_name'];
	
	if(is_user_creator_or_coauthor($template_id)|| is_user_permitted("projectadmin")){
		
		echo ' <label class="sr-only" for="groupRole_' . $row['group_id'] . '">' . SHARING_ROLE_LABEL . ' (' . $row['group_name'] . ')</label>' .
			'<select name="groupRole_' . $row['group_id'] . '" id="groupRole_' . $row['group_id'] . '" onchange="set_sharing_rights_template(\'' . $template_id . '\', \'' . $row['group_id']. '\', true)">' .
			'<option value="co-author_' . $row['group_id'] . '" ' . ($row['role'] == 'co-author' ? "selected" : "") . '>' . SHARING_COAUTHOR . '</option>' .
			'<option value="editor_' . $row['group_id'] . '" ' . ($row['role'] == 'editor' ? "selected" : "") . '>' . SHARING_EDITOR . '</option>' .
			'<option value="read-only_' . $row['group_id'] . '" ' . ($row['role'] == 'read-only' ? "selected" : "") . '>' . SHARING_READONLY . '</option>' .
			'</select>';

		echo "&nbsp;<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_sharing_template('" . $template_id . "','" . $row['group_id'] . "',false,true)\" ><i class=\"fa fa-times\"></i> " . SHARING_REMOVE . "<span class=\"sr-only\"> (" . $row['group_name'] . ")</span></button>";
		
    } else {
		
		echo ' - ' . $row['role'];
	}
	
	echo "</li>";
}

foreach($query_sharing_rows as $row) {

    echo "<li>" . $row['firstname'] . " " . $row['surname'] . " (" . $row['username'] .")";

    if($row['role']!="creator") {

        if (is_user_creator_or_coauthor($template_id)|| is_user_permitted("projectadmin")) {
			
            echo ' <label class="sr-only" for="role_' . $row['user_id'] . '">' . SHARING_ROLE_LABEL . ' (' . $row['firstname'] . " " . $row['surname'] . " - " . $row['username'] . ')</label>' .
				'<select name="role_' . $row['user_id'] . '" id="role_' . $row['user_id'] . '" onchange="set_sharing_rights_template(\'' . $template_id . '\', \'' . $row['user_id']. '\', false)">' .
                '<option value="co-author_' . $row['user_id'] . '" ' . ($row['role'] == 'co-author' ? "selected" : "") . '>' . SHARING_COAUTHOR . '</option>' .
                '<option value="editor_' . $row['user_id'] . '" ' . ($row['role'] == 'editor' ? "selected" : "") . '>' . SHARING_EDITOR . '</option>' .
				'<option value="read-only_' . $row['user_id'] . '" ' . ($row['role'] == 'read-only' ? "selected" : "") . '>' . SHARING_READONLY . '</option>' .
				'</select>';

            echo "&nbsp;<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_sharing_template('" . $template_id . "','" . $row['user_id'] . "',false,false)\" ><i class=\"fa fa-times\"></i> " . SHARING_REMOVE . "<span class=\"sr-only\"> (" . $row['firstname'] . " " . $row['surname'] . " - " . $row['username'] . ")</span></button>";

        } else {
			
			echo ' - ' . $row['role'];
		}

    }
    else {
        echo " - " . $row['role'];
    }
	
	echo "</li>";

}

echo "</ul>";

if(!is_user_creator($template_id)&&!is_user_permitted("projectadmin")){

    echo "<p>" . SHARING_STOP_INSTRUCTIONS . " <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_sharing_template('" . $template_id . "','" . $_SESSION['toolkits_logon_id'] . "',true,false)\"><i class=\"fa fa-times\"></i> " . SHARING_STOP . "</button></p>";

}

echo "</div>";
