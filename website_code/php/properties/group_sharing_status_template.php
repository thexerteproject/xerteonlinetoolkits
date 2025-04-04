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
 * group sharing status template, shows with which groups this template is shared
 * and has functions to share this template with groups (as opposed to a single person as in sharing_status_template.php)
 *
 * @author Noud Liefrink
 * @version 1.0
 * @package
 * (adapted from sharing_status_template.php)
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/group_sharing_status_template.inc");
_load_language_file("/properties.inc");

include "../template_status.php";
include "../user_library.php";


$template_id = $_POST['template_id'];

if(!is_numeric($template_id)){
    echo "<p>" . SHARING_FAIL . "</p>";
    exit(0);
}


if(!has_rights_to_this_template($template_id, $_SESSION['toolkits_logon_id']) && !is_user_permitted("projectadmin")) {
    echo "<p>" . SHARING_FAIL . "</p>";
    exit(0);
}

$prefix = $xerte_toolkits_site->database_table_prefix;

$sql = "SELECT * FROM " .
    " {$prefix}user_groups WHERE group_id NOT IN ( "
        . "SELECT group_id from {$prefix}template_group_rights where template_id = ? ) order by group_name";

$user_groups = db_query($sql, array($template_id));

$sql = "SELECT ug.group_id, ug.group_name, tgr.role FROM " .
    "{$prefix}user_groups ug, {$prefix}template_group_rights tgr WHERE " .
    "ug.group_id = tgr.group_id and tgr.template_id= ? ORDER BY ug.group_name";

$query_sharing_rows = db_query($sql, array($template_id));


/*
 * show a different view if you are the file creator
 */

if(is_user_creator_or_coauthor((int) $template_id)){

    echo "<div>";
    echo "<p class=\"header\"><span>" . PROPERTIES_TAB_GROUP_SHARED . "</span></p>";
    echo "<p><span>" . SHARING_INSTRUCTION . "</span></p>";

    echo "<form name=\"user_groups\" action=\"javascript:group_share_this_template(" . $template_id . ")\">";
    echo "<select name=\"group\" id=\"group\">";
    foreach($user_groups as $group){
        echo "<option value=\"" . $group['group_id'] . "\">" . $group['group_name'] ."</option>";
    }
    echo "</select>";
    echo "<button type=\"submit\" class=\"xerte_button\"><i class=\"fas fa-user-plus\"></i>&nbsp;" . SHARING_ADD . "</button>";
    echo "</form>";

    echo "<p id=\"area2\">";
    echo "</div>";	
}

/*
 * find out how many times it has been shares (analogous to number of rows for this template)
 */

if(sizeof($query_sharing_rows)==0){
    echo "<p class=\"share_files_paragraph\"><span>" . SHARING_NOT_SHARED . "</span></p>";
    exit(0);
}


echo "<p class=\"share_intro_p\"><span>" . SHARING_CURRENT . "</span></p>";

foreach($query_sharing_rows as $row) { 

    echo "<p class=\"share_files_paragraph\"><span>" . $row['group_name'] . "</span></p>";

    if(is_user_creator_or_coauthor($template_id)){

        echo "<p class=\"share_files_paragraph\">";

        if($row['role']=="co-author"){

            echo "<img src=\"website_code/images/TickBoxOn.gif\" style=\"\" class=\"share_files_img\" /> " . SHARING_COAUTHOR;

        }else{

            echo "<img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:group_set_sharing_rights_template('co-author', '" . $template_id . "','" . $row['group_id'] . "')\" class=\"share_files_img\" /> " . SHARING_COAUTHOR;

        }

        if($row['role']=="editor"){

            echo "<img src=\"website_code/images/TickBoxOn.gif\" style=\"\" class=\"share_files_img\" /> " . SHARING_EDITOR;

        }else{

            echo "<img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:group_set_sharing_rights_template('editor', '" . $template_id . "','" . $row['group_id'] . "')\" class=\"share_files_img\" /> " . SHARING_EDITOR;

        }

        if($row['role']=="read-only"){

            echo "<img src=\"website_code/images/TickBoxOn.gif\" class=\"share_files_img\" /> " . SHARING_READONLY;

        }else{

            echo "<img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:group_set_sharing_rights_template('read-only', '" . $template_id . "','" . $row['group_id'] . "')\" class=\"share_files_img\" /> " . SHARING_READONLY;
        }

        echo "</p>";

        echo "<p>" . SHARING_REMOVE_DESCRIPTION . "</p>";

        echo "&nbsp;<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:group_delete_sharing_template('" . $template_id . "','" . $row['group_id'] . "',false)\" style=\"vertical-align:middle\" ><i class=\"fa fa-user-times\"></i>&nbsp;" . SHARING_REMOVE . "</button>";

        echo "<p class=\"share_border\"></p>";

    }

}

//if(!is_user_creator($_POST['template_id'])&&!is_user_permitted("projectadmin")){
//
//    echo "<p><a href=\"javascript:group_delete_sharing_template('" . $template_id . "','" . $_SESSION['toolkits_logon_id'] . "',true)\">" . SHARING_STOP . "</a></p>";
//
//}



