<?php

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


/**
 * 	Now bring in config.php
 */
require_once("../../../config.php");

require_once("../../../plugins.php");

/**
 * 	Now we check that the session has a valid, logged in user
 */
if (!isset($_SESSION['toolkits_logon_username'])) {
    die("Not logged in; perhaps session has timed out?");
}


if (!empty($_FILES)) {
    if(!apply_filters('editor_upload_file', $_FILES)) {
        _debug("file upload for " . print_r($_FILES, true) . " failed. ");
        die("File upload failed; check server logs.");
    }
}
else {
    die("No file(s) uploaded");
}

/**
 *  These checks remain from R708
 */
$pass = true;
if (strpos($_FILES['Filedata']['name'], '../') !== false)
    $pass = false;
if (strpos($_FILES['Filedata']['name'], '...') !== false)
    $pass = false;

if ($pass === false) {
    receive_message($_SESSION['toolkits_logon_username'], "UPLOAD", "CRITICAL", "Invalid filename: " . $_FILES['Filedata']['name'], "Invalid filename: " . $_FILES['Filedata']['name']);
    exit();
}


/**
 *  Passed all the checks so lets try to write the file
 */
$new_file_name = $xerte_toolkits_site->root_file_path . $_GET['path'] . $_FILES['Filedata']['name'];
if (!move_uploaded_file($_FILES['Filedata']['tmp_name'], $new_file_name)) {
    receive_message($_SESSION['toolkits_logon_username'], "UPLOAD", "CRITICAL", "Error saving file: " . $new_file_name, "Error saving file: " . error_get_last());
    exit();
}
