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
 * sharing folder template, shows who is sharing a folder
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
include "../folder_status.php";

_load_language_file("/website_code/php/folderproperties/sharing_status_folder.inc");
_load_language_file("/folderproperties.inc");
include "../url_library.php";
include "../user_library.php";

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

$parameters = explode("_", $_POST['folder_id']);

$folder_id = $parameters[0];

if (!has_rights_to_this_folder($folder_id, $_SESSION['toolkits_logon_id']) || !is_numeric($folder_id) || !is_string($parameters[1])){
    echo "<p>" . SHARING_FAIL . "</p>";
    exit(0);
}

if(is_user_creator_or_coauthor_folder($folder_id) || is_user_admin()){
    echo "<div>";
    echo "<p class=\"header\"><span>" . FOLDERPROPERTIES_TAB_SHARED . "</span></p>";
    echo "<p><span>" . SHARING_INSTRUCTION . "</span></p>";
    echo "<div id=\"rolebutton\">" .
            "<input type=\"radio\" name=\"role\" value=\"co-author\">" .
                SHARING_COAUTHOR .
            "<input type=\"radio\" name=\"role\" value=\"editor\"checked>" .
                SHARING_EDITOR .
            "<input type=\"radio\" name=\"role\" value=\"read-only\">" .
                SHARING_READONLY .
        "</div>";

    echo "<form id=\"share_form\"><input name=\"searcharea\" onkeyup=\"javascript:name_select_folder()\" type=\"text\" size=\"20\" /></form>";
    echo "<div id=\"area2\"><p>" . SHARING_NAMES . "</p></div>";
    echo "<p id=\"area3\">";
    echo "</div>";
}


/*
 * find out how many times it has been shares (analgous to number of rows for this template)
 */


$sql = "SELECT ld.login_id, firstname, surname, username, role FROM " .
    " {$xerte_toolkits_site->database_table_prefix}folderrights fr, {$xerte_toolkits_site->database_table_prefix}logindetails ld WHERE ".
    "ld.login_id = fr.login_id and folder_id= ? AND fr.login_id != ?";

$query_sharing_rows = db_query($sql, array($folder_id, $_SESSION['toolkits_logon_id']));

$sql = "SELECT ug.group_id, group_name, role FROM " .
    " {$xerte_toolkits_site->database_table_prefix}folder_group_rights fgr, {$xerte_toolkits_site->database_table_prefix}user_groups ug WHERE ".
    "fgr.group_id = ug.group_id and folder_id= ?";

$query_sharing_rows_group = db_query($sql, array($folder_id));
if(sizeof($query_sharing_rows)==0 && sizeof($query_sharing_rows_group)==0){
    echo "<p class=\"share_files_paragraph\"><span>" . SHARING_NOT_SHARED . "</span></p>";
    exit(0);
}

echo "<p class=\"share_intro_p\"><span>" . SHARING_CURRENT . "</span></p>";

if(is_user_creator_or_coauthor_folder($folder_id)){
    foreach($query_sharing_rows_group as $row) {
        echo "<p class=\"share_files_paragraph\"><span>" . $row['group_name'] . " - (" . $row['role'] . ")</span></p>";

        echo '<p class=\"share_files_paragraph\">' .
            '<input type="radio" name="role' . $row['group_id'] .'_g" value="co-author" ' . ($row['role'] == 'co-author' ? "checked": "") . ' onclick="javascript:set_sharing_rights_folder(\'co-author\', \''. $folder_id . '\',\'' . $row['group_id'] . '\', group=true)">'.
            SHARING_COAUTHOR .
            '<input type="radio" name="role' . $row['group_id'] .'_g" value="editor" ' . ($row['role'] == 'editor' ? "checked": "") . ' onclick="javascript:set_sharing_rights_folder(\'editor\', \''. $folder_id . '\',\'' . $row['group_id'] . '\', group=true)">'.
            SHARING_EDITOR .
            '<input type="radio" name="role' . $row['group_id'] .'_g" value="read-only" ' . ($row['role'] == 'read-only' ? "checked": "") . ' onclick="javascript:set_sharing_rights_folder(\'read-only\', \''. $folder_id . '\',\'' . $row['group_id'] . '\', group=true)">'.
            SHARING_READONLY .
            "</p>";

        echo "<p>" . SHARING_REMOVE_DESCRIPTION . "</p>";

        echo "&nbsp;<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_sharing_folder('" . $folder_id . "','" . $row['group_id'] . "',false, group=true)\" style=\"vertical-align:middle\" ><i class=\"fa fa-times\"></i>&nbsp;" . SHARING_REMOVE . "</button>";

        echo "<p class=\"share_border\"></p>";
    }
}

foreach($query_sharing_rows as $row) {

    echo "<p class=\"share_files_paragraph\"><span>" . $row['firstname'] . " " . $row['surname'] . " (" . $row['username'] .") - (" . $row['role'] . ")</span></p>";

    if($row['role']!="creator"){

        if(is_user_creator_or_coauthor_folder($folder_id)){

            echo '<p class=\"share_files_paragraph\">' .
                '<input type="radio" name="role' . $row['login_id'] .'" value="co-author" ' . ($row['role'] == 'co-author' ? "checked": "") . ' onclick="javascript:set_sharing_rights_folder(\'co-author\', \''. $folder_id . '\',\'' . $row['login_id'] . '\')">'.
                SHARING_COAUTHOR .
                '<input type="radio" name="role' . $row['login_id'] .'" value="editor" ' . ($row['role'] == 'editor' ? "checked": "") . ' onclick="javascript:set_sharing_rights_folder(\'editor\', \''. $folder_id . '\',\'' . $row['login_id'] . '\')">'.
                SHARING_EDITOR .
                '<input type="radio" name="role' . $row['login_id'] .'" value="read-only" ' . ($row['role'] == 'read-only' ? "checked": "") . ' onclick="javascript:set_sharing_rights_folder(\'read-only\', \''. $folder_id . '\',\'' . $row['login_id'] . '\')">'.
                SHARING_READONLY .
            "</p>";

            echo "<p>" . SHARING_REMOVE_DESCRIPTION . "</p>";

            echo "&nbsp;<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_sharing_folder('" . $folder_id . "','" . $row['login_id'] . "',false)\" style=\"vertical-align:middle\" ><i class=\"fa fa-user-times\"></i>&nbsp;" . SHARING_REMOVE . "</button>";

            echo "<p class=\"share_border\"></p>";

        }

    }
    else
    {
        echo "<p class=\"share_files_paragraph\">" . SHARING_CREATOR . "</p>";
        echo "<p class=\"share_border\"></p>";
    }

}

if(!is_user_creator_folder($folder_id)&&!is_user_admin()){

    echo "<p><a href=\"javascript:delete_sharing_folder('" . $folder_id . "','" . $_SESSION['toolkits_logon_id'] . "',true)\">" . SHARING_STOP . "</a></p>";

}



