<?php

/**
 *
 * new_templates, allows the site to create a new user
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

require_once("../user_library.php");
require_once("../template_library.php");
require_once("../file_library.php");

/*
 * get the root folder for this user
 */

database_connect("New template connect","new template fail");

$root_folder_id = get_user_root_folder();

/*
 * get the maximum id number from templates, as the id for this template
 */

$maximum_template_id = get_maximum_template_number();
$new_template_id = $maximum_template_id + 1;

$row_template_type = db_query_one("select template_type_id, template_name, template_framework from {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails where template_name = ?", array($_POST['tutorialid']));

/*
 * create the new template record in the database
 */
$extraflags = "";
if ($row_template_type['template_framework'] == 'xerte')
{
    $extraflags = "engine=javascript";
}
$query_for_new_template = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}templatedetails (template_id, creator_id, template_type_id, date_created, date_modified, number_of_uses, access_to_whom, template_name, extra_flags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
$lastid = db_query($query_for_new_template, array($new_template_id, $_SESSION['toolkits_logon_id'] , $row_template_type['template_type_id'] , date('Y-m-d'), date('Y-m-d'), 0, "Private", str_replace(" ","_", $_POST['tutorialname']), $extraflags));

// templatedetails doesn't have a AI field, so $lastid returns always 0, check explicitly for false
if($lastid !== false) {
    _debug("Created new template entry in db");
    $query_for_template_rights = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}templaterights (template_id, user_id, role, folder) VALUES (?,?,?,?)";
    $lastid = db_query($query_for_template_rights, array($new_template_id, $_SESSION['toolkits_logon_id'], "creator", "" . $root_folder_id));

    // templaterights doesn't have a AI field, so $lastid returns always 0, check explicitly for false
    if($lastid !==false) {
        _debug("Setup template rights ok");
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Created new template record for the database", $query_for_new_template . " " . $query_for_template_rights);
        include $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . $row_template_type['template_framework']  . "/new_template.php";
        create_new_template($new_template_id, $_POST['tutorialid']);
        echo trim($new_template_id);
		echo "," . $xerte_toolkits_site->learning_objects->{$row_template_type['template_framework'] . "_" . $row_template_type['template_name']}->editor_size;
    }else{
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_template_rights);
        echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);
    }
}else{
    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create new template record for the database", $query_for_new_template);
    echo("FAILED-" . $_SESSION['toolkits_most_recent_error']);
}
