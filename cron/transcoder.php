<?php

/**
 * Older versions of XOT allowed LO authors to upload .flv videos for embedding with the Learning Object.
 * Unfortunately, flv videos aren't compatible with HTML5 based templates and will not display on e.g. tablets as
 * Adobe Flash is not available. 
 * This cron job, when run will look for all videos which do not have an '.mp4' extension, and attempt to transcode (i.e. reformat) them.
 * the original file is left as is - so if you start with :
 *
 * USER-FILES/2-Test-Nottingham/media/something.flv
 * 
 * you'll end up with :
 *
 * USER-FILES/2-Test-Nottingham/media/something.flv
 * USER-FILES/2-Test-Nottingham/media/something.mp4
 *  
 * When the script runs it looks to see if a .mp4 variant of the file already exists, and if it does, it does nothing.
 *
 * Note, depending on your media files, running this may consume quite a lot of CPU / disk resource.
 * No 'intelligence' is included to cope with duplicated source media files - to reduce resource usage.
 *
 *
 * You'll need to have something like 'avconv' or 'ffmpeg' installed. See comments inline below.
 * It'll probably work best with ffmpeg. Perhaps.
 *
 */
require_once dirname(__FILE__) . '/../config.php';

if(!is_file('/usr/bin/avconv') && !is_File('/usr/bin/ffmpeg')) {
    die("Cannot run; /usr/bin/avconv or /usr/bin/ffmpeg does not appear to be present");
}

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

    if(is_file('/usr/bin/ffmpeg')) {
        $cmd = 'ffmpeg -i ' . escapeshellarg($inputFilename) . ' -sameq -ar 22050 -vcodec libx264  ' . escapeshellarg($outputFilename) . ' 2>&1' ;
    }
    else {
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
    }

    _debug("Running: $cmd");

    $output = array();
    $return = null;

    exec($cmd, $output, $return);

    _debug("Returned: $return, Output: " . print_r($output, true));
}
