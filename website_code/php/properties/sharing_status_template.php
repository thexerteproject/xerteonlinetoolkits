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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
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


$sql = "SELECT template_id, user_id, firstname, surname, role FROM " .
    " {$xerte_toolkits_site->database_table_prefix}templaterights, {$xerte_toolkits_site->database_table_prefix}logindetails WHERE " .
    " {$xerte_toolkits_site->database_table_prefix}logindetails.login_id = {$xerte_toolkits_site->database_table_prefix}templaterights.user_id and template_id= ? AND user_id != ?";

$query_sharing_rows = db_query($sql, array($_POST['template_id'], $_SESSION['toolkits_logon_id']));

/*
 * show a different view if you are the file creator
 */

if(is_user_creator((int) $_POST['template_id'])){

    echo "<div>";
    echo "<p class=\"header\"><span>" . PROPERTIES_TAB_SHARED . "</span></p>";
    echo "<p><span>" . SHARING_INSTRUCTION . "</span></p>";
    echo "<form id=\"share_form\"><input name=\"searcharea\" onkeyup=\"javascript:name_select_template()\" type=\"text\" size=\"20\" /></form>";
    echo "<div id=\"area2\"><p>" . SHARING_NAMES . "</p></div>";
    echo "<p id=\"area3\">";
    echo "</div>";	
}

/*
 * find out how many times it has been shares (analgous to number of rows for this template)
 */

if(sizeof($query_sharing_rows)==0){
    echo "<p class=\"share_files_paragraph\"><span>" . SHARING_NOT_SHARED . "</span</p>";
    exit(0);
}


echo "<p class=\"share_intro_p\"><span>" . SHARING_CURRENT . "</span></p>";

foreach($query_sharing_rows as $row) { 

    echo "<p class=\"share_files_paragraph\"><span>" . $row['firstname'] . " " . $row['surname'] . " (" . $row['role'] . ")</span></p>"; 

    if($row['role']!="creator"){

        if(is_user_creator($_POST['template_id'])){

            echo "<p class=\"share_files_paragraph\">";

            if($row['role']=="editor"){

                echo "<img src=\"website_code/images/TickBoxOn.gif\" style=\"\" class=\"share_files_img\" /> " . SHARING_EDITOR;

            }else{

                echo "<img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:set_sharing_rights_template('editor', '" . $row['template_id'] . "','" . $row['user_id'] . "')\" class=\"share_files_img\" /> " . SHARING_EDITOR;

            }

            if($row['role']=="read-only"){

                echo "<img src=\"website_code/images/TickBoxOn.gif\" class=\"share_files_img\" /> " . SHARING_READONLY;

            }else{

                echo "<img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:set_sharing_rights_template('read-only', '" . $row['template_id'] . "','" . $row['user_id'] . "')\" class=\"share_files_img\" /> " . SHARING_READONLY;
            }

            echo "</p>";

            echo "<p>" . SHARING_REMOVE_DESCRIPTION . "</p>";

            echo "<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_sharing_template('" . $row['template_id'] . "','" . $row['user_id'] . "',false)\" style=\"vertical-align:middle\" >" . SHARING_REMOVE . "</button>";

            echo "<p class=\"share_border\"></p>";

        }

    }

}

if(!is_user_creator($_POST['template_id'])&&!is_user_admin()){

    echo "<p><a href=\"javascript:delete_sharing_template('" . $_POST['template_id'] . "','" . $_SESSION['toolkits_logon_id'] . "',true)\">" . SHARING_STOP . "</a></p>";

}



