<?php

/**
 * @see modules/versioncontrol/template_close.php
 * @see modules/versioncontrol/update_file.php
 */

/**
 * Wordpress filter (see add_filter), designed to hook in on the action/event 'editor_save_data'.
 *
 * Check the validity of the XML passed in when saving a template via use of simplexml_load_string.
 * If there are errors, we _debug() them and return boolean false.
 * If there aren't any errors, we return the pretty printed variant of the string.
 *
 * @return string (xml) or boolean false on failure
 */
function xml_check_parseability() {
    $args = func_get_args();
    $xml_string = $args[0];
    $validator = new Xerte_Validate_Xml();
    if($validator->isValid($xml_string)) {
        _debug("XML parsing passed");
        return $xml_string;
    }
    else {
        _debug("Invalid XML passed in : '{$xml_string}'");
        error_log("Invalid XML passed in : '{$xml_string}'");
        return false;
    }
}

if(class_exists('Xerte_Validate_Xml', true)) { /* allow Xerte to try and autoload it */
    add_filter('editor_save_data', 'xml_check_parseability');
    add_filter('editor_save_preview', 'xml_check_parseability');
}
