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
require_once("../template_status.php");
require_once("../url_library.php");
require_once("../properties/properties_library.php");

if(empty($_SESSION['toolkits_logon_id'])) {
            die("Please login");
}

$info = new stdClass();
$info->properties = project_info($_POST['template_id']);
$info->properties .= media_quota_info($_POST['template_id']);
$info->properties .= access_info($_POST['template_id']);
$info->properties .= sharing_info($_POST['template_id']);

$sql = "SELECT template_id, user_id, firstname, surname, role FROM " .
    " {$xerte_toolkits_site->database_table_prefix}templaterights, {$xerte_toolkits_site->database_table_prefix}logindetails WHERE " .
    " {$xerte_toolkits_site->database_table_prefix}logindetails.login_id = {$xerte_toolkits_site->database_table_prefix}templaterights.user_id and template_id= ? and user_id = ?";

$row = db_query_one($sql, array($_POST['template_id'], $_SESSION['toolkits_logon_id']));
$info->role = $row['role'];

echo json_encode($info);

//$info = get_project_info($_POST['template_id']);
//echo $info;
