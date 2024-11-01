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

_load_language_file("/website_code/php/management/themes.inc");
_load_language_file("/management.inc");

require("../user_library.php");
require("management_library.php");
require("../xwdInspector.php");
require_once("../themes_library.php");



if (is_user_permitted("templateadmin")) {

    $database_id = database_connect("templates list connected", "template list failed");

    echo "<h2>" . MANAGEMENT_MENUBAR_THEMES . "</h2>";

    echo "<div class=\"main_admin_block\"><h3>" . MANAGEMENT_THEMES_DEFAULTS . "</h3>";

    echo "<p>" . MANAGEMENT_THEMES_DEFAULT_XERTE . "<form><textarea id=\"default_theme_xerte\">" . $xerte_toolkits_site->default_theme_xerte . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_THEMES_DEFAULT_SITE . "<form><textarea id=\"default_theme_site\">" . $xerte_toolkits_site->default_theme_site . "</textarea></form></p>";

    echo "<p>" . MANAGEMENT_THEMES_DEFAULT_DECISION . "<form><textarea id=\"default_theme_decision\">" . $xerte_toolkits_site->default_theme_decision . "</textarea></form></p>";

    $theme_types = ["site","Nottingham","decision"];
    $theme_types_displaynames = ["site" => "Bootstrap", "Nottingham" => "Xerte Online Toolkits", "decision" => "Decision Tree"];
    $current_themes = array();

    foreach ($theme_types as $theme_type) {
        $current_themes[$theme_type] = get_themes_list($theme_type, true);
    }

    echo "<div class=\"main_admin_block\"><h3>" . MANAGEMENT_THEMES_MANAGE . "</h3><p>" . MANAGEMENT_THEMES_INSTALL_THEME . "</p>" .
        "<p>" . MANAGEMENT_THEMES_UPLOAD_ZIP . "</p>" .
        "<form action='javascript:theme_submit()' method='post' enctype='multipart/form-data' id='form-theme-upload'>" .
        "<input type='file' value='Search File' name='fileToUpload' id='file-select' accept='.zip'>" .
        "<p><select name='themeType' >";
    foreach ($theme_types as $theme_type) {
        echo "<option value='{$theme_type}' label='{$theme_types_displaynames[$theme_type]}' />";
    }
    echo "</select></p><button type='submit' id='upload-button' class='xerte_button'><i class=\"fa fa-upload\"></i> " . MANAGEMENT_THEMES_UPLOAD_BUTTON . "</button>" .
    "</form></div>";

    echo "<div class=\"admin_block\" id=\"themedetails\"><p>" . MANAGEMENT_THEMES_SHOW . " </p><div id=\"themedetails_child\" ><p style='padding-left:5px'>" . MANAGEMENT_THEMES_ENABLE_DISABLE . "</p>";

    foreach ($theme_types as $theme_type) {
        echo "<div id=\"" . $theme_type ."\" class=\"template_list\"><h4 style='margin-left:5px;padding-right:5px;display:inline-block'>" . $theme_types_displaynames[$theme_type] . "</h4><button type=\"button\" class=\"xerte_button\" id=\"" . $theme_type . "_btn\" onclick=\"javascript:theme_display('". $theme_type . "')\">" . MANAGEMENT_THEMES_SHOW . "</button><div id=\"" . $theme_type . "_child\" style='display:none'>";

        foreach ($current_themes[$theme_type] as $theme) {
            // Skip default theme
            if ($theme['name'] == "default") {
                continue;
            }
            if ($theme['enabled']) {
                echo "<div class='theme' id='{$theme_type}_{$theme['name']}'>{$theme['display_name']} ({$theme['name']})<button class='xerte_button theme_disable'  onclick=\"javascript:theme_disable('{$theme['name']}','{$theme_type}','{$theme['display_name']}','" . MANAGEMENT_THEMES_BTN_ENABLE . "','" . MANAGEMENT_THEMES_BTN_DISABLE . "')\">" . MANAGEMENT_THEMES_BTN_DISABLE . "</button></div>";
            } else {
                echo "<div class='theme' id='{$theme_type}_{$theme['name']}'><s>{$theme['display_name']} ({$theme['name']})</s><button class='xerte_button theme_enable' onclick=\"javascript:theme_enable('{$theme['name']}','{$theme_type}','{$theme['display_name']}','" . MANAGEMENT_THEMES_BTN_ENABLE . "','" . MANAGEMENT_THEMES_BTN_DISABLE . "')\">" . MANAGEMENT_THEMES_BTN_ENABLE . "</button></div>";
            }
        }
        echo "</div></div>";
    }

    echo "</div></div>";


} else {

    management_fail();

}

