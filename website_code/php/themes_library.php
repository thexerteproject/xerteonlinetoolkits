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


/**
 * build an array of available themes for this template
 */

function get_themes_list($parent_template, $include_disabled = false, $return_ids_only = false)
{
    global $xerte_toolkits_site;

    $theme_folder = $xerte_toolkits_site->root_file_path . "themes/" . $parent_template . "/";
    $ThemeList = array();
    if (file_exists($theme_folder)) {
        $d = opendir($theme_folder);
        while ($f = readdir($d)) {
            if (is_dir($theme_folder . $f)) {
                $theme_disabled = file_exists($theme_folder . $f . "/hidden.info");
                if (file_exists($theme_folder . $f . "/" . $f . ".info") && ($include_disabled || !$theme_disabled ) ) {
                    $info = file($theme_folder . $f . "/" . $f . ".info", FILE_SKIP_EMPTY_LINES);
                    $themeProperties = new StdClass();
                    $themeProperties->enabled = !$theme_disabled;
                    $themeProperties->imgbtns = false;
                    foreach ($info as $line) {
                        $attr_data = explode(":", $line, 2);
                        if (empty($attr_data) || sizeof($attr_data) != 2) {
                            continue;
                        }
                        switch (trim(strtolower($attr_data[0]))) {
                            case "name" :
                                $themeProperties->name = trim($attr_data[1]);
                                break;
                            case "display name" :
                                $themeProperties->display_name = trim($attr_data[1]);
                                break;
                            case "description" :
                                $themeProperties->description = trim($attr_data[1]);
                                break;
                            //case "enabled" :
                            //    $themeProperties->enabled = strtolower(trim($attr_data[1]));
                            //    break;
                            case "preview" :
                                $themeProperties->preview = $xerte_toolkits_site->site_url . "themes/" . $parent_template . "/" . $f . "/" . trim($attr_data[1]);
                                break;
                            case "imgbtns" :
                                $themeProperties->imgbtns = trim($attr_data[1]);
                                break;
                        }
                    }
                    if ($return_ids_only) {
                        $ThemeList[] = $themeProperties->name;
                    } else {
                        $ThemeList[] = array('enabled' => $themeProperties->enabled, 'name' => $themeProperties->name, 'display_name' => $themeProperties->display_name, 'description' => $themeProperties->description, 'preview' => $themeProperties->preview, 'imgbtns' => $themeProperties->imgbtns);
                    }
                }
            }
        }
        // sort into alphabetical order
        if ($return_ids_only) {
            sort($ThemeList);
        } else {
            $display_name = array();
            foreach ($ThemeList as $key => $row) {
                $display_name[$key] = $row['display_name'];
            }
            array_multisort($display_name, SORT_ASC, $ThemeList);
        }
        // Add default theme to beginning
        if ($return_ids_only) {
            array_unshift($ThemeList, "default");
        } else {
            switch ($parent_template) {
                case "Nottingham":
                    array_unshift($ThemeList, array('enabled' => true, 'name' => "default", 'display_name' => "Xerte Online Toolkits", 'description' => "Xerte Online Toolkits", 'preview' => $xerte_toolkits_site->site_url . "modules/xerte/parent_templates/Nottingham/common_html5/default.jpg", 'imgbtns' => "true"));
                    break;
                case "site":
                    array_unshift($ThemeList, array('enabled' => true, 'name' => "default", 'display_name' => "Default", 'description' => "Default", 'preview' => $xerte_toolkits_site->site_url . "modules/site/parent_templates/site/common/img/default.jpg"));
                    break;
                case "decision":
                    array_unshift($ThemeList, array('enabled' => true, 'name' => "default", 'display_name' => "Default", 'description' => "Default", 'preview' => $xerte_toolkits_site->site_url . "modules/decision/parent_templates/decision/common/img/default.jpg"));
                    break;
            }
        }
    }
    return $ThemeList;
}