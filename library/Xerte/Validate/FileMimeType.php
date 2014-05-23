<?php

/**
 * Use this to validate the mime type of a file.
 */
class Xerte_Validate_FileMimeType {

    public static $allowableMimeTypeList = array();

    protected $messages = array();

    /**
     * we need to know if the PHP env supports this validator.
     */
    public static function canRun() {
        return function_exists('mime_content_type');
    }

    /**
     * @return boolean true if ok.
     * @param string file name. e.g. /etc/passwd, /usr/bin/blah, c:/blah, /tmp/php_upload/blah
     */
    public function isValid($file_name) {
        $this->messages = array();
        if(self::canRun()) {
            if(file_exists($file_name)) {
                $mime_type = mime_content_type($file_name);
                if(in_array($mime_type, self::$allowableMimeTypeList)) {
                    return true;
                }
                $this->messages['INVALID_MIME_TYPE'] = "$mime_type is not in list of allowable types";
            }
            $this->messages['FILE_NOT_FOUND'] = "File not found - $file_name";
        }
        else {
            $this->messages['UNSUPPORTED'] = "Can't run - function: mime_content_type not found";
        }
        return false;
    }

    /**
     * @return array of error messages (if any).
     */
    public function getMessages() {
        return $this->messages;
    }
    public function getErrors() {
        return array_keys($this->messages);
    }
}
