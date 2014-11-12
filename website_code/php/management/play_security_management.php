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

_load_language_file("/website_code/php/management/play_security_management.inc");

require("../user_library.php");

if(is_user_admin()){

    $database_id = database_connect("play_security_management.php connected","play_security_management.php list failed");

    $query="update {$xerte_toolkits_site->database_table_prefix}play_security_details set security_setting=?, security_data=?, security_info=? WHERE security_id=?";
    $res = db_query($query, array($_POST['security'], $_POST['data'], $_POST['info'] , $_POST['play_id'] ));

    if($res) {
        echo MANAGEMENT_PLAY_SUCCESS;
    }else{
        echo MANAGEMENT_PLAY_FAIL;
    }
}
