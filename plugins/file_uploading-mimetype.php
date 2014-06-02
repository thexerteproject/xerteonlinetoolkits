<?php

/**
 * @see modules/site/engine/upload.php
 */

function filter_by_mimetype() {

    $args = func_get_args();
    $files = $args[0];
    _debug($args);
    foreach($files as $file) {
        _debug("Checking {$file['name']} for mimetype etc");
        
        $user_filename = $file['name'];
        $php_upload_filename = $file['tmp_name'];
        
        $validator = new Xerte_Validate_FileMimeType();
        if($validator->isValid($php_upload_filename)) {
            _debug("Mime check of $php_upload_filename ($user_filename) - ok");
        }
        else {
            _debug("Mime check of $php_upload_filename ($user_filename) failed. ");
            return false;
        }
    }
    return $files;
}

if(Xerte_Validate_FileMimeType::canRun()) {
    // this array should probably be defined within config.php as it's likely to be a per site setting.
    // hopefully these are 'safe-by-default'.
    $allowable_mime_types = array(
        'text/plain',
        'text/xml',

        'image/jpg',
        'image/png',
        'image/bmp',
        'image/gif',
        'image/svg+xml',

        'application/svg',

        'audio/mp3',
        'audio/mpeg',

        'video/mp4',
        'video/quicktime',
        'video/mpeg',
        'application/ogg', // .ogg files can be video or audio.
        'application/x-shockwave-flash', // ??

        'application/msword',
        'application/vnd.ms-powerpoint', // ??
        'application/pdf', 
        'text/rtf',
        // add other 'permissible' formats here.
    );

    Xerte_Validate_FileMimeType::$allowableMimeTypeList = $allowable_mime_types;
    add_filter('editor_upload_file', 'filter_by_mimetype');
}
