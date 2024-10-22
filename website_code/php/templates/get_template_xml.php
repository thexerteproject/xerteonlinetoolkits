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

$full_unsafe_file_path = x_convert_user_area_url_to_path($unsafe_file_path);
x_check_path_traversal($full_unsafe_file_path, $xerte_toolkits_site->users_file_area_full, "Invalid file specified");

// Make sure we're actually serving an xml file
if (strtolower(substr($full_unsafe_file_path, -4)) !== '.xml') {
    echo "Not found!";
    exit;
}
echo file_get_contents($full_unsafe_file_path);
