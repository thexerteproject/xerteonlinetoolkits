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

_load_language_file("/website_code/php/management/course_details_management.inc");

require("../user_library.php");

if(is_user_admin()) {

    $database_id = database_connect("templates list connected", "template list failed");

    /* Ensure that the various check values are valid before saving them. */

    $enable_course_freetext = true_or_false($_POST['course_freetext_enabled']) ? 'true' : 'false';

    $query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set course_freetext_enabled = ?";

    $data = array($enable_course_freetext);

    $res = db_query($query, $data);

    if($res!==false){

        $msg = "Course changes saved by user from " . $_SERVER['REMOTE_ADDR'];
        receive_message("", "SYSTEM", "MGMT", "Changes saved", $msg);

        /* Clear the file cache because of the file check below. */
        clearstatcache();

        echo MANAGEMENT_COURSE_CHANGES_SUCCESS;

    }else{

        echo MANAGEMENT_COURSE_CHANGES_FAIL . " " . mysql_error($database_id);

    }

}

?>
