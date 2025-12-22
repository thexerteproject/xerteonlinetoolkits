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
        //$language = new Zend_Locale();
        if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            if (function_exists("locale_accept_from_http")) {
                $language = locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);
            } else {
                $lang = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
                $language = $lang[0];
            }
        }
        if (isset($language)) {
            // xerte seems to use en-GB instead of the more standard en_GB. Assume this convention will persist....
            $language_name = str_replace('_', '-', $language);
            // Check that Xerte supports the required language.
            if (!is_dir($languages . $language_name)) {

                // try and catch e.g. getting back 'en' as our locale - so choose any english language pack
                $found = false;
                foreach (glob($languages . substr($language, 0, 2) . '*') as $dir) {
                    $found = true;
                    $language_name = basename($dir);
                    break;
                }
                if (!$found)
                    $language_name = "en-GB";
            }
            $language = $language_name;
        }
        else
        {
            $language = "en-GB";
        }
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
        $prev_el = error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
        require_once($en_gb_file_path);
        error_reporting($prev_el);
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

    // Remove URI parameters
    $parpos = strpos($file_path, "?");
    if ($parpos !== false)
    {
        $url_param=substr($file_path, $parpos);
        $file_path = substr($file_path, 0, $parpos);
    }
    if (isset($_GET['language']) && is_dir($languages . x_clean_input($_GET['language']))) {
        $_SESSION['toolkits_language'] = x_clean_input($_GET['language']);
    }

    if (isset($_SESSION['toolkits_language'])) {
        $language = x_clean_input($_SESSION['toolkits_language']);
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
    if (file_exists(dirname(__FILE__) . "/" . $en_gb_file_path)) {
        echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . $en_gb_file_path . $url_param . "\"></script>";
    } else {
        // stuff will break at this point.
        //die("Where was $real_file_path?");
        error_log("Failed to load language file for Xerte - en-GB/$file_path");
        return false;
    }

    if ($language != "en-GB") {
        if (file_exists(dirname(__FILE__) . "/" . $real_file_path)) {
            echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . $real_file_path . $url_param . "\"></script>";
        } else {
            // stuff will break at this point.
            //die("Where was $real_file_path?");
            if ($development) {
                error_log("Failed to load language file for Xerte - $language/$file_path");
            }
        }
    }
    echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . $file_path . $url_param . "\"></script>";
    return true;
}

