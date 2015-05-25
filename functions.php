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
 * @param string $string - the message to write to the debug file.
 * @param int $up - how far up the call stack we go to; this affects the line number/file name given in logging
 */
function _debug($string, $up = 0) {
    global $development;
    if (isset($development) && $development) {
        if (!is_string($string)) {
            $string = print_r($string, true);
        }

        // yes, we really don't want to report file write errors if this doesn't work.

        $backtrace = debug_backtrace();
        if (isset($backtrace[$up]['file'])) {
            $string = $backtrace[$up]['file'] . $backtrace[$up]['line'] . $string;
        }
        $file = '/tmp/debug.log';
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $file = 'c:\debug.log';
        }

        if (defined('XOT_DEBUG_LOGFILE')) {
            $file = XOT_DEBUG_LOGFILE;
        }
        if (!file_exists($file)) {
            @touch($file); // try and create it.
        }


        if (!_is_writable($file)) { // fall back to PHP's inbuilt log, which may go to the apache log file, syslog or somewhere else.
            error_log($string);
        } else {
            @file_put_contents($file, date('Y-m-d H:i:s ') . $string . "\n", FILE_APPEND);
        }
    }
}

/**
 * Try loading a language file. This will lead to the definition of multiple constants.
 *
 *  We try and choose the language based on:
 *
 * 1. If the user has $_GET['language'] set, then try to use the value of this and persist it in $_SESSION['toolkits_language']
 * 2. If the user does not have $_GET['lanauge'] but does have $_SESSION['toolkits_language'] then use this
 * 3. If none of the above, then check what their browser offers through $_SERVER['HTTP_ACCEPT_LANGUAGE'] and try and use the best one.
 * 4. If we can't find a language to match the user, then fall back to en_GB (language pack languages/en-GB)
 *
 * @param string $file_path
 * @return boolean true on success; else false.
 */
function _load_language_file($file_path) {
    global $development;
    Zend_Locale::setDefault('en_GB');

    $languages = dirname(__FILE__) . '/languages/';

    if (isset($_REQUEST['language']) && is_dir($languages . $_REQUEST['language'])) {
        $_SESSION['toolkits_language'] = $_REQUEST['language'];
    }

    if (isset($_SESSION['toolkits_language'])) {
        $language = $_SESSION['toolkits_language'];
    } else {
        // this does some magic interrogation of $_SERVER['HTTP_ACCEPT_LANGUAGE'];
        $language = new Zend_Locale();
        // xerte seems to use en-GB instead of the more standard en_GB. Assume this convention will persist....
        $language_name = str_replace('_', '-', $language);
        // Check that Xerte supports the required language.
        if (!is_dir($languages . $language_name)) {

            // try and catch e.g. getting back 'en' as our locale - so choose any english language pack
            $found = false;
            foreach (glob($languages . $language->getLanguage() . '*') as $dir) {
                $found = true;
                $language_name = basename($dir);
                break;
            }
            if (!$found)
                $language_name = "en-GB";
        }
        $language = $language_name;
        $_SESSION['toolkits_language'] = $language;
    }


    $real_file_path = $languages . $language . $file_path;
    $en_gb_file_path = $languages . "en-GB" . $file_path;

    if ($language != "en-GB") {
        if (file_exists($real_file_path)) {
            require_once($real_file_path);
        } else {
            // stuff will break at this point.
            //die("Where was $real_file_path?");
            if ($development) {
                error_log("Failed to load language file for Xerte - $language/$file_path");
                //return false;
            }
        }
    }
    if (file_exists($en_gb_file_path)) {
        // prevent notices from redefines of other languages
        if ($development) {
            $prev_el = error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
        }
        require_once($en_gb_file_path);
        if ($development) {
            error_reporting($prev_el);
        }
    } else {
        // stuff will break at this point.
        //die("Where was $real_file_path?");
        error_log("Failed to load language file for Xerte - en-gb/$file_path");
        return false;
    }
    return true;
}

function _include_javascript_file($file_path) {

    global $xerte_toolkits_site;
    global $development;
    $languages = 'languages/';

    if (isset($_GET['language']) && is_dir($languages . $_GET['language'])) {
        $_SESSION['toolkits_language'] = $_GET['language'];
    }

    if (isset($_SESSION['toolkits_language'])) {
        $language = $_SESSION['toolkits_language'];
    } else {
        // this does some magic interrogation of $_SERVER['HTTP_ACCEPT_LANGUAGE'];
        $language = new Zend_Locale();
        // xerte seems to use en-GB instead of the more standard en_GB. Assume this convention will persist....
        $language_name = str_replace('_', '-', $language);
        // Check that Xerte supports the required language.
        if (!is_dir($languages . $language_name)) {

            // try and catch e.g. getting back 'en' as our locale - so choose any english language pack
            foreach (glob($languages . $language->getLanguage() . '*') as $dir) {
                $language = basename($dir);
                break;
            }
            $language_name = "en-GB";
        }
        $language = $language_name;
        $_SESSION['toolkits_language'] = $language;
    }


    $real_file_path = $languages . $language . '/' . $file_path;
    $en_gb_file_path = $languages . "en-GB/" . $file_path;

    _debug($language);
    _debug($real_file_path);
    _debug($en_gb_file_path);
    echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . $file_path . "\"></script>";
    if (file_exists(dirname(__FILE__) . "/" . $en_gb_file_path)) {
        echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . $en_gb_file_path . "\"></script>";
    } else {
        // stuff will break at this point.
        //die("Where was $real_file_path?");
        error_log("Failed to load language file for Xerte - en-GB/$file_path");
        return false;
    }

    if ($language != "en-GB") {
        if (file_exists(dirname(__FILE__) . "/" . $real_file_path)) {
            echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . $real_file_path . "\"></script>";
        } else {
            // stuff will break at this point.
            //die("Where was $real_file_path?");
            if ($development) {
                error_log("Failed to load language file for Xerte - $language/$file_path");
                return false;
            }
        }
    }
    return true;
}

function get_email_headers() {
    global $xerte_toolkits_site;

    $from = $xerte_toolkits_site->site_email_account;
    $extraheaders = str_replace("*", "\n", $xerte_toolkits_site->headers);
    $headers = "";
    if (strpos("From:", $extraheaders) === false) {
        $headers .= "From: " . $from . "\n" . $extraheaders;
    }
    if (strpos("Content-Type:", $extraheaders) === false) {
        $headers .= "Content-Type: text/html; charset=\"UTF-8\"";
    }
    $headers .= $extraheaders;
    return $headers;
}

// Replacement function for the standard php is_writable because of bugs in Windows
//
// From comments on the manual page of is_writable
//
// Since looks like the Windows ACLs bug "wont fix" (see http://bugs.php.net/bug.php?id=27609) I propose this alternative function:
//
function _is_writable($path) {

    if (is_dir($path) || $path{strlen($path) - 1} == '/')
        return _is_writable($path . ($path{strlen($path) - 1} == '/' ? "" : "/") . uniqid(mt_rand()) . '.tmp');

    if (file_exists($path)) {
        if (!($f = @fopen($path, 'r+')))
            return false;
        fclose($f);
        return true;
    }

    if (!($f = @fopen($path, 'w')))
        return false;
    fclose($f);
    unlink($path);
    return true;
}

// To prevent mistakes, also supply the alias
function __is_writable($path) {
    _is_writable($path);
}

function uid()
{
    mt_srand(crc32(microtime()));
    $prefix = sprintf("%05d", mt_rand(5,99999));

    return uniqid($prefix);
}
