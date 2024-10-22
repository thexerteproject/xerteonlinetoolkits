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
 * new_templates, allows the site to create a new user
 *
 * @author Patrick Lockley
 * @version 1.0
 * 
 * @package
 */

require_once("../../../config.php");

require_once("../user_library.php");
require_once("../template_library.php");
require_once("../file_library.php");

if(empty($_SESSION['toolkits_logon_id'])) {
    die("Please login");
}

/*
 * get the root folder for this user
 */

database_connect("New template connect","new template fail");

$root_folder_id = get_user_root_folder();

if (isset($_POST["folder_id"]) && strlen($_POST["folder_id"]) > 0)
{
    $folder_id = x_clean_input($_POST["folder_id"], 'numeric');
}
else
{
    $folder_id = $root_folder_id;
}

$templatename = x_clean_input($_POST['templatename']);
$tutorialname = x_clean_input($_POST['tutorialname']);

// Make sure template name and tutorial name just consists of letters, numbers, and underscores
if (!preg_match('/^[a-zA-Z0-9_]+$/', $templatename))
{
    die("Invalid template name");
}
if (!preg_match('/^[a-zA-Z0-9_ ]+$/', $tutorialname))
{
    die("Invalid project name");
}


/*
 * get the maximum id number from templates, as the id for this template
 */

$row_template_type = db_query_one("select template_type_id, template_name, parent_template, template_framework from {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails where template_name = ?", array($templatename));


/*
 * create the new template record in the database
 */
$extraflags = "";
if ($row_template_type['template_framework'] == 'xerte')
{
    if ( ($row_template_type['parent_template'] == 'multipersp') ||
        ($row_template_type['parent_template'] == 'mediaInteractions') ||
        ($row_template_type['parent_template'] == 'Rss') )
    {
        $extraflags = "engine=flash";
    }
    else
    {
        $extraflags = "engine=javascript";
    }
}

$query_for_new_template = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}templatedetails (creator_id, template_type_id, date_created, date_modified, number_of_uses, access_to_whom, template_name, extra_flags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$lastid = db_query($query_for_new_template, array($_SESSION['toolkits_logon_id'] , $row_template_type['template_type_id'] , date('Y-m-d H:i:s'), date('Y-m-d H:m:i'), 0, "Private", htmlspecialchars(str_replace(" ","_", $tutorialname)), $extraflags));

if($lastid !== false) {
    _debug("Created new template entry in db");
    $query_for_template_rights = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}templaterights (template_id, user_id, role, folder) VALUES (?,?,?,?)";
    $res = db_query($query_for_template_rights, array($lastid, $_SESSION['toolkits_logon_id'], "creator", "" . $folder_id));

    if($res !== false) {
        _debug("Setup template rights ok");
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Created new template record for the database", $query_for_new_template . " " . $query_for_template_rights);
        include $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . $row_template_type['template_framework']  . "/new_template.php";
        create_new_template($lastid, $templatename, $row_template_type['parent_template']);
        echo trim($lastid);
		echo "," . $xerte_toolkits_site->learning_objects->{$row_template_type['template_framework'] . "_" . $row_template_type['template_name']}->editor_size;
    }else{
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_template_rights);
        echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);
    }
}else{
    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_new_template);
    echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);
}
