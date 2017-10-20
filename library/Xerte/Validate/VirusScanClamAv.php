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

    public static $ClamAV_Cmd = '';
    public static $ClamAV_Opts = '';


    public static function canRun() {
        return is_file(self::$ClamAV_Cmd) && is_executable(self::$ClamAV_Cmd);
    }

    public function isValid($filename) {
        $this->messages = array();

        if(self::canRun()) {
            if(!$filename) {
                $this->messages['FILE_NO_FILE'] = "No file selected";
            }
            elseif(file_exists($filename)) {
                /* If required, chmod the file to allow ClamAV access to it. */
                clearstatcache();
                $file_perms = fileperms($filename);
                $world_read = ($file_perms & 0x0004) != 0 ? true : false;
                if (! $world_read) {
                    chmod($filename, 0644);
                }

                $command = escapeshellcmd(self::$ClamAV_Cmd) . ' ' . self::$ClamAV_Opts . ' ' . escapeshellarg($filename);
                $retval = -1;
                exec($command, $output, $retval);

                if($retval == 0) {
                    /* If required, restore the original file permissions. */
                    if (! $world_read) {
                        chmod($filename, $file_perms & 0777);
                    }

                    return true;
                }
                elseif($retval == 1) {
                    $output_str = implode(' ', $output);
                    _debug("Virus found in file '$filename': " . $output_str);
                    $this->messages['VIRUS_FOUND'] = "Virus found: " . $output_str;
                }
                else {
                    $output_str = empty($output) ? '' : (': ' . implode(' ', $output));
                    $output_str = 'Unable to run virus check' . $output_str;
                    _debug($output_str);
                    $this->messages['OTHER_ERROR'] = $output_str;
                }
            }
            else {
                $this->messages['FILE_NOT_FOUND'] = "File not found - $filename";
            }
        }
        else {
            $this->messages['UNSUPPORTED'] = "Can't run - AV command not found: " . self::$ClamAV_Cmd;
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
