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

require_once("../../../config.php");

// Check that xml file is stored beneath root of project
// be VERY paranoid over the path the user is requesting to download.
// Even if the file starts with a correct pattern (old implementation) the user could travers path
// like 542-tom-Notingham/../database.php or like 542-tom-Notingham/../../../../etc/passwd
$unsafe_file_path = x_clean_input($_GET['file']);

// Make sure $_GET['file'] starts with $xerte_toolkits_site->users_file_area_short
if (strpos($unsafe_file_path, $xerte_toolkits_site->users_file_area_short) !== 0) {
    echo "Not found!";
    exit;
}

$full_unsafe_file_path = $xerte_toolkits_site->root_file_path . $unsafe_file_path;

// Account for Windows, because realpath changes / to \
if(DIRECTORY_SEPARATOR !== '/') {
    $full_unsafe_file_path = str_replace('/', DIRECTORY_SEPARATOR, $full_unsafe_file_path);
}
// This gets the canonical file name, so in case of 542-tom-Notingham/../../../../etc/passwd -> /etc/passwd
$realpath = realpath($full_unsafe_file_path);
// Check that is start with root_path/USER-FILES
if ($realpath !== false && $realpath === $full_unsafe_file_path) {
    // Make sure we're actually serving an xml file
    if (strtolower(substr($realpath, -4)) !== '.xml') {
        echo "Not found!";
        exit;
    }
    echo file_get_contents($realpath);
}
else{
    echo "Not found!";
}