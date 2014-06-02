<?php

/**
 * @see modules/site/engine/upload.php
 */

class Xerte_Validate_VirusScanClamAv {

    protected $messages = array();
    // perhaps needs changing on other platforms.
    public static $BINARY = '/usr/bin/clamscan';

    public static function canRun() {
        return file_exists(self::$BINARY);
    }

    public function isValid($filename) {
        $this->messages = array();
        if(file_exists($filename)) {
            $command = self::$BINARY . " " . escapeshellarg($filename);
            $retval = -1;
            exec($command, $output, $retval);

            if($retval == 0) {
                return true;
            }
            else {
                error_log("Virus found in file upload? $filename --- From " . __FILE__ . " - ClamAV output: {$retval} / {$output}");
                _debug("Virus found? {$retval} / {$output} (When scanning : $filename)");
                $this->messages[$retval] = "Virus found? $output";
            }
        }
        else {
            $this->messages['FILE_NOT_FOUND'] = "$filename doesn't exist. Cannot scan";
        }
        return false;
    }

    public function getMessages() {
        return $this->messages;
    }

    public function getErrors() {
        return array_keys($this->messages);
    }
}

