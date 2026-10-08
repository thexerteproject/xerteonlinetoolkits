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
require_once ("../../../editor/ai/ModelLister.php");

_load_language_file("/website_code/php/management/ai_website.inc");

require("../user_library.php");
require("management_library.php");
require_once("vendor_option_component.php");

if (is_user_admin()) {
    global $xerte_toolkits_site;
    $assumedVendorConfigPath = "../../../vendor_config.php";
    if (!is_file($assumedVendorConfigPath)) {
        echo '<div class="admin_guide_error_ref">';
        echo MANAGEMENT_AI_ADMIN_ERROR_VENDOR_CONFIG . ' <p><a href="' . MANAGEMENT_AI_ADMIN_GUIDE_URL . '" target="_blank" rel="noopener noreferrer">' . MANAGEMENT_AI_ADMIN_GUIDE_URL . '</a></p>';
        echo '<div>';
        die();
    }

    require_once $assumedVendorConfigPath;

    $database_id = database_connect("success", "failed");
    $prefix = $xerte_toolkits_site->database_table_prefix;


    $groups_query = "SELECT DISTINCT type from {$prefix}management_helper";
    $res = db_query($groups_query);
    if ($res === false) {
        die('Failed to retrieve types from management_helper');
    }
    $blocks_groups = [];
    foreach ($res as $row) {
        $blocks_groups[] = $row['type'];
    }
    //ensure that block groups and helper results are in the same order
    sort($blocks_groups);

    $query = "SELECT * FROM {$prefix}management_helper ORDER BY type ASC";

    $res = db_query($query);

    if ($res !== false) {
        $blocks = array();
        foreach ($blocks_groups as $group_name){
            $blocks[$group_name] = [];
        }

        foreach ($res as $vendor) {
            $block = new vendor_option_component($vendor);
            $blocks[$block->type][] = $block;

        }

    } else {
        die("Failed to retrieve helper table");
    }
    echo '<div class="admin_guide_ref">';
    echo MANAGEMENT_AI_ADMIN_GUIDE_MESSAGE . ' <p><a href="' . MANAGEMENT_AI_ADMIN_GUIDE_URL . '" target="_blank" rel="noopener noreferrer">' . MANAGEMENT_AI_ADMIN_GUIDE_URL . '</a></p>';
    echo '<div>';
    echo '<div class="ethical_statement_ref">';
    echo MANAGEMENT_AI_ETHICAL_STATEMENT_MESSAGE . ' <p><a href="' . MANAGEMENT_AI_ETHICAL_STATEMENT_URL . '" target="_blank" rel="noopener noreferrer">' . MANAGEMENT_AI_ETHICAL_STATEMENT_URL . '</a></p>';
    echo '<div>';

    $lister = new ModelLister(20);

    foreach ($blocks_groups as $group) {
        $groupHeader = 'MANAGEMENT_VENDOR_GROUP_'.strtoupper($group);
        echo "<h2>" . constant($groupHeader) . MANAGEMENT_VENDOR . "</h2>";
        echo "<div class=\"admin_block\">";
        //generate vendor html
        foreach ($blocks[$group] as $vendor) {
            $vendorHeader = 'MANAGEMENT_VENDOR_' . strtoupper($group) . '_' . strtoupper($vendor->vendor);
            echo "<h3>" . constant($vendorHeader) . MANAGEMENT_SETTINGS . "</h3>";

            //verify an api key is installed
            if ($vendor->needs_key && !$vendor->has_key) {
                echo "<p>" . MANAGEMENT_KEY_STATUS . "</p>";
                continue;
            }

            $compound = $vendor->type . "_" . $vendor->vendor;

            $id = $compound. "_enabled";
            echo "<p>" . MANAGEMENT_ENABLE_VENDOR . constant($vendorHeader) .
                "<form><input type=\"checkbox\" id=\"" . $id . "\" name=\"" . $id . "\" " . ($vendor->enabled ? " checked" : "") . "/></form></p>";

            // Saved preferred model
            $savedPreferredModel = $vendor->preferred_model ?? null;

            //vendor types with selectable models
            //Note: 'transcription' is technically supported by openAI, but not practically as Xerte relies on vtt content to process transcriptions, and only the whisper-1 model provides this. Therefor the category is not included.
            $selectableModelVendorTypes = ['ai', 'encoding'];

            //specific vendors which do not allow model specification on api call and/or use only a single model
            $nonModelSelectableVendors = ['gladia'];

            if (
                in_array($vendor->type, $selectableModelVendorTypes, true)
                && !in_array($vendor->vendor, $nonModelSelectableVendors, true)
            ) {

                $models = $lister->listModels($xerte_toolkits_site, $vendor->vendor);
                $tip = MANAGEMENT_AI_ADMIN_PREFERRED_MODEL_TOOLTIP;
                // Preferred model label + tooltip
                echo '<p><i class="fa fa-info-circle" title="' . htmlspecialchars($tip, ENT_QUOTES, 'UTF-8') . '" aria-label="' . htmlspecialchars($tip, ENT_QUOTES, 'UTF-8') . '"></i> '
                    . MANAGEMENT_AI_ADMIN_PREFERRED_MODEL . ': ';

                // Dropdown key that ai_management.php will parse as option === "selected"
                $selectedKey = $compound . "_selected";

                // If nothing saved yet, default to "default"
                $effectiveSelected = ($savedPreferredModel !== null && $savedPreferredModel !== '')
                    ? $savedPreferredModel
                    : 'default';

                // Preferred model select
                echo "<select name=\"" . htmlspecialchars($selectedKey, ENT_QUOTES) . "\"
                id=\"" . htmlspecialchars($selectedKey, ENT_QUOTES) . "\"
                style=\"padding: 0.4em 0.15em;\">";

                // Generic default option (saved to DB as literal 'default' but backend reads it as a null)
                $defaultSelectedAttr = ($effectiveSelected === 'default') ? " selected" : "";
                echo "<option value=\"default\"{$defaultSelectedAttr}>(Default)</option>";

                foreach ($models as $modelName) {
                    $modelEsc = htmlspecialchars($modelName, ENT_QUOTES);
                    $selectedAttr = ($effectiveSelected === $modelName) ? " selected" : "";
                    echo "<option value=\"{$modelEsc}\"{$selectedAttr}>{$modelEsc}</option>";
                }

                echo "</select></p>";

            }

            //next vendor if current has no sub options
            if ($vendor->has_no_sub_options() ) { continue; }

            echo "<p>" . MANAGEMENT_ENABLE_SUBOPTIONS . constant($vendorHeader). "<form>";

            //generate sub options html
            foreach ($vendor->sub_options as $sub_option=>$value) {
                $id_string = $vendor->type . "_" . $vendor->vendor . "_" . str_replace(' ', '_', $sub_option);
                echo "<input type=\"checkbox\" id=\"" . $id_string . "\" name=\"" . $id_string . "\" " .
                    ($value == "true" ? " checked" : "") . "/><label for=\"" . $id_string . "\">" . $sub_option . "</label>";
            }

            echo "</form></p>";
        }
        echo "</div>";

    }

// load ai settings options
$ai_settings_options_rows = db_query(
    "SELECT setting_key, option_values
       FROM " . $xerte_toolkits_site->database_table_prefix . "ai_settings_options
      ORDER BY id ASC"
);

// load global ai settings row
$ai_settings_global = db_query_one(
    "SELECT *
       FROM " . $xerte_toolkits_site->database_table_prefix . "ai_settings
      WHERE scope_type = ? AND scope_id = ?",
    ['global', 0]
);

// read ai_settings columns dynamically
$ai_settings_columns = [];
$columns_query = db_query(
    "SHOW COLUMNS FROM " . $xerte_toolkits_site->database_table_prefix . "ai_settings"
);

if (is_array($columns_query)) {
    foreach ($columns_query as $column) {
        if (!isset($column['Field'])) {
            continue;
        }

        $field_name = $column['Field'];

        if ($field_name === 'id' || $field_name === 'scope_type' || $field_name === 'scope_id') {
            continue;
        }

        $ai_settings_columns[] = $field_name;
    }
}

// build quick lookup for options rows
$ai_settings_options_lookup = [];
if (is_array($ai_settings_options_rows)) {
    foreach ($ai_settings_options_rows as $row) {
        $ai_settings_options_lookup[$row['setting_key']] = $row['option_values'];
    }
}

// build ai model options from enabled ai vendors in management_helper
$ai_model_options = [];

$ai_vendors = db_query(
    "SELECT vendor, label, enabled, sub_options
       FROM " . $xerte_toolkits_site->database_table_prefix . "management_helper
      WHERE type = ? AND enabled = ?",
    ['ai', 1]
);

if (is_array($ai_vendors)) {
    foreach ($ai_vendors as $vendor_row) {

        $sub_options = [];
        if (!empty($vendor_row['sub_options'])) {
            $decoded = json_decode($vendor_row['sub_options']);
            if (is_object($decoded)) {
                $sub_options = $decoded;
            }
        }

        $needs_key = !empty($sub_options->needs_key);
        $has_key = !empty($sub_options->has_key);

        if ($needs_key && !$has_key) {
            continue;
        }

        if (!empty($vendor_row['vendor'])) {
            $ai_model_options[] = [
                'value' => $vendor_row['vendor'],
                'label' => !empty($vendor_row['label']) ? $vendor_row['label'] : $vendor_row['vendor']
            ];
        }
    }
}
?>

<hr />

<h2>
    <?php
    echo MANAGEMENT_AI_ADMIN_OPTIONS_AND_DEFAULTS_HEADING;
    ?>
</h2>

    <div class="ai-settings-options-section">
        <p>
        <?php
        // needs language var connection
        echo MANAGEMENT_AI_ADMIN_OPTIONS_DESCRIPTION;
        ?>
        </p>
        <?php if (is_array($ai_settings_options_rows)) { ?>
            <?php foreach ($ai_settings_options_rows as $row) { ?>
                <?php
                $setting_key = $row['setting_key'];
                $option_values = $row['option_values'];
                ?>
                <p>
                    <?php
                    $lang_constant_name = 'MANAGEMENT_AI_ADMIN_OPTIONS_' . strtoupper($setting_key);
                    echo constant($lang_constant_name);
                    ?>
                </p>
                <form>
                <textarea
                        id="ai_settings_options_<?php echo htmlspecialchars($setting_key); ?>"
                        name="ai_settings_options_<?php echo htmlspecialchars($setting_key); ?>"
                        rows="3"
                        cols="80"
                        style="width: 95%;"
                ><?php echo htmlspecialchars($option_values); ?></textarea>
                </form>
            <?php } ?>
        <?php } ?>
    </div>

    <div class="ai-settings-defaults-section">
        <h3>
            <?php
            echo MANAGEMENT_AI_ADMIN_DEFAULTS_HEADING;
            ?>
        </h3>

        <p>
            <?php
            echo MANAGEMENT_AI_ADMIN_DEFAULTS_DESCRIPTION;
            ?>
        </p>

        <?php foreach ($ai_settings_columns as $field_name) { ?>
            <?php
            $selected_value = isset($ai_settings_global[$field_name]) ? $ai_settings_global[$field_name] : '';

            $field_options = [];

            if ($field_name === 'ai_model') {
                $field_options = $ai_model_options;
            } else if (isset($ai_settings_options_lookup[$field_name])) {
                $field_options = array_filter(array_map('trim', explode(',', $ai_settings_options_lookup[$field_name])));
            }
            ?>

            <p>
                <?php
                $lang_constant_name = 'MANAGEMENT_AI_ADMIN_DEFAULT_' . strtoupper($field_name);
                echo constant($lang_constant_name);
                ?>

                <select
                        id="ai_settings_default_<?php echo htmlspecialchars($field_name); ?>"
                        name="ai_settings_default_<?php echo htmlspecialchars($field_name); ?>"
                        style="padding: 0.4em 0.15em;"
                >
                    <?php foreach ($field_options as $option_item) { ?>
                        <?php
                        if ($field_name === 'ai_model') {
                            $option_value = $option_item['value'];
                            $option_label = $option_item['label'];
                        } else {
                            $option_value = $option_item;
                            $option_label = $option_item;
                        }
                        ?>
                        <option
                                value="<?php echo htmlspecialchars($option_value); ?>"
                                <?php echo ($selected_value === $option_value ? 'selected="selected"' : ''); ?>
                        >
                            <?php
                            if ($field_name === 'ai_model') {
                                echo htmlspecialchars($option_label);
                            } else {
                                $choice_constant = '';

                                if ($field_name === 'reading_level') {
                                    $choice_constant = 'MANAGEMENT_AI_ADMIN_OPTIONS_CHOICES_READING_LEVEL_' . strtoupper($option_value);
                                } else if ($field_name === 'education_level') {
                                    $choice_constant = 'MANAGEMENT_AI_ADMIN_OPTIONS_EDUCATION_LEVEL_' . strtoupper($option_value);
                                } else if ($field_name === 'tone_and_style') {
                                    $choice_constant = 'MANAGEMENT_AI_ADMIN_OPTIONS_TONE_AND_STYLE_' . strtoupper($option_value);
                                }

                                if ($choice_constant !== '' && defined($choice_constant)) {
                                    echo htmlspecialchars(constant($choice_constant));
                                } else {
                                    echo htmlspecialchars($option_value);
                                }
                            }
                            ?>
                        </option>
                    <?php } ?>
                </select>
            </p>
        <?php } ?>
    </div>
    <?php
} else {

    management_fail();

}
?>

