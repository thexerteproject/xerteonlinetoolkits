<?php

require_once __DIR__ . '/../config.php';

$finfo = new finfo(FILEINFO_MIME_TYPE);
$files = glob($xerte_toolkits_site->users_file_area_full . '*/media/*');


foreach ($files as $filename) {

    $mimeType = $finfo->file($filename);
    $extension = pathinfo($filename, PATHINFO_EXTENSION);

    if ($extension !== 'mp4' && preg_match('!video!', $mimeType)) {
        // have a video that may need transcoding

        // has video already been transcoded?
        $mp4Filename = preg_replace('!' . preg_quote($extension, "!") . '$!', 'mp4', $filename, 1); // replace the extension with "mp4"
        if (file_exists($mp4Filename)) {
            // have a mp4 version.
            continue;
        }

        // need to transcode a mp4 version
        add_transcode_job($filename, $mp4Filename);
    }
}


function add_transcode_job($inputFilename, $outputFilename)
{   
    // Ubuntu 14.04 - libav-tools, libavcodec-extra-54

    $cmd = 'avconv '
        . '-i ' . escapeshellarg($inputFilename)    // input filename
        . ' -c:v h264 '                             // video codec
        . '-b:v 2000k '                             // video bitrate
        . '-c:a aac '                               // audio codec
        . '-b:a 196k '                              // audio bitrate
        . '-f mp4 '                                 // file format
        . '-strict experimental '                   // enable aac codec
        . escapeshellarg($outputFilename)           // output filename
        . ' 2>&1';

    _debug("Running: $cmd");

    $output = array();
    $return = null;

    exec($cmd, $output, $return);

    _debug("Returned: $return, Output: " . print_r($output, true));
}
