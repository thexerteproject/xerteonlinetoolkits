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
 
require_once(dirname(__FILE__) . "/config.php");
require $xerte_toolkits_site->php_library_path . "user_library.php";
require $xerte_toolkits_site->php_library_path . "template_library.php";
require $xerte_toolkits_site->php_library_path . "template_status.php";

// be VERY paranoid over the path the user is requesting to download.
// Even if the file starts with a correct pattern (old implementation) the user could travers path
// like 542-tom-Notingham/../database.php or like 542-tom-Notingham/../../../../etc/passwd
$unsafe_file_path = x_clean_input($_GET['file']);

// Account for Windows, because realpath changes / to \
if(DIRECTORY_SEPARATOR !== '/') {
    $unsafe_file_path = str_replace('/', DIRECTORY_SEPARATOR, $unsafe_file_path);
}
$full_unsafe_file_path = $xerte_toolkits_site->users_file_area_full . $unsafe_file_path;
x_check_path_traversal($full_unsafe_file_path, $xerte_toolkits_site->users_file_area_full, "Not found!");

if (!preg_match('/^([0-9]+)-([a-z0-9]+)-([a-zA-Z0-9_]+)/', $unsafe_file_path, $matches)) {
    die("Path must start with a number, and then a username and then a template name - e.g. 20-foobar-Nottingham");
}

$template_id = $matches[1];
$username = $matches[2];

$has_perms = is_user_permitted("projectadmin") || is_user_an_editor($template_id, $_SESSION['toolkits_logon_id']);

if ($has_perms) {
    // they're logged in, and hopefully have access to the media contents.
    $file = $xerte_toolkits_site->users_file_area_full . $unsafe_file_path;
    if (!is_file($file)) {
        die("Fail: file not found on disk");
    }
    $filename = addslashes(basename($file));

    header("Cache-Control: public");
    header("Content-Length: " . filesize($file));
    header("Content-Description: File Transfer");
    header("Content-Type: application/force-download");
    header("Content-Disposition: attachment; filename=\"$filename\"");
    header("Content-Transfer-Encoding: binary");
    flush();
    readfile($file);
    exit(0);
}

echo "You do not appear to have permission to view this resource.";
