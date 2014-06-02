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

    protected $messages = array();


    /**
     * @return boolean false if it's not valid.
     * @param string $string - presumably some XML.
     */
    public function isValid($string) {
        $return = false;
        $this->messages = array();
        if (extension_loaded('libxml') && extension_loaded('simplexml')) {
            libxml_clear_errors();
            $old_setting = libxml_use_internal_errors(true);
            $xml = simplexml_load_string($string);
            $errors = libxml_get_errors();
            foreach ($errors as $error) {
                $this->messages[$error->line] = $error->message;
                _debug("XML Error on {$error->line} - {$error->level} - {$error->message}");
                _debug($xml);
            }

            if($xml instanceof SimpleXMLElement) {
                $return = true;
            }

            libxml_use_internal_errors($old_setting);
            libxml_clear_errors();
        } else {
            _debug("Warning: simplexml extension not found");
        }
        
        return $return;
    }

    /**
     * @return array
     */
    public function getMessages() {
        return $this->messages;
    }


    /**
     * @return array of line numbers where there was a problem, or an empty array.
     */
    public function getErrors() {
        return array_keys($this->messages);
    }
}
