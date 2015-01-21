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

_load_language_file("/website_code/php/folderproperties/folderproperties_template.inc");
_load_language_file("/website_code/php/folderproperties/rename_folder_template.inc");


if(is_numeric($_POST['folder_id'])&&is_string($_POST['folder_name'])){

    $database_id = database_connect("Folder rename database connect success","Folder rename database connect failed");

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $query = "update {$prefix}folderdetails SET folder_name = ? WHERE folder_id = ?";
    $params = array(str_replace(" ", "_", $_POST['folder_name']), $_POST['folder_id']);

    $ok = db_query($query, $params);
    
    if($ok) {

        echo "<p class=\"header\"><span>" . FOLDER_PROPERTIES_PROPERTIES . "</span></p>";			

        echo "<p>" . FOLDER_PROPERTIES_CALLED . " " . str_replace("_", " ", $_POST['folder_name']) . "</p>";

        echo "<p>" . FOLDER_PROPERTIES_CHANGE . "</p>";

        echo "<p><form id=\"rename_form\" action=\"javascript:rename_folder('" . $_POST['folder_id'] ."',"
                . " 'rename_form')\"><input style=\"padding-bottom:5px\" type=\"text\" value=\"" .
                str_replace("_", " ", $_POST['folder_name']) . "\" name=\"newfoldername\" />"
                . "<button type=\"submit\" class=\"xerte_button\"  align=\"top\" style=\"padding-left:5px\">" . 
                FOLDER_PROPERTIES_BUTTON_SAVE . "</button></form>";

        echo "<p>" . FOLDER_RENAMED . "</p>";

        /**
         * Extra bit of code to tell the ajax back on the web page what to rename the folder to be
         */

        echo "~*~" . $_POST['folder_name'];

    }else{

    }

}
