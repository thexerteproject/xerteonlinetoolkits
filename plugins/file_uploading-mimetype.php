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

function filter_by_mimetype() {

    $args = func_get_args();
    $files = $args[0];
    _debug($args);
    foreach($files as $file) {
        _debug("Checking {$file['name']} for mimetype etc");
        
        $user_filename = $file['name'];
        $php_upload_filename = $file['tmp_name'];
        
        $validator = new Xerte_Validate_FileMimeType();
        if($validator->isValid($php_upload_filename)) {
            _debug("Mime check of $php_upload_filename ($user_filename) - ok");
        }
        else {
            _debug("Mime check of $php_upload_filename ($user_filename) failed. ");
            return false;
        }
    }
    return $files;
}

if(Xerte_Validate_FileMimeType::canRun()) {
    Xerte_Validate_FileMimeType::$allowableMimeTypeList = $xerte_toolkits_site->mimetypes;
    add_filter('editor_upload_file', 'filter_by_mimetype');
}
