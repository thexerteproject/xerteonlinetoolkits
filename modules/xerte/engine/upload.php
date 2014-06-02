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



require_once(dirname(__FILE__) . '/../../site/engine/upload.php');
