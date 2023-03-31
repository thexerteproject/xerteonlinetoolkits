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

if(empty($_SESSION['toolkits_logon_id'])) {
            die("Please login");
}

require_once("../properties/properties_library.php");

$info = new stdClass();
$info->group_name = $_POST['group_name'];
$info->group_id = $_POST['group_id'];
$info->properties = group_info($info->group_id);

//$sql = "SELECT role FROM " .
//    " {$xerte_toolkits_site->database_table_prefix}folderrights, {$xerte_toolkits_site->database_table_prefix}logindetails WHERE " .
//    " {$xerte_toolkits_site->database_table_prefix}logindetails.login_id = {$xerte_toolkits_site->database_table_prefix}folderrights.login_id and folder_id= ? and login_id = ?";
//
//$row = db_query_one($sql, array($_POST['folder_id'], $_SESSION['toolkits_logon_id']));

echo json_encode($info);