function get_email_headers() {
    global $xerte_toolkits_site;

    $from = $xerte_toolkits_site->site_email_account;
    $extraheaders = str_replace("*", "\n", $xerte_toolkits_site->headers);
    $headers = "";
    if (strpos($extraheaders, "From:") === false) {
        $headers .= "From: " . $from . "\n";
    }
    if (strpos($extraheaders, "Content-Type:") === false) {
        $headers .= "Content-Type: text/html; charset=\"UTF-8\"\n";
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

    if (is_dir($path) || $path[strlen($path) - 1] == '/')
        return _is_writable($path . ($path[strlen($path) - 1] == '/' ? "" : "/") . uniqid(mt_rand()) . '.tmp');

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

function getVersion()
{
    $version = file(dirname(__FILE__) . "/version.txt", FILE_IGNORE_NEW_LINES);
    return str_replace(' ', '_', $version[0]);
}

function true_or_false($var)
{
    // Return logical true for various values of a variable, anything else is false.

    $var = trim($var);

    if ($var === true || $var === 1 || strcasecmp($var, 'true') === 0 || strcasecmp($var, 'yes') === 0 || strcasecmp($var, '1') === 0) {
        return true;
    }

    return false;
}

// Function to prevent XSS vulnarabilities in arrays
// Do NOT use x_clean_input in the implementation, as Snyk does not understand that
function x_clean_input_array($input, $expected_type = null, $specialcharsflags = ENT_QUOTES|ENT_SUBSTITUTE)
{
    $array_type = null;
    if ($expected_type == 'array_numeric') {
        $array_type = 'numeric';
    } else if ($expected_type == 'array_string') {
        $array_type = 'string';
    }
    $sanitized = array();
    foreach ($input as $key => $value) {
        $sanitized[$key] = trim($input[$key]);
        $sanitized[$key] = stripslashes($sanitized[$key]);
        $sanitized[$key] = htmlspecialchars($sanitized[$key], $specialcharsflags);
        if ($array_type != null) {
            if ($array_type == 'string') {
                if (!is_string($sanitized[$key])) {
                    die("Expected string, got " . htmlspecialchars($sanitized[$key], $specialcharsflags));
                }
            } else if ($array_type == 'numeric') {
                if (!is_numeric($sanitized[$key])) {
                    die("Expected numeric value, got ". htmlspecialchars($sanitized[$key],$specialcharsflags));
                }
            }
        }
    }
    if ($expected_type != null) {
        if ($expected_type == 'array_numeric') {
            if (!is_array($sanitized)) {
                die("Expected numeric array, got " . htmlspecialchars($sanitized,$specialcharsflags));
            }
        } else if ($expected_type == 'array_string') {
            if (!is_array($sanitized)) {
                die("Expected string array, got " . htmlspecialchars($sanitized,$specialcharsflags));
            }
        }
    }
    return $sanitized;
}


// Function to prevent XSS vulnarabilities
function x_clean_input($input, $expected_type = null, $specialcharsflags = ENT_QUOTES|ENT_SUBSTITUTE)
{
    if (is_array($input)) {
        $sanitized =  x_clean_input_array($input, $expected_type, $specialcharsflags);
        return $sanitized;
    }
    $sanitized = trim($input);
    $sanitized = stripslashes($sanitized);
    $sanitized = htmlspecialchars($sanitized, $specialcharsflags);
    if ($expected_type != null) {
        if ($expected_type == 'string') {
            if (!is_string($sanitized)) {
                die("Expected string, got " . htmlspecialchars($sanitized, $specialcharsflags));
            }
        }
        else if ($expected_type == 'numeric') {
            if (!is_numeric($sanitized)) {
                die("Expected numeric value, got " . htmlspecialchars($sanitized, $specialcharsflags));
            }
        }
    }
    return $sanitized;
}

function x_clean_input_json($input)
{
    $sanitized = trim($input);
    $sanitized = stripslashes($sanitized);
    $sanitized = htmlspecialchars($sanitized,  ENT_NOQUOTES);
    if (!is_string($sanitized)) {
        die("Expected string, got " . htmlspecialchars($sanitized,  ENT_NOQUOTES));
    }
    return $sanitized;
}

function x_check_blacklisted_extensions($filename)
{
    global $xerte_toolkits_site;
    $ext = pathinfo($filename, PATHINFO_EXTENSION);
    // Do not allow .php,.php[0-9],.phar,.inc and all other blacklisted extensions
    if (in_array(strtolower($ext), array('php', 'php1', 'php2', 'php3', 'php4', 'php5', 'php6', 'php7', 'php8', 'phar', 'inc'))) {
        die("File has invalid file extension: " . x_clean_input($filename));
    }
    if (in_array(strtolower($ext), $xerte_toolkits_site->file_extensions))
    {
        die("File has invalid file extension specified on management page: " . x_clean_input($filename));
    }
    // Take special care with .htaccess
    if (strtolower($ext) == 'htaccess') {
        die("File is .htaccess, which is not allowed: " . x_clean_input($filename));
    }
}

function x_check_zip($zip, $type="")
{
    // Iterate over files in ZipArchive object to check for any files that are not allowed
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        if (strpos($filename, '..') !== false) {
            die("Zip archive contains path names with path traversal: " .  x_clean_input($filename));
        }
        if (strpos($filename, '/') === 0) {
            die("Zip archive contains files with absolute paths: " . x_clean_input($filename));
        }
        if ($type == "language_pack")
        {
            // Check whether the file is a valid language pack file
            if (strpos($filename, 'languages/') !== 0
                && strpos($filename, 'Nottingham/') !== 0
                && strpos($filename, 'site/') !== 0
                && strpos($filename, 'wizards/') !== 0)
            {
                die("Zip archive contains files that are not in one of the expected language pack folders or an invalid folder is encountered: " . x_clean_input($filename));
            }
            // If it is one of those folders, continue
            if ($filename === 'languages/' || $filename === 'Nottingham/' || $filename === 'site/' || $filename === 'wizards/') {
                continue;
            }
            // Only allow .js or .inc files
            $ext = pathinfo($filename, PATHINFO_EXTENSION);
            if ($ext != 'js' && $ext != 'inc' && $ext != 'xwd' && $ext != 'xml') {
                die("Zip archive contains files with invalid file extension: " . x_clean_input($filename));
            }
        }
        else if ($type == "template" || $type == "theme_package")
        {
            global $xerte_toolkits_site;
            // Check whether the file is a valid template file
            //Do not allow .php,.php[0-9],.phar,.inc and all other blacklisted extensions
            $ext = pathinfo($filename, PATHINFO_EXTENSION);
            if (in_array(strtolower($ext), array('php', 'php1', 'php2', 'php3', 'php4', 'php5', 'php6', 'php7', 'php8', 'phar', 'inc'))) {
                die("Zip archive contains files with invalid file extension: " . x_clean_input($filename));
            }
            if (in_array(strtolower($ext), $xerte_toolkits_site->file_extensions))
            {
                die("Zip archive contains files with invalid file extension specified on management page: " . x_clean_input($filename));
            }
            // Take special care with .htaccess
            if (strtolower($ext) == 'htaccess') {
                die("Zip archive contains .htaccess file, which is not allowed: " . x_clean_input($filename));
            }
        }
        else
        {
            global $xerte_toolkits_site;
            // Check whether the file is a valid theme file
            //Do not allow .php,.php[0-9],.phar,.inc and all other blacklisted extensions
            $ext = pathinfo($filename, PATHINFO_EXTENSION);
            if (in_array(strtolower($ext), array('php', 'php1', 'php2', 'php3', 'php4', 'php5', 'php6', 'php7', 'php8', 'phar', 'inc'))) {
                die("Zip archive contains files with invalid file extension: " . x_clean_input($filename));
            }
            if (in_array(strtolower($ext), $xerte_toolkits_site->file_extensions))
            {
                die("Zip archive contains files with invalid file extension specified on management page: " . x_clean_input($filename));
            }
            // Take special care with .htaccess
            if (strtolower($ext) == 'htaccess') {
                die("Zip archive contains .htaccess file, which is not allowed: " . x_clean_input($filename));
            }
        }
    }
}

function x_check_path_traversal($path, $expected_path=null, $message=null)
{
    global $xerte_toolkits_site;
    $mesg = ($message != null ? $message : "Path traversal detected!");
    // Account for Windows, because realpath changes / to \
    if(DIRECTORY_SEPARATOR !== '/') {
        $rpath = str_replace('/', DIRECTORY_SEPARATOR, $path);
        if ($expected_path != null) {
            $rexpected_path = str_replace('/', DIRECTORY_SEPARATOR, $expected_path);
        }
    }
    else
    {
        $rpath = $path;
        $rexpected_path = $expected_path;
    }
    // Trim dangling DIRECTORY_SEPARATOR
    $rpath = rtrim($rpath, '/\\');
    // Check path and check for path traversal
    $realpath = realpath($rpath);
    if ($realpath === false || $realpath !== $rpath)
    {
        _debug($mesg);
        die($mesg);
    }
    if ($expected_path != null) {
        // Check whether path is as expected
        if (strpos($rpath, $rexpected_path) !== 0) {
            _debug($mesg);
            die($mesg);
        }
        if ($expected_path == $xerte_toolkits_site->users_file_area_full) {
            // Check whether the path is inside a folder of the users_file_area_full
            // First determine whether rpath is a folder
            if (is_dir($rpath))
            {
                // It must be different from the users_file_area_full
                if ($rpath === $xerte_toolkits_site->users_file_area_full) {
                    _debug($mesg);
                    die($mesg);
                }
            }
            else
            {
                // Remove the users_file_area_full from the path
                $rpath = substr($rpath, strlen($rexpected_path));
                if (strpos($rpath, DIRECTORY_SEPARATOR) === false) {
                    _debug($mesg);
                    die($mesg);
                }
            }
        }
    }
}

function x_check_path_traversal_newpath($path, $expected_path=null, $message=null)
{
    $mesg = ($message != null ? $message : "Path traversal detected!");
    // Account for Windows, because realpath changes / to \
    if(DIRECTORY_SEPARATOR !== '/') {
        $rpath = str_replace('/', DIRECTORY_SEPARATOR, $path);
        if ($expected_path != null) {
            $expected_path = str_replace('/', DIRECTORY_SEPARATOR, $expected_path);
        }
    }
    else
    {
        $rpath = $path;
    }
    // Trim dangling DIRECTORY_SEPARATOR
    $rpath = rtrim($rpath, '/\\');
    // path is new, so realpath does not work, check for ../ and encoded variations
    if (strpos($rpath, '..') !== false || stripos($rpath, '%2e%2e') !== false)
    {
        _debug($mesg);
        die($mesg);
    }
    if ($expected_path != null) {
        // Check whether path is as expected
        if (strpos($rpath, $expected_path) !== 0) {
            _debug($mesg);
            die($mesg);
        }
    }
}


function x_convert_user_area_url_to_path($url)
{
    global $xerte_toolkits_site;
    $path = $url;
    // Check whether this is an absolute path, strip the root path and convert to a relative path
    if (stripos($path, 'http') === 0)
    {
        // Check whether the path is actually an url starting with site_url
        if (stripos($path, $xerte_toolkits_site->site_url) === 0)
        {
            $path = substr($path, strlen($xerte_toolkits_site->site_url));
        }
        else
        {
            _debug("URL to user area to convert to path is not a valid url: " . x_clean_input($url));
            die("URL to user area to convert to path is not a valid url: " . x_clean_input($url));
        }
    }
    // Check whether the path is a relative path that starts with users_file_area_short, if so strip the users_file_area_short
    if (stripos($path, $xerte_toolkits_site->users_file_area_short) === 0)
    {
        $path = substr($path, strlen($xerte_toolkits_site->users_file_area_short));
    }
    else
    {
        _debug("URL to user area to convert to path is not a valid url: " . x_clean_input($url));
        die("URL to user area to convert to path is not a valid url: " . x_clean_input($url));
    }
    // Prepend with users_file_area_full
    $path = $xerte_toolkits_site->users_file_area_full . $path;

    return $path;
}

function set_token()
{
    if (!isset($_SESSION['token'])) {
        $_SESSION['token'] = uid();
    }
}

function x_set_session_name()
{
    global $xerte_toolkits_site;
    $hash = hash('sha256', $xerte_toolkits_site->site_url);
    $hash = substr($hash, -6);
    $hash = str_replace('=', '', $hash);
    $current_session_name = session_name();
    session_name($current_session_name . "_" . $hash);
}