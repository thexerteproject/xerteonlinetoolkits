<?php

/**
 * @see modules/site/engine/upload.php
 */

/**
 * Wordpress filter (see add_filter), designed to hook in on the action/event 'editor_save_data'.
 *
 * Check that a file is free of viruses.
 * Return FALSE if it fails AV checking.
 * @param string $filename (as in $_FILES['xxx']['tmp_name'])
 * @return string filename (as in $_FILES['xxx']['tmp_name']) or boolean false if we can't upload it.
 */
function virus_check_file() {
    $args = func_get_args();
    $files = $args[0]; /* $_FILES like */

    if(Xerte_Validate_VirusScanClamAv::canRun()){
        foreach($files as $file) {
            $validator = new Xerte_Validate_VirusScanClamAv();
            if(!$validator->isValid($file['tmp_name'])) {
                die("Possible virus found in upload; Consult server log files for more information.");
            }
        }
    }
    return $files;
}


// perhaps have 'pre-flight check here' ?? e.g. explode if /usr/bin/clamscan doesn't exist.
add_filter('editor_upload_file', 'virus_check_file');

