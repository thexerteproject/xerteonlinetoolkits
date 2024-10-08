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

_load_language_file("/website_code/php/management/user_details_management.inc");

require("../user_library.php");

if(is_user_permitted("useradmin")){

    $database_id = database_connect("templates list connected","template list failed");

    $query="update {$xerte_toolkits_site->database_table_prefix}logindetails set firstname=?, surname=?, username=? WHERE login_id = ?";
    $params = array($_POST['firstname'], $_POST['surname'], $_POST['username'], $_POST['user_id']);

    $res =db_query($query, $params);
    if($res) {
        $msg = "User changes saved by user from " . $_SERVER['REMOTE_ADDR'];
        receive_message("", "SYSTEM", "MGMT", "Changes saved", $msg);

        echo USERS_UPDATE_SUCCESS;
    }else{
        echo USERS_UPDATE_FAIL;
    }
}
