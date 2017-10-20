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

/**
 * Wordpress filter (see add_filter), designed to hook in on the action/event 'editor_upload_file'.
 *
 * Check that a file is free of viruses.
 * Return FALSE if it fails AV checking.
 * @param string $filename (as in $_FILES['xxx']['tmp_name'])
 * @return string filename (as in $_FILES['xxx']['tmp_name']) or boolean false if we can't upload it.
 */

require_once(dirname(__FILE__) . '/../config.php');

function virus_check_file() {

    global $last_file_check_error;

    $args = func_get_args();
    $files = array();

    if(!Xerte_Validate_VirusScanClamAv::canRun() || !is_array($args[0])) {
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
        $validator = new Xerte_Validate_VirusScanClamAv();
        if(!$validator->isValid($file)) {
            if (!$file) {
                _debug("Antivirus check failed - no file selected");
                error_log("Antivirus check failed - no file selected");
            }
            elseif (file_exists($file)) {
                _debug("Antivirus check of {$files['file_name'][$key]} failed.");
                error_log("Antivirus check of {$files['file_name'][$key]} ($file) failed.");

                unlink($file);
            }
            else {
                _debug("Antivirus check of {$files['file_name'][$key]} failed - file does not exist");
                error_log("antivirus check of {$files['file_name'][$key]} ($file) failed - file does not exist");
            }

            $last_file_check_error = $validator->GetMessages();

            /* Shorten the full pathname to something more user meaningful. */
            if ($file) {
                $full_path = '/' . preg_quote($file, '/') . '/';
                $last_file_check_error = preg_replace($full_path, $files['file_name'][$key], $last_file_check_error);
            }

            return false;
        }
    }

    return $args[0];
}


/* Clear the file cache because of the file check below. */
clearstatcache();

if ($xerte_toolkits_site->enable_clamav_check && is_file($xerte_toolkits_site->clamav_cmd) && is_executable($xerte_toolkits_site->clamav_cmd)) {
    Xerte_Validate_VirusScanClamAv::$ClamAV_Cmd = $xerte_toolkits_site->clamav_cmd;
    Xerte_Validate_VirusScanClamAv::$ClamAV_Opts = $xerte_toolkits_site->clamav_opts;
    add_filter('editor_upload_file', 'virus_check_file');
}
