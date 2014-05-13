<?php

/**
 * @see modules/site/engine/upload.php
 */

function filter_by_mimetype() {

    $args = func_get_args();
    $file_name = $args[0];
    $allowable_mimetypes = $args[1];

    $mime_type = mime_content_type($file_name);

    if(in_array($allowable_mime_types, $mime_type)) {
        return $file_name;
    }
    return false;
}

if(function_exists('mime_content_type')) {
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

    add_filter('editor_upload_file', 'filter_by_mimetype', $allowable_mime_types);
}
