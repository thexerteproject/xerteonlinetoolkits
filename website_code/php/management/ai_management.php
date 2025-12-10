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
    global $xerte_toolkits_site;
    $form_state = x_clean_input_array($_POST['form_state']);

    $database_id = database_connect("ai and image settings updated", "ai and image settings update failed");

    $vendors = [];
    foreach ($form_state as $key=>$value){
        $parts = explode('_', $key);

        // type = first part
        $type = array_shift($parts);

        // vendor = second part
        $vendor = array_shift($parts);

        // enabled
        $option = str_replace('_', ' ', implode('_', $parts));

        //Dropdowns can't be true/false, as such they're selected
        if ($option === "selected") {
        $vendors["$type:$vendor"]["selected"] = $value;
        continue;
        }

        //Build a compound key in case vendors have the same name
        $compound_key = $type . ":" . $vendor;

        if (!array_key_exists($compound_key, $vendors)) {
            $vendors[$compound_key] = ['type'=>$type, 'vendor'=>$vendor, $option => $value];
        } else {
            $vendors[$compound_key][$option] = $value;
        }
    }

    foreach ($vendors as $compound=>$options) {
        $type = $options['type'];
        $vendor = $options['vendor'];

        $enabled = ($options['enabled'] == 'true');

        unset($options['type']);
        unset($options['vendor']);
        unset($options['enabled']);

        $sub_options_json = empty($options) ? '{}' : json_encode($options);

        $query = "UPDATE " . $xerte_toolkits_site->database_table_prefix . "management_helper 
          SET enabled = ?, sub_options = ? 
          WHERE vendor = ? AND type = ?";

        $res = db_query_one($query, [$enabled, $sub_options_json, $vendor, $type]);
        if ($res === false) {
            echo MANAGEMENT_AI_FAIL . " Database error.";
        }
    }
    echo MANAGEMENT_AI_SUCCESS;
}
?>
