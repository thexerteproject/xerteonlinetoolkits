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
require_once("../../../vendor_config.php");

_load_language_file("/website_code/php/management/ai.inc");
_load_language_file("/ai.inc");

require("../user_library.php");
require("management_library.php");
require_once("vendor_option_component.php");

if (is_user_admin()) {
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

    foreach ($blocks_groups as $group) {
        echo "<h2>" . $group . MANAGEMENT_VENDOR . "</h2>";
        echo "<div class=\"admin_block\">";
        //generate vendor html
        foreach ($blocks[$group] as $vendor) {
            echo "<h3>" . $vendor->vendor . MANAGEMENT_SETTINGS . "</h3>";

            //verify an api key is installed
            if ($vendor->needs_key && !$vendor->has_key) {
                echo "<p>" . MANAGEMENT_KEY_STATUS . "</p>";
                continue;
            }

            $id = $vendor->type . "_" . $vendor->vendor . "_enabled";
            echo "<p>" . MANAGEMENT_ENABLE_VENDOR . $vendor->vendor .
                "<form><input type=\"checkbox\" id=\"" . $id . "\" name=\"" . $id . "\" " . ($vendor->enabled ? " checked" : "") . "/></form></p>";

            //next vendor if current has no sub options
            if ($vendor->has_no_sub_options() ) { continue; }

            echo "<p>" . MANAGEMENT_ENABLE_SUBOPTIONS . $vendor->vendor . "<form>";

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

} else {

    management_fail();

}
?>

