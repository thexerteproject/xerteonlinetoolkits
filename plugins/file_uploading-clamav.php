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
    $file_name = $args[0];

    if(file_exists($file_name)) {
        $command = "/usr/bin/clamscan " . escapeshellarg($file_name);
        $retval = -1;
        exec($command, $output, $retval);

        if($retval == 0) {
            return $file_name;
        }
        else {
            _debug("Virus found? {$retval} / {$output} (When scanning : $file_name)");
            error_log("Virus found in file upload? From " . __FILE__ . " - ClamAV output: {$retval} / {$output}");
            die("Possible virus found; aborting upload. Consult server log files for more information.");
            return false;
        }
    }
    return $file_name;
}

function _is_clamav_available()  {
    return file_exists('/usr/bin/clamav') && is_executable('/usr/bin/clamav');
}


// perhaps have 'pre-flight check here' ?? e.g. explode if /usr/bin/clamscan doesn't exist.
//
if(_is_clamav_available()) {
    add_filter('editor_upload_file', 'virus_check_file');
}

