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
class Xerte_Validate_FileExtension
{
    protected $messages = array();

    public static $BLACKLIST = array();


    public static function canRun()
    {
        return function_exists('pathinfo');
    }


    public function isValid($filename)
    {
        $this->messages = array();

        if (!$filename) {
            $this->messages['FILE_NO_FILE'] = "No file selected";
            return false;
        }

        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (strncasecmp(PHP_OS, 'Win', 3) == 0) {
            /* This is for Windows filenames. */
            if (empty($extension)) {
                _debug("File extension not found for '$filename'.");
                $this->messages['NO_EXTENSION'] = "File extension not found.";
                return false;
            }
        }
        elseif (!strlen($extension)) {
            return true;
        }

        if (in_array($extension, self::$BLACKLIST)) {
            _debug("Invalid file uploaded - extension '$extension' matches entry in blacklist");
            $this->messages["INVALID_EXTENSION"] = "Invalid file extension - $extension is blacklisted";
            return false;
        }

        return true;
    }


    public function getMessages()
    {
        return $this->messages;
    }


    public function getErrors()
    {
        return array_keys($this->messages);
    }
}
