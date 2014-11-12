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
 * folder properties template page, used by the site to display the default panel for the properties page
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

_load_language_file("/website_code/php/folderproperties/folderproperties_template.inc");

include "../url_library.php";

//connect to the database

if(is_numeric($_POST['folder_id'])){

    $database_connect_id = database_connect("Folder name database connect success", "Folder name database connect failed");

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $query_for_folder_name = "select folder_name from {$prefix}folderdetails where folder_id=?";
    $params = array($_POST['folder_id']);

    $row_template_name = db_query_one($query_for_folder_name, $params);

    echo "<p class=\"header\"><span>" . FOLDER_PROPERTIES_PROPERTIES . "</span></p>";			

    echo "<p>" . FOLDER_PROPERTIES_CALLED . " " . str_replace("_", " ", $row_template_name['folder_name']) . "</p>";

    echo "<p>" . FOLDER_PROPERTIES_CHANGE . "</p>";

    echo "<p><form id=\"rename_form\" action=\"javascript:rename_folder('" . 
            $_POST['folder_id'] ."', 'rename_form')\">"
            . "<input style=\"padding-bottom:5px\" type=\"text\" value=\"" .
            str_replace("_", " ", $row_template_name['folder_name']) . "\" "
            . "name=\"newfoldername\" /><button type=\"submit\" class=\"xerte_button\"  "
            . "align=\"top\" style=\"padding-left:5px\">" . FOLDER_PROPERTIES_BUTTON_SAVE . "</button></form>";

}
