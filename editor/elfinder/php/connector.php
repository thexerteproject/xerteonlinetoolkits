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
 * Created by Tom Reijnders
 */

/**
 * Customized connector, uses session variables to set the root paths
 */

error_reporting(0); // Set E_ALL for debuging

//session_start();

require_once(dirname(__FILE__).DIRECTORY_SEPARATOR."../../../config.php");

if (!isset($_SESSION['toolkits_logon_id'])){
    header("location: ../../../index.php");
}
// Get session data to set paths
$rootpath = $_REQUEST['uploadDir'];
$rooturl = $_REQUEST['uploadURL'];

if (strpos($rootpath, 'USER-FILES') === false  || strpos($rootpath, '../') !== false || strpos($rooturl, 'USER-FILES') === false)
{
    die("Invalid upload location");
}

include_once dirname(__FILE__).DIRECTORY_SEPARATOR.'elFinderConnector.class.php';
include_once dirname(__FILE__).DIRECTORY_SEPARATOR.'elFinder.class.php';
include_once dirname(__FILE__).DIRECTORY_SEPARATOR.'elFinderVolumeDriver.class.php';
include_once dirname(__FILE__).DIRECTORY_SEPARATOR.'elFinderVolumeLocalFileSystem.class.php';
// Required for MySQL storage connector
// include_once dirname(__FILE__).DIRECTORY_SEPARATOR.'elFinderVolumeMySQL.class.php';
// Required for FTP connector support
// include_once dirname(__FILE__).DIRECTORY_SEPARATOR.'elFinderVolumeFTP.class.php';


/**
 * Simple function to demonstrate how to control file access using "accessControl" callback.
 * This method will disable accessing files/folders starting from '.' (dot)
 *
 * @param  string  $attr  attribute name (read|write|locked|hidden)
 * @param  string  $path  file path relative to volume root directory started with directory separator
 * @return bool|null
 **/
function access($attr, $path, $data, $volume) {
	return strpos(basename($path), '.') === 0       // if file/folder begins with '.' (dot)
		? !($attr == 'read' || $attr == 'write')    // set read+write to false, other (locked+hidden) set to true
		:  null;                                    // else elFinder decide it itself
}

function sanitizeName($cmd, $result, $args, $elfinder)
{
    $files = $result['added'];
    foreach ($files as $file) {
        $filename = str_replace(' ', '_' , $file['name']);
        if ($filename != $file['name']) {
            $arg = array('target' => $file['hash'], 'name' => $filename);
            $elfinder->exec('rename', $arg);
        }
    }

    return true;
}

// Documentation for connector options:
// https://github.com/Studio-42/elFinder/wiki/Connector-configuration-options
$opts = array(
	// 'debug' => true,
    'bind' => array(
        'mkdir mkfile rename duplicate upload rm paste' => 'sanitizeName'
    ),
	'roots' => array(
		array(
			'driver'        => 'LocalFileSystem',   // driver for accessing file system (REQUIRED)
			'path'          => $rootpath . "/media",         // path to files (REQUIRED)
			'URL'           => $rooturl . "/media", // URL to files (REQUIRED)
			'accessControl' => 'access',             // disable and hide dot starting files (OPTIONAL)
            'tmbPath'       => $rootpath . "/media/.tmb",
            'tmbURL'        => $rooturl . "/media/.tmb",
            'tmbCrop'       => false,
            'uploadDeny' => array('text/x-php','application/x-php'),
            'attributes' => array(
                array( // hide readmes
                    'pattern' => '/\.(txt|html|php|php5|php*|py|pl|sh|xml)$/i',
                    'read'   => false,
                    'write'  => false,
                    'locked' => true,
                    'hidden' => true
                )
            )
		)
	)
);

// run elFinder
$connector = new elFinderConnector(new elFinder($opts));
$connector->run();

