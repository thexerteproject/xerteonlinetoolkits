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

require_once(dirname(__FILE__) . "/../config.php");
_load_language_file("/editor/uploadImage.inc");


// Check for a valid logged in user
if (!isset($_SESSION['toolkits_logon_username']) && !is_user_admin()) {
    _debug("Session is invalid or expired");
    die('{"status": "error", "message": "Session is invalid or expired"}');
}


$mode = ""; if ($_GET["mode"]) $mode = $_GET["mode"];
if ($mode != 'record')
	die('{"status": "error", "message": "Mode not set properly"}');


$path = ""; if ($_GET["uploadPath"]) $path = $_GET["uploadPath"];
$url = ""; if ($_GET["uploadURL"]) $url = $_GET["uploadURL"];
if ($path == "" || $url == "")
	die('{"status": "error", "message": "Paths not set properly"}');

$media_path = $path; if ($path != "") $media_path = $path . "/media/";
$media_url = $url; if ($url != "") $media_url = $url . "/media/";


// Define default filename and extension
$filename = "recorded";
$extension = "webm";  //TODO - recognise this from the data sent if no filename/extension sent


// Check for filename and extension options being sent
if ($_POST['filename'] && $_POST['extension']) {
	$filename = $_POST['filename'];
	$extension = $_POST['extension'];
}


// Check if filename already exists, if so add a count until we find a name that is available
$final = $filename;
if (strlen($extension) > 0)
	$final .= "." . $extension;
$count = 1;
while (file_exists($media_path . $final)) {
	$final =  $filename . "(" . $count++ . ")";
	 if (strlen($extension) > 0) $final .= "." . $extension;
}
$filename = $final;


// pull the raw binary data from the POST array, decode and write to disk
$data = substr($_POST['recorded_data'], strpos($_POST['recorded_data'], ",") + 1);
file_put_contents($media_path . $filename, base64_decode($data));


// End with a success and return the filename
die('{"status": "success", "filename": "' . $filename . '", "url": "' . $media_url . $filename . '"}');
