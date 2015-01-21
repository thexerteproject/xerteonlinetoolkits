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
 * Save page, used by xerte to update its XML files
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

/**
 *  Store the $unescaped data BEFORE config inclusion as Moodle integration
 *    messes with the slashes
 */
$unescaped_data = $_POST['filedata'];
if (function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc()) {
    $unescaped_data = stripslashes($_POST['filedata']);
}

require_once("../../../config.php");

require_once("../../../plugins.php");

if (!isset($_SESSION['toolkits_logon_username'])) {
    die("You are not logged in.");
}


$previewpath = str_replace("preview.xml", "data.xml", $_POST['filename']);
$datapath = $_POST['filename'];

if (empty($_POST['filedata'])) {
    die("Invalid request");
}

$filedata = apply_filters('editor_save_data', $unescaped_data);

if ($filedata === FALSE) {
    die("Invalid XML format (unparseable)");
}


/**
 * Save and play do slightly different things. Save sends an extra variable so we update data.xml as well as preview.xml
 */
if ($_POST['fileupdate'] == "true") {
    $file_handle = fopen($xerte_toolkits_site->root_file_path . $datapath, 'w');
    if (fwrite($file_handle, $filedata) != false) {
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Template " . $_POST['filename'] . " saved", $filedata);
    } else {
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Template " . $_POST['filename'] . " failed to save", $filedata);
    }
    fclose($file_handle);
}

// Always update preview.xml

$filedata = apply_filters("editor_save_preview", $unescaped_data);
if ($filedata === FALSE) {
    die("Invalid XML format (unparseable)");
}

$file_handle = fopen($xerte_toolkits_site->root_file_path . $previewpath, 'w');

if (fwrite($file_handle, $filedata) != false) {
    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Template " . $_POST['filename'] . " saved", $filedata);
} else {
    receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Template " . $_POST['filename'] . " failed to save", $filedata);
}
fclose($file_handle);