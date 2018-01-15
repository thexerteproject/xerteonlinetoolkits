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

function filter_by_extension_name() {

    global $last_file_check_error;

    $args = func_get_args();
    $files = array();

    if(!Xerte_Validate_FileExtension::canRun() || !is_array($args[0])) {
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

    foreach($files['file_name'] as $key => $file) {
        $validator = new Xerte_Validate_FileExtension();

        if(!$validator->isValid($file)) {
            $real_path = $files['temp_name'][$key];

            if (!$file) {
                _debug("File extension check failed - no file selected");
                error_log("File extension check failed - no file selected");
            }
            elseif (file_exists($real_path)) {
                _debug("Blacklisted file extension of uploaded file - $file");
                error_log("Blacklisted file extension found for file $file ($real_path)");

                unlink($real_path);
            }
            else {
                _debug("Invalid file {$file} uploaded - file does not exist");
                error_log("Invalid file $file ($real_path) uploaded - file does not exist");
            }

            $last_file_check_error = $validator->GetMessages();

            return false;
        }
    } 

    return $args[0];
}

if (Xerte_Validate_FileExtension::canRun() && $xerte_toolkits_site->enable_file_ext_check) {
    Xerte_Validate_FileExtension::$BLACKLIST = $xerte_toolkits_site->file_extensions;
    add_filter('editor_upload_file', 'filter_by_extension_name');
}
