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

// Calls the function from the display library

require_once("../../../config.php");

_load_language_file("/website_code/php/properties/media_and_quota_template.inc");
_load_language_file("/website_code/php/properties/sharing_status_template.inc");

_load_language_file("/properties.inc");


require_once("../display_library.php");
require_once("../user_library.php");
require_once("../url_library.php");
require_once("../properties/properties_library.php");
require_once("../folder_status.php");

if(empty($_SESSION['toolkits_logon_id'])) {
            die("Please login");
}

$info = new stdClass();
$info->folder_id = $_POST['folder_id'];
$_SESSION["XAPI_PROXY"] = $_POST['folder_id'];
$info->properties = folder_info($_POST['folder_id']);
$info->properties .= folder_sharing_info($_POST['folder_id']);

//$sql = "SELECT role FROM " .
//    " {$xerte_toolkits_site->database_table_prefix}folderrights, {$xerte_toolkits_site->database_table_prefix}logindetails WHERE " .
//    " {$xerte_toolkits_site->database_table_prefix}logindetails.login_id = {$xerte_toolkits_site->database_table_prefix}folderrights.login_id and folder_id= ? and login_id = ?";
//
//$row = db_query_one($sql, array($_POST['folder_id'], $_SESSION['toolkits_logon_id']));

$info->role = get_user_access_rights_folder($_POST['folder_id']);

echo json_encode($info);
