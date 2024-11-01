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
require_once ("../themes_library.php");

_load_language_file("/website_code/php/management/theme_enable_disable.inc");

if (!is_user_permitted("templateadmin")) {
        exit(THEME_NO_ACCESS);
}
if (isset($_POST["theme"]) && isset($_POST["type"])) {

    $theme = x_clean_input($_POST["theme"]);
    $type = x_clean_input($_POST["type"]);

    $path = $xerte_toolkits_site->root_file_path . "themes/";

    if ($type != "site" && $type != "Nottingham" && $type != "decision") {
        die(THEME_BAD_REQUEST);
    }

    $current_themes = get_themes_list($type, true, true);
    $path .= $type . '/';

    if (!in_array($theme, $current_themes)) {
        die(THEME_BAD_REQUEST);
    }

    $path .= $theme . '/';
    $files = scandir($path);
    $infofound = false;

    if (in_array('hidden.info', $files)) {
        unlink($path . 'hidden.info');
    } else {
        $createfile = fopen($path . 'hidden.info', "w");
        fclose($createfile);
    }
}
