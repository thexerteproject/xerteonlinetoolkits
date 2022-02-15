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

if(!is_numeric($_POST['template_id'])){
    echo "<p>" . SHARING_FAIL . "</p>";
    exit(0);
}


if(!has_rights_to_this_template($_POST['template_id'], $_SESSION['toolkits_logon_id']) && !is_user_admin()) {
    echo "<p>" . SHARING_FAIL . "</p>";
    exit(0);
}
$template_id = $_POST['template_id'];

/*
 * show a different view if you are the file creator
 */

if(is_user_creator_or_coauthor((int) $template_id)){

    echo "<div>";
    echo "<p class=\"header\"><span>" . PROPERTIES_TAB_SHARED . "</span></p>";
    echo "<p><span>" . SHARING_INSTRUCTION . "</span></p>";
    echo "<div id=\"rolebutton\">" .
        "<input type=\"radio\" name=\"role\" value=\"co-author\">" .
        SHARING_COAUTHOR .
        "<input type=\"radio\" name=\"role\" value=\"editor\"checked>" .
        SHARING_EDITOR .
        "<input type=\"radio\" name=\"role\" value=\"read-only\">" .
        SHARING_READONLY .
        "</div>";

    echo "<form id=\"share_form\"><input name=\"searcharea\" onkeyup=\"javascript:name_select_template()\" type=\"text\" size=\"20\" /></form>";
    echo "<div id=\"area2\"><p>" . SHARING_NAMES . "</p></div>";
    echo "<p id=\"area3\">";
    echo "</div>";
}



/*
 * find out how many times it has been shares (analgous to number of rows for this template)
 */

$sql = "SELECT template_id, user_id, firstname, surname, username, role FROM " .
    " {$xerte_toolkits_site->database_table_prefix}templaterights, {$xerte_toolkits_site->database_table_prefix}logindetails WHERE " .
    " {$xerte_toolkits_site->database_table_prefix}logindetails.login_id = {$xerte_toolkits_site->database_table_prefix}templaterights.user_id and template_id= ? AND user_id != ?";

$query_sharing_rows = db_query($sql, array($template_id, $_SESSION['toolkits_logon_id']));


$sql = "SELECT ug.group_id, group_name, role FROM " .
    " {$xerte_toolkits_site->database_table_prefix}template_group_rights tgr, {$xerte_toolkits_site->database_table_prefix}user_groups ug WHERE ".
    "tgr.group_id = ug.group_id and template_id= ?";

$query_sharing_rows_group = db_query($sql, array($template_id));
if(sizeof($query_sharing_rows)==0 && sizeof($query_sharing_rows_group)==0){
    echo "<p class=\"share_files_paragraph\"><span>" . SHARING_NOT_SHARED . "</span></p>";
    exit(0);
}

echo "<p class=\"share_intro_p\"><span>" . SHARING_CURRENT . "</span></p>";


if(is_user_creator_or_coauthor($template_id)){
    foreach($query_sharing_rows_group as $row) {
        echo "<p class=\"share_files_paragraph\"><span>" . $row['group_name'] . " - (" . $row['role'] . ")</span></p>";

        echo '<p class=\"share_files_paragraph\">' .
            '<input type="radio" name="role' . $row['group_id'] .'_g" value="co-author" ' . ($row['role'] == 'co-author' ? "checked": "") . ' onclick="javascript:set_sharing_rights_template(\'co-author\', \''. $template_id . '\',\'' . $row['group_id'] . '\', group=true)">'.
            SHARING_COAUTHOR .
            '<input type="radio" name="role' . $row['group_id'] .'_g" value="editor" ' . ($row['role'] == 'editor' ? "checked": "") . ' onclick="javascript:set_sharing_rights_template(\'editor\', \''. $template_id . '\',\'' . $row['group_id'] . '\', group=true)">'.
            SHARING_EDITOR .
            '<input type="radio" name="role' . $row['group_id'] .'_g" value="read-only" ' . ($row['role'] == 'read-only' ? "checked": "") . ' onclick="javascript:set_sharing_rights_template(\'read-only\', \''. $template_id . '\',\'' . $row['group_id'] . '\', group=true)">'.
            SHARING_READONLY .
            "</p>";

        echo "<p>" . SHARING_REMOVE_DESCRIPTION . "</p>";
        echo "&nbsp;<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_sharing_template('" . $template_id . "','" . $row['group_id'] . "',false, group=true)\" style=\"vertical-align:middle\" ><i class=\"fa fa-times\"></i>&nbsp;" . SHARING_REMOVE . "</button>";

        echo "<p class=\"share_border\"></p>";
    }
}


foreach($query_sharing_rows as $row) {

    echo "<p class=\"share_files_paragraph\"><span>" . $row['firstname'] . " " . $row['surname'] . " (" . $row['username'] .") - (" . $row['role'] . ")</span></p>";

    if($row['role']!="creator") {

        if (is_user_creator_or_coauthor($template_id)) {

            echo '<p class=\"share_files_paragraph\">' .
                '<input type="radio" name="role' . $row['user_id'] . '" value="co-author" ' . ($row['role'] == 'co-author' ? "checked" : "") . ' onclick="javascript:set_sharing_rights_template(\'co-author\', \'' . $template_id . '\',\'' . $row['user_id'] . '\')">' .
                SHARING_COAUTHOR .
                '<input type="radio" name="role' . $row['user_id'] . '" value="editor" ' . ($row['role'] == 'editor' ? "checked" : "") . ' onclick="javascript:set_sharing_rights_template(\'editor\', \'' . $template_id . '\',\'' . $row['user_id'] . '\')">' .
                SHARING_EDITOR .
                '<input type="radio" name="role' . $row['user_id'] . '" value="read-only" ' . ($row['role'] == 'read-only' ? "checked" : "") . ' onclick="javascript:set_sharing_rights_template(\'read-only\', \'' . $template_id . '\',\'' . $row['user_id'] . '\')">' .
                SHARING_READONLY .
                "</p>";

            echo "<p>" . SHARING_REMOVE_DESCRIPTION . "</p>";

            echo "&nbsp;<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_sharing_template('" . $template_id . "','" . $row['user_id'] . "',false)\" style=\"vertical-align:middle\" ><i class=\"fa fa-user-times\"></i>&nbsp;" . SHARING_REMOVE . "</button>";

            echo "<p class=\"share_border\"></p>";

        }

    }
    else{
        echo "<p class=\"share_files_paragraph\">" . SHARING_CREATOR . "</p>";
        echo "<p class=\"share_border\"></p>";
    }

}

if(!is_user_creator($_POST['template_id'])&&!is_user_admin()){

    echo "<p><a href=\"javascript:delete_sharing_template('" . $_POST['template_id'] . "','" . $_SESSION['toolkits_logon_id'] . "',true)\">" . SHARING_STOP . "</a></p>";

}



