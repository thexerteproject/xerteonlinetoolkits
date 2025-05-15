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
    $form_state = x_clean_input_array($_POST['form_state']);

    $database_id = database_connect("ai and image settings updated", "ai and image settings update failed");

    $vendors = [];
    foreach ($form_state as $key=>$value){
        $key_split = strpos($key, '_');
        $vendor = substr($key, 0, $key_split);
        $option = str_replace('_', ' ',substr($key, $key_split + 1));
        if (!array_key_exists($vendor, $vendors)){
            $vendors[$vendor] = [$option => $value];
        } else {
            $vendors[$vendor][$option] = $value;
        }
    }

    foreach ($vendors as $vendor=>$options) {
        $enabled = $options['enabled'] == 'true';
        $sub_options = $options;
        unset($sub_options['enabled']);
        $sub_options_json = json_encode($sub_options);

        $query = "UPDATE " . $xerte_toolkits_site->database_table_prefix . "management_helper 
          SET enabled = ?, sub_options = ? 
          WHERE vendor = ?";
        $res = db_query_one($query, [$enabled, $sub_options_json, $vendor]);

        if ($res === false) {
            echo MANAGEMENT_AI_FAIL . " Something went wrong";
        }
    }
    echo MANAGEMENT_AI_SUCCESS;
}
?>
