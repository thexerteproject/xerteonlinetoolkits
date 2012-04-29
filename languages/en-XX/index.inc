<?php

/**
 * 
 * index.php english language file
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Pat Lockley
 * @package
 */

$text_list  = file(dirname(__FILE__) . '/../en-GB/index.inc');

foreach($text_list as $line) {
    // define("INDEX_USERNAME_AND_PASSWORD_EMPTY", "Please enter your username and password");
    $line = trim($line);
    if(preg_match('/^define\("([-_a-z]+)", "(.*)"\)/i', $line, $matches)) {
        define($matches[1], strrev($matches[2]));
    }
}

define("INDEX_LOGIN", 'xxxxx');
define("INDEX_USERNAME", "asdajkda");
define("INDEX_PASSWORD", 'asdasdas');
define("INDEX_HELP_TITLE", "asdasdads");
define("INDEX_HELP_INTRO_LINK_TEXT", "asdasdasdasd");
