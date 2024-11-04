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
 * template close, code that runs when an editor window is closed to remove the lock file
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once('../../../config.php');

if(empty($_SESSION) || !isset($_SESSION['toolkits_logon_id'])) {
    die("Session expired; please login again.");
}

_load_language_file("/website_code/php/versioncontrol/template_close.inc");

require('../template_status.php');

$users_array = array();

$file_path = x_clean_input($_POST['file_path']);
$temp_array = explode("-", $file_path);

$lockfile_path = $xerte_toolkits_site->users_file_area_full . $file_path;
x_check_path_traversal($lockfile_path, $xerte_toolkits_site->users_file_area_full, "Invalid file path");
$lockfile_path = $lockfile_path . "lockfile.txt";

if (count($temp_array) !== 3)
{
    // assum $temmp_array[0] is template_id
    if (is_numeric($temp_array[0]))
    {
        $prefix = $xerte_toolkits_site->database_table_prefix;
        $template_row = db_query_one("Select ld.username, otd.template_name as template_type, td.template_name from {$prefix}templatedetails td, {$prefix}originaltemplatesdetails otd, {$prefix}logindetails ld WHERE td.template_id = ? and otd.template_type_id=td.template_type_id and ld.login_id=td.creator_id", array($temp_array[0]));
        if ($template_row !== false && $template_row !== null)
        {
            $temp_array[1] = $template_row['username'];
            $temp_array[2] = $template_row['template_type'] . '/';
            $temp_array[3] = $template_row['template_name'];
            $file_path =  $temp_array[0] . "-" . $temp_array[1] . "-" . $temp_array[2];
        }
        else
        {
            die("template {$temp_array[0]} not found");
        }
    }
    else
    {
        die("invalid input");
    }
}

database_connect("template close success","template close fail");

if(file_exists($lockfile_path)){

    /*
     *  Code to delete the lock file
     */

    _debug("Detected lockfile on closing " . $file_path);

    if (count($temp_array) == 4) {
        $template_name = $temp_array[3];
    } else {
        $row_template_name = db_query_one("Select template_name from {$xerte_toolkits_site->database_table_prefix}templatedetails WHERE template_id = ?", array($temp_array[0]));
        $template_name =  $row_template_name['template_name'];
    }

    $lock_file_data = file_get_contents($lockfile_path);

    $temp = explode("*", $lock_file_data);

    $lock_file_creator = $temp[0];

    $user_list = $temp[1];

    $users = explode(",", $user_list);

    /*
     * Email users in the lock file
     */

    if (strlen($xerte_toolkits_site->email_to_add_to_username) > 0) {
        $mail_domain = '@' . $xerte_toolkits_site->email_to_add_to_username;
    } else {
        $mail_domain = '';
    }

    for($x=0;$x!=count($users)-1;$x++){

	// get just the username
	$userdata = explode(" ", $users[$x]);
	$username = $userdata[0];

	// check if a message has already been sent to this user
	if (isset($users_array[$username])) {
		continue;
	}
	else {
		$users_array[$username] = 1;
	}

        mail($username . $mail_domain, "File available - \"" . str_replace("_"," ",$template_name) ."\"", "Hello, <br><br> This is to notify you that the Xerte file \"" . str_replace("_"," ",$template_name) . "\" has become available for editing. The file was made available at " . date("h:i a") . " on " . date("l, jS F") . " <br><br> Please note that multiple attempts to edit the file may have been made, and as such you may not be the only person to have received one of these notifications. For that reason the file may soon become locked again by another user.<br><br> Please log into the site at <a href=\"" . $xerte_toolkits_site->site_url . "\">" . $xerte_toolkits_site->site_url . "</a>. <br><br> Thank you, <br><br> the Xerte Online toolkits team", get_email_headers());

    }

    unlink($lockfile_path);

    _debug("Lockfile " . $xerte_toolkits_site->users_file_area_full . $file_path . "lockfile.txt" . " is deleted.");
}

/*
 * Code to check to see if we should warn on a publish
 */

if(is_user_an_editor($temp_array[0],$_SESSION['toolkits_logon_id'])){

    $prefix = $xerte_toolkits_site->users_file_area_full . $file_path;
    x_check_path_traversal($prefix, $xerte_toolkits_site->users_file_area_full, "Invalid file path");
    $preview_file = $prefix . '/preview.xml';
    $data_file = $prefix . '/data.xml';

    if(file_exists($preview_file) && file_exists($data_file)) { 
        $preview_xml = file_get_contents($preview_file);
        $data_xml = file_get_contents($data_file);
        if($data_xml!=$preview_xml){
            echo TEMPLATE_CLOSE_QUESTION . "~*~" . $xerte_toolkits_site->users_file_area_full . $file_path . "~*~" . $temp_array[0];
        }
    }
}



