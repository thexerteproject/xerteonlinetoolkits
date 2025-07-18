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
require_once("../display_library.php");
require_once("../user_library.php");

if(empty($_SESSION['toolkits_logon_id'])) {
            die("Please login");
}

$_SESSION['sort_type'] = $_POST['sort_type'];

$start = time();
$workspace = get_users_projects($_SESSION['sort_type']);
_debug("get_users_projects of {$_SESSION['toolkits_logon_username']} took " . (time() - $start) . " seconds");
echo $workspace;

