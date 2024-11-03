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

_load_language_file("/website_code/php/management/themes_details_management.inc");

require("../user_library.php");

if(is_user_permitted("templateadmin")) {

    $database_id = database_connect("templates list connected", "template list failed");

    $query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set default_theme_xerte=?, default_theme_site=?, default_theme_decision=?";

    $data = array($_POST['default_theme_xerte'], $_POST['default_theme_site'], $_POST['default_theme_decision']);

    $res = db_query($query, $data);
    if($res!==false){

        $msg = "Theme changes saved by user from " . $_SERVER['REMOTE_ADDR'];
        receive_message("", "SYSTEM", "MGMT", "Changes saved", $msg);

        /* Clear the file cache because of the file check below. */
        clearstatcache();

        echo MANAGEMENT_THEMES_CHANGES_SUCCESS;

    }else{

        echo MANAGEMENT_THEMES_CHANGES_FAIL;

    }

}

