<?php

/**
 * @param string $string - the message to write to the debug file.
 * @param int $up - how far up the call stack we go to; this affects the line number/file name given in logging
 */
function _debug($string, $up = 0)
{
    global $development;
    if (isset($development) && $development) {
        // yes, we really don't want to report file write errors if this doesn't work.
        $backtrace = debug_backtrace();
        if (isset($backtrace[$up]['file'])) {
            $string = $backtrace[$up]['file'] . $backtrace[$up]['line'] . $string;
        }
        @file_put_contents('/tmp/debug.log', date('Y-m-d H:i:s ') . $string . "\n", FILE_APPEND);
    }
}

/**
 * Try loading a language file. This will lead to the definition of multiple constants.
 * 
 *  We try and choose the language based on:
 *  
 * 1. If the user has $_GET['language'] set, then try to use the value of this and persist it in $_SESSION['default_language']
 * 2. If the user does not have $_GET['lanauge'] but does have $_SESSION['default_language'] then use this
 * 3. If none of the above, then check what their browser offers through $_SERVER['HTTP_ACCEPT_LANGUAGE'] and try and use the best one.
 * 4. If we can't find a language to match the user, then fall back to en_GB (language pack languages/en-GB)
 * 
 * @param string $file_path
 * @return boolean true on success; else false.
 */
function _load_language_file($file_path)
{

    Zend_Locale::setDefault('en_GB');

    $languages = dirname(__FILE__) . '/languages/';

    if (isset($_GET['language']) && is_dir($languages . $_GET['language'])) {
        $_SESSION['default_language'] = $_GET['language'];
    }

    if (isset($_SESSION['default_language'])) {
        $language = $_SESSION['default_language'];
    } else {
        // this does some magic interrogation of $_SERVER['HTTP_ACCEPT_LANGUAGE'];
        $language = new Zend_Locale();
        // xerte seems to use en-GB instead of the more standard en_GB. Assume this convention will persist....
        $language = str_replace('_', '-', $language);
        // Check that Xerte supports the required language.
        if (!is_dir(dirname(__FILE__) . '/languages/' . $language)) {
            // try and catch e.g. getting back 'en' as our locale - so choose any english language pack
            foreach (glob($languages . $language . '*') as $dir) {
                $language = basename($dir);
                break;
            }
        }
    }



    $real_file_path = dirname(__FILE__) . '/languages/' . $language . $file_path;

    if (file_exists($real_file_path)) {
        require_once($real_file_path);
    } else {
        // stuff will break at this point.
        //die("Where was $real_file_path?");
        error_log("Failed to load language file for Xerte - $language / $file_path");
        return false;
    }
    return true;
}
