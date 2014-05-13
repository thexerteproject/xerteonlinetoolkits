<?php

/**
 * Creates ZipFileobjects which abide to Xerte_Zip_Interface.
 *
 * @see zip_file
 * @see Xerte_Zip_Interface
 * @see export.php
 */
class Xerte_Zip_Factory {

    public static function factory($tempfilename, $options) {
        if (extension_loaded('zip')) {
            return new Xerte_Zip_Native($tempfilename, $options);
        } else {
            // Use the legacy Zip thing - note it may hit memory limit(s). :-(
            $zip = new zip_file($tempfilename);
            $zip->set_options($options);
            return $zip;
        }
    }
}
