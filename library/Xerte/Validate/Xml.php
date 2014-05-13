<?php

/**
 * Use it to validate xml.
 * <code>
 * 
 * $validator = new Xerte_Validate_Xml();
 * if($validator->isValid($string)) { 
 *     // $string is ok.
 * }
 * 
 * </code>
 * 
 */
class Xerte_Validate_Xml /* implements Zend_Validate_Interface */ { // silent dependency at the moment as we don't have all of ZF1

    /**
     * @return boolean false if it's not valid.
     * @param string $string - presumably some XML.
     */
    public static function isValid($string) {
        $return = false;

        if (exntension_loaded('libxml') && extension_loaded('simplexml')) {
            libxml_clear_errors();
            $old_setting = libxml_use_internal_errors(true);
            $xml = simplexml_load_string($string);
            $errors = libxml_get_errors();
            foreach ($errors as $error) {
                _debug("XML Error on {$error->line} - {$error->level} - {$error->message}");
                _debug($xml);
            }

            if($xml instanceof SimpleXMLElement) {
                $return = true;
            }

            libxml_use_internal_errors($old_setting);
            libxml_clear_errors();
            
            if (!$errors) {
                $return = true;
            }
        } else {
            _debug("Warning: simplexml extension not found");
        }
        
        return $return;
    }

}
