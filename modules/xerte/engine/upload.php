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
 * upload page, used by xerte to upload a file
 *
 * @author Patrick Lockley, tweaked by John Smith, GCU
 * @version 1.2
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */
/**
 *
 * Spoof the session if we are using Firefox
 * Gets around the Flash Cookie Bug
 *
 */
if ($_GET['BROWSER'] == 'firefox' || $_GET['BROWSER'] == 'safari') {
    if ($_GET['AUTH'] == 'moodle') {
        if (!isset($_COOKIE['MoodleSession']) || !isset($_COOKIE['MOODLEID1_'])) {
            $temp = split('; ', $_GET['COOKIE']);
            if (!empty($temp)) {
                $cookie = array();
                foreach ($temp as $key => $value) {
                    $pair = split('=', $value);
                    $cookie[$pair[0]] = $pair[1];
                }
                $_COOKIE = $cookie; // We want to overwrite all
            }
        }
    } else {
        if (
                (!isset($_COOKIE['PHPSESSID']) && isset($_GET['PHPSESSID'])) ||
                ( isset($_COOKIE['PHPSESSID']) && isset($_GET['PHPSESSID']) && ($_COOKIE['PHPSESSID'] != $_GET['PHPSESSID']))) {
            session_id($_GET['PHPSESSID']);
        }
    }
}



require_once(dirname(__FILE__) . '/../../site/engine/upload.php');
