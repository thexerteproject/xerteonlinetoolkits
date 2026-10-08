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

    // keep new ai settings fields separate so existing vendor parsing is not disrupted
    $ai_settings_options = [];
    $ai_settings_defaults = [];

    foreach ($form_state as $key=>$value){

        // ai settings options fields
        if (strpos($key, 'ai_settings_options_') === 0) {
            $setting_key = substr($key, strlen('ai_settings_options_'));
            $ai_settings_options[$setting_key] = $value;
            continue;
        }

        // ai settings default fields
        if (strpos($key, 'ai_settings_default_') === 0) {
            $setting_key = substr($key, strlen('ai_settings_default_'));
            $ai_settings_defaults[$setting_key] = $value;
            continue;
        }

        $parts = explode('_', $key);

        // type = first part
        $type = array_shift($parts);

        // vendor = second part
        $vendor = array_shift($parts);

        // option = remainder (with underscores converted back to spaces)
        $option = str_replace('_', ' ', implode('_', $parts));

        // compound key
        $compound_key = $type . ":" . $vendor;

        // ensure base bucket exists
        if (!isset($vendors[$compound_key])) {
            $vendors[$compound_key] = ['type' => $type, 'vendor' => $vendor];
        }

        // store preferred model (dropdown)
        if ($option === "selected") {
            $vendors[$compound_key]['preferred_model'] = $value;
        } else {
            // store ALL other options, including enabled and sub-options
            $vendors[$compound_key][$option] = $value;
        }
    }

    foreach ($vendors as $compound=>$options) {
        $type = $options['type'];
        $vendor = $options['vendor'];

        $enabled = (isset($options['enabled']) && $options['enabled'] === 'true') ? 1 : 0;

        $preferred_model = $options['preferred_model'] ?? null;

        unset($options['type'], $options['vendor'], $options['enabled'], $options['preferred_model']);

        $sub_options_json = empty($options) ? '{}' : json_encode($options);

        $query = "UPDATE " . $xerte_toolkits_site->database_table_prefix . "management_helper
          SET enabled = ?, sub_options = ?, preferred_model = ?
          WHERE vendor = ? AND type = ?";

        $res = db_query_one($query, [$enabled, $sub_options_json, $preferred_model, $vendor, $type]);
        if ($res === false) {
            echo MANAGEMENT_AI_FAIL . " Database error.";
            exit;
        }
    }

    // save ai settings options rows
    foreach ($ai_settings_options as $setting_key => $option_values) {

        // normalise comma-separated values before saving
        $normalised_values = array_filter(array_map(function($item) {
            $item = trim($item);
            $item = strtolower($item);
            $item = preg_replace('/\s+/', '_', $item);
            $item = preg_replace('/_+/', '_', $item);
            return trim($item, '_');
        }, explode(',', $option_values)));

        $normalised_values = implode(',', array_unique($normalised_values));

        $query = "UPDATE " . $xerte_toolkits_site->database_table_prefix . "ai_settings_options
          SET option_values = ?
          WHERE setting_key = ?";

        $res = db_query_one($query, [$normalised_values, $setting_key]);
        if ($res === false) {
            echo MANAGEMENT_AI_FAIL . " Database error.";
            exit;
        }
    }

    // save global ai settings defaults
    if (!empty($ai_settings_defaults)) {

        $set_parts = [];
        $params = [];

        foreach ($ai_settings_defaults as $setting_key => $setting_value) {
            $set_parts[] = "`" . $setting_key . "` = ?";
            $params[] = $setting_value;
        }

        if (!empty($set_parts)) {
            $query = "UPDATE " . $xerte_toolkits_site->database_table_prefix . "ai_settings
              SET " . implode(', ', $set_parts) . "
              WHERE scope_type = ? AND scope_id = ?";

            $params[] = 'global';
            $params[] = 0;

            $res = db_query_one($query, $params);
            if ($res === false) {
                echo MANAGEMENT_AI_FAIL . " Database error.";
                exit;
            }
        }
    }

    echo MANAGEMENT_AI_SUCCESS;
}
?>