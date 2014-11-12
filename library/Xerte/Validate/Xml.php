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
