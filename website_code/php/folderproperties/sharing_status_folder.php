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
 * 
 * sharing folder template, shows who is sharing a folder
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
include "../folder_status.php";

_load_language_file("/website_code/php/folderproperties/sharing_status_folder.inc");
_load_language_file("/folderproperties.inc");
include "../url_library.php";
include "../user_library.php";

$parameters = explode("_", $_POST['folder_id']);

if(!(is_user_creator_or_coauthor_folder($parameters[0])||is_user_admin()) && !is_numeric($parameters[0]) && is_string($parameters[1])){
    echo "<p>" . SHARING_FAIL . "</p>";
    exit(0);
}else{
    echo "<div>";
    echo "<p class=\"header\"><span>" . FOLDERPROPERTIES_TAB_SHARED . "</span></p>";
    echo "<p><span>" . SHARING_INSTRUCTION . "</span></p>";
    echo "<div id=\"rolebutton\">" .
            "<input type=\"radio\" name=\"role\" value=\"co-author\"checked>" .
                SHARING_COAUTHOR .
            "<input type=\"radio\" name=\"role\" value=\"editor\">" .
                SHARING_EDITOR .
            "<input type=\"radio\" name=\"role\" value=\"read-only\">" .
                SHARING_READONLY .
        "</div>";

    echo "<form id=\"share_form\"><input name=\"searcharea\" onkeyup=\"javascript:name_select_folder()\" type=\"text\" size=\"20\" /></form>";
    echo "<div id=\"area2\"><p>" . SHARING_NAMES . "</p></div>";
    echo "<p id=\"area3\">";
    echo "</div>";
}


