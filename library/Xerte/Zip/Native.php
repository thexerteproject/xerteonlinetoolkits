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

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Native
 *
 * @author david
 */
class Xerte_Zip_Native implements Xerte_Zip_Interface {
    /* @var $zip ZipArchive */

    private $zip = null;
    public $error = array();

    /* @var $filename string file path to where the zip thing is */
    private $filename = null;

    public function __construct($filename, $options) {
        _debug("Welcome");
        $this->filename = $filename;
        $this->options = $options;
        $this->zip = new ZipArchive();

        $ok = $this->zip->open($filename, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        if (!$ok) {
            $this->error[] = "Can't read $filename / create archive / overwrite archive";
            error_log("Failed to create zip : $filename, $ok");
            throw new Exception("Failed to create Zip: $filename");
        }
    }

    public function add_files($things) {

        if (!is_array($things)) {
            $things = array($things);
        }

        foreach ($things as $thing) {
            $localName = $thing;
            if (isset($this->options['basedir'])) {
                $localName = $thing;
                $thing = $this->options['basedir'] . DIRECTORY_SEPARATOR . $thing;
            }
            _debug("Adding $localName (from: $thing) to zip");
            $this->zip->addFile($thing, $localName);
        }
    }

    public function set_options(array $options) {
        
    }

    public function create_archive() {
        $this->zip->close();
    }

    public function download_file($downloadFilename) {
        $fp = fopen($this->filename, 'rb');
        $downloadFilename = preg_replace('/[^-_a-z0-9\.]/i', '', $downloadFilename);

        header("Content-Type: application/zip");
        header("Pragma: public");
        header('Content-disposition: attachment; filename="' . $downloadFilename . '.zip"');
        //header("Cache-Control: no-cache, must-revalidate, post-check=0, pre-check=0");
        //header("Expires: Sat, 01 Jan 2000 12:00:00 GMT");
        header("Content-Transfer-Encoding: binary");
        $filesize = filesize($this->filename);
        
        header("Content-Length: {$filesize}");

        while (!feof($fp)) {
            echo fread($fp, 8192);
        }
        //$bytes = fpassthru($fp);
        _debug("Wrote : {$filesize} . bytes ... hopefully");
        fclose($fp);
    }

}
