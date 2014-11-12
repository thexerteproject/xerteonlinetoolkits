<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/**
 * Perform a recursive listing of files under $path.
 * Returns a list of the full path file names.
 * Ignores . and ..
 * 
 * @param string $path
 * @return array
 */
function get_recursive_file_list($path) {
    $files = array();
    if (is_dir($path)) {
        $dp = opendir($path);
        while ($f = readdir($dp)) {
            if ($f != '.' && $f != '..') {
                $tmp = get_recursive_file_list($path . DIRECTORY_SEPARATOR . $f);
                $files = array_merge($files, $tmp);
            }
        }
    } else {
        $files[] = realpath($path);
    }
    return $files;
}

/**
 * Create a temporary directory.
 * @return string $dirPath - e.g /tmp/xaysdij34
 * 
 * see http://stackoverflow.com/questions/1707801/making-a-temporary-dir-for-unpacking-a-zipfile-into 
 */
function tempdir($dir = false, $prefix = 'php') {
    $tempfile = tempnam(sys_get_temp_dir(), '');
    if (file_exists($tempfile)) {
        unlink($tempfile);
    }
    if (mkdir($tempfile)) {
        if (is_dir($tempfile)) {
            return $tempfile;
        }
    }
    return false;
}

/**
 * List all directories recursively, depth-first.
 * 
 * @param string $path
 * @return array of strings, where each is a directory path.
 */
function get_recursive_directory_list($path) {
    $dirs = array();
    if (is_dir($path)) {
        $dp = opendir($path);
        while ($f = readdir($dp)) {
            if ($f != '.' && $f != '..') {
                $tmp = get_recursive_directory_list($path . DIRECTORY_SEPARATOR . $f);
                $dirs = array_merge($dirs, $tmp);
            }
        }
        $dirs[] = realpath($path);
    } 
    return $dirs; /* deepest first */

}

/**
 * Recursively delete everything below $path (including $path itself).
 * 
 * @param string $path
 * @param bool $include_directories - if false, we only do files.
 */
function recursive_delete($path, $include_directories = false) {
    if(!file_exists($path)) {
        return null;
    }
    
    $files = get_recursive_file_list($path);
    foreach($files as $file) {
        unlink($file);
    }
    
    if($include_directories) {
        $directories = get_recursive_directory_list($path);
        foreach($directories as $d) {
            rmdir($d);
        }
    }
}

/**
 * 
 * Function delete loop
 * This function checks http security settings
 * @param string $path = the path we are deleting
 * @version 1.0
 * @author Patrick Lockley
 */
function delete_loop($path) {

    global $delete_folder_array, $delete_file_array;
    $delete_file_array = get_recursive_file_list($path);
    return $delete_file_array;
}

/**
 * 
 * Function copy loop
 * This function checks http security settings
 * @param string path = the path we are copying
 * @version 1.0
 * @author Patrick Lockley
 */
function copy_loop($path) {
    global $copy_file_array;
    $copy_file_array = get_recursive_file_list($path);
    return $copy_file_array;
}
