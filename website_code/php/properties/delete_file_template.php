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
 * delete file template, allows the site to delete files from the media folder
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

include "../error_library.php";
include "../../../config.php";

if (!isset($_SESSION['toolkits_logon_id']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

if (!isset($_POST['file']))
{
    _debug("No file specified");
    die("No file specified");
}

$filename = x_clean_input($_POST['file']);
$filename = urldecode($filename);

// Check whether the file does not have path traversal
x_check_path_traversal($filename, $xerte_toolkits_site->users_file_area_full, "Invalid file specified");

if(unlink($filename)){
    receive_message($_SESSION['toolkits_logon_username'], "FILE", "SUCCESS", "The file " . $_POST['file'] . "has been deleted", "User " . $_SESSION['toolkits_logon_username'] . " has deleted " . $_POST['file']);
}else{
    receive_message($_SESSION['toolkits_logon_username'], "FILE", "MAJOR", "The file " . $_POST['file'] . "hasn't been deleted", "User " . $_SESSION['toolkits_logon_username'] . " was not deleted " . $_POST['file']);
}
