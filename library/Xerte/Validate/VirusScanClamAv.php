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

class Xerte_Validate_VirusScanClamAv {

    protected $messages = array();
    // perhaps needs changing on other platforms.
    public static $BINARY = '/usr/bin/clamscan';

    public static function canRun() {
        return file_exists(self::$BINARY);
    }

    public function isValid($filename) {
        $this->messages = array();
        if(file_exists($filename)) {
            $command = self::$BINARY . " " . escapeshellarg($filename);
            $retval = -1;
            exec($command, $output, $retval);

            if($retval == 0) {
                return true;
            }
            else {
                error_log("Virus found in file upload? $filename --- From " . __FILE__ . " - ClamAV output: {$retval} / {$output}");
                _debug("Virus found? {$retval} / {$output} (When scanning : $filename)");
                $this->messages[$retval] = "Virus found? $output";
            }
        }
        else {
            $this->messages['FILE_NOT_FOUND'] = "$filename doesn't exist. Cannot scan";
        }
        return false;
    }

    public function getMessages() {
        return $this->messages;
    }

    public function getErrors() {
        return array_keys($this->messages);
    }
}

