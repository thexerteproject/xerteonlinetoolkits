<?php

/**
 * @see modules/site/engine/upload.php
 */

/**
 * When uploading binary video-like files, they will need transcoding to work well on the various browsers.
 * 
 * This plugin should add a job to a queue for transcoding (via ffmpeg) for each video.
 * 
 * e.g. The queue should/would/could look like :
 * 
 * array( 2-Xerte-Nottingham/media/something.avi, 3-Guest-Nottingham/media/blah-fish-blah.ogg, .... );
 * 
 * We need to :
 * 
 * a. Populate said queue (i.e. if, after an upload,  a file needs transcoding? if so, add to queue).
 * b. Have a cron job which goes through the queue removing things and performing the necessary transcoding.
 * 
 * We need :
 * 
 * 1. Video format(s) for Chrome - .mp4 works well.
 * 2. Video format(s) for IE9/10 - .wmv works well.
 * 3. Video format(s) for Firefox - .ogg works well?
 * 
 * 
 */

/**
 * @param string - file name e.g. 2-Guest-Nottingham/media/blah.ogg
 * @return string - file name for any other filters to look at/use.
 */
function transcoding_check_file() {
    $args = func_get_args();
    $file = $args[0]; /* 2-Guest-Nottingham/media/something.mpg */

    if(Xerte_Multimedia_Transcoder::canRun()) { 
        
        $transcoder = new Xerte_Multimedia_Transcoder();
        if($transcoder->needToTranscode($file)) {
                $transcoder->queueForTranscoding($file);
        }
    }
    return $file;
}


// perhaps have 'pre-flight check here' ?? e.g. explode if /usr/bin/clamscan doesn't exist.
add_filter('editor_post_upload_file', 'transcoding_check_file');

