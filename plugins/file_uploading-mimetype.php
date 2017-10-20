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
 * @see modules/site/engine/upload.php
 */

require_once(dirname(__FILE__) . '/../config.php');

function filter_by_mimetype() {

    global $last_file_check_error;

    $args = func_get_args();
    $files = array();

    if(!Xerte_Validate_FileMimeType::canRun() || !is_array($args[0])) {
	return $args[0];
    }

    $last_file_check_error = null;

    /*
     * The file names may be supplied in two slightly different formats.
     * As such we dig out the real and temporary file names, and store them
     * in a local array for easier processing.
     */

    if (isset($args[0]['filenameuploaded'])) {
	$files['file_name'][] = $args[0]['filenameuploaded']['name'];
	$files['temp_name'][] = $args[0]['filenameuploaded']['tmp_name'];
    }
    else {
	foreach ($args[0]['name'] as $key => $name) {
	    $files['file_name'][] = $name;
	    $files['temp_name'][] = $args[0]['tmp_name'][$key];
	}
    }

    foreach($files['temp_name'] as $key => $file) {
	$validator = new Xerte_Validate_FileMimeType();
	if(!$validator->isValid($file)) {
	    if (!$file) {
		_debug("Mime check failed - no file selected");
		error_log("Mime check failed - no file selected");
	    }
	    elseif (file_exists($file)) {
		_debug("Mime check of {$files['file_name'][$key]} failed.");
		error_log("Mime check of {$files['file_name'][$key]} ($file) failed");

		unlink($file);
	    }
	    else {
		_debug("Mime check of {$files['file_name'][$key]} failed - file does not exist");
		error_log("Mime check of {$files['file_name'][$key]} ($file) failed - file does not exist");
	    }

	    $last_file_check_error = $validator->GetMessages();

	    return false;
	}
    }

    return $args[0];
}

if(Xerte_Validate_FileMimeType::canRun() && $xerte_toolkits_site->enable_mime_check) {
    Xerte_Validate_FileMimeType::$allowableMimeTypeList = $xerte_toolkits_site->mimetypes;
    add_filter('editor_upload_file', 'filter_by_mimetype');
}
