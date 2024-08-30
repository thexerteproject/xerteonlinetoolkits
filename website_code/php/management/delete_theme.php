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
require_once("../folder_library.php");

_load_language_file("/website_code/php/management/delete_theme.inc");

if(!is_user_permitted("useradmin")) {
    exit(THEME_NO_ACCESS);
}
if (isset($_POST["theme"]) && isset($_POST["type"])) {

    $path = $xerte_toolkits_site->root_file_path . "themes/";

    //ensure given type is a proper theme
    if ($_POST['type'] == '0') {
        $current_themes = array_diff(scandir($xerte_toolkits_site->root_file_path . '/themes/site/', SCANDIR_SORT_NONE), array('.', '..'));
        $path .= 'site/';

    } elseif ($_POST['type'] == '1') {
        $current_themes = array_diff(scandir($xerte_toolkits_site->root_file_path . '/themes/Nottingham/', SCANDIR_SORT_NONE), array('.', '..'));
        $path .= 'Nottingham/';

    } elseif ($_POST['type'] == '2') {
        $current_themes = array_diff(scandir($xerte_toolkits_site->root_file_path . '/themes/decision/', SCANDIR_SORT_NONE), array('.', '..'));
        $path .= 'decision/';
    } else {
        die(header(THEME_BAD_REQUEST));
    }

    //check if theme exists
    $theme = $_POST['theme'];

    if (!in_array($theme, $current_themes)) {
        die(header(THEME_BAD_REQUEST));
    }

    $path .= $theme . '/';
    $files = scandir($path);
    $infofound = false;

    if (in_array('hidden.info', $files)) {
        if (unlink($path . 'hidden.info') !== false){
            die(THEME_ENABLE_SUCCESS);
        } else {
            die(THEME_ENABLE_FAIL);
        }
    } else {
        $createfile = fopen($path . 'hidden.info', "w");
        if ($createfile !== false){
            die(THEME_DISABLE_SUCCESS);
        } else {
            die(THEME_DISABLE_FAIL);
        }
    }

}
