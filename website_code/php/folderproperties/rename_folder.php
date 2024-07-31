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
 * rename folder template page, used by the site to rename a folder
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");

_load_language_file("/website_code/php/folderproperties/folderproperties.inc");
_load_language_file("/website_code/php/folderproperties/rename_folder.inc");

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

if(!isset($_POST['folder_id']) || !isset($_POST['folder_name'])) {
    die("No folder id or folder name");
}

$folder_id = x_clean_input($_POST['folder_id'], 'numeric');
$folder_name = x_clean_input($_POST['folder_name']);


$database_id = database_connect("Folder rename database connect success","Folder rename database connect failed");

$prefix = $xerte_toolkits_site->database_table_prefix;

$query = "update {$prefix}folderdetails SET folder_name = ? WHERE folder_id = ?";
$params = array($folder_name, $folder_id);

$ok = db_query($query, $params);

if($ok) {

    echo "<h2 class=\"header\">" . FOLDER_PROPERTIES_PROPERTIES . "</h2>";

    echo "<div id=\"mainContent\">";

    echo "<form id=\"rename_form\" action=\"javascript:rename_folder('" .
        $_POST['folder_id'] ."', 'rename_form')\">"
        . "<label class=\"block\" for=\"newfoldername\">" . FOLDER_PROPERTIES_CALLED . ":</label>"
        . "<input type=\"text\" value=\"" . htmlspecialchars(str_replace("_", " ", $folder_name)) . "\" name=\"newfoldername\" id=\"newfoldername\" />"
        . "<button type=\"submit\" class=\"xerte_button\" style=\"padding-left:5px;\" align=\"top\" ><i class=\"fa fa-floppy-o\"></i>&nbsp;" . FOLDER_PROPERTIES_BUTTON_SAVE . "</button>";

    echo "<p class='alert_msg' aria-live='polite'><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . FOLDER_PROPERTIES_CHANGED . "</p>";

    echo "</form>";

    /**
     * Extra bit of code to tell the ajax back on the web page what to rename the folder to be
     */

    echo "~*~" . $_POST['folder_name'];

}

