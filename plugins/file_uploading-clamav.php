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
 * Wordpress filter (see add_filter), designed to hook in on the action/event 'editor_save_data'.
 *
 * Check that a file is free of viruses.
 * Return FALSE if it fails AV checking.
 * @param string $filename (as in $_FILES['xxx']['tmp_name'])
 * @return string filename (as in $_FILES['xxx']['tmp_name']) or boolean false if we can't upload it.
 */
function virus_check_file() {
    $args = func_get_args();
    $files = $args[0]; /* $_FILES like */

    if(Xerte_Validate_VirusScanClamAv::canRun()){
        foreach($files as $file) {
            $validator = new Xerte_Validate_VirusScanClamAv();
            if(!$validator->isValid($file['tmp_name'])) {
                die("Possible virus found in upload; Consult server log files for more information.");
            }
        }
    }
    return $files;
}


// perhaps have 'pre-flight check here' ?? e.g. explode if /usr/bin/clamscan doesn't exist.
add_filter('editor_upload_file', 'virus_check_file');

