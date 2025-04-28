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

_load_language_file("/website_code/php/management/ai_management.inc");

require("../user_library.php");

if(is_user_admin()) {

    $database_id = database_connect("templates list connected", "template list failed");

    /* Ensure that the various check values are valid before saving them. */
    //placeholder until roles is ready
    $openai = '';
    $_POST['openai_allow'] === 'true' ? $openai .= 'allow:true,' : $openai .= 'allow:false,';
    $_POST['openai_whisper'] === 'true' ? $openai .= 'whisper:true,' : $openai .= 'whisper:false,';
    $_POST['openai_dali'] === 'true' ? $openai .= 'dali:true,' : $openai .= 'dali:false,';
    $_POST['openai_upload'] === 'true' ? $openai .= 'upload:true,' : $openai .= 'upload:false,';
    $openai = rtrim($openai, ',');

    $anthropic = '';
    $_POST['anthropic_allow'] === 'true' ? $anthropic .= 'allow:true,' : $anthropic .= 'allow:false,';
    $_POST['anthropic_whisper'] === 'true' ? $anthropic .= 'whisper:true,' : $anthropic .= 'whisper:false,';
    $_POST['anthropic_dali'] === 'true' ? $anthropic .= 'dali:true,' : $anthropic .= 'dali:false,';
    $_POST['anthropic_upload'] === 'true' ? $anthropic .= 'upload:true,' : $anthropic .= 'upload:false,';
    $anthropic = rtrim($anthropic, ',');


    $query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set openai = ?, anthropic = ?";

    $res = db_query($query, [$openai, $anthropic]);

    if ($res !== false) {
        echo MANAGEMENT_AI_SUCCESS;

    } else {

        echo MANAGEMENT_AI_FAIL . " Something went wrong";
    }

}


?>
