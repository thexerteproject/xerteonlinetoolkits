<?php


/**
 * functions required in an object which zips stuff up.
 * These seem to be the ones used by export.php....
 */
interface Xerte_Zip_Interface {
    
    /* array or single string file */
    public function add_files($file_or_list);
    public function set_options(array $array);
    
    /* signal we've added everything and we're ready to package it all up */
    public function create_archive();

    /**
     * write stuff out to the browser; provide $downloadName
     * as the attachment file name that appears to the user 
     * @param string $downloadName
     */
    public function download_file($downloadName);
}
