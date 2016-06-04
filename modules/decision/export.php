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
 * Export a LO - e.g. from properties.
 * Example call : /website_code/php/scorm/export.php?scorm=false&template_id=10&html5=false&flash=true
 */
global $dir_path, $delete_file_array, $zipfile, $folder_id_array, $file_array, $folder_array, $delete_folder_array, $parent_template_path;

$folder_id_array = array();
$folder_array = array();
$file_array = array();
$delete_file_array = array();
$delete_folder_array = array();
$zipfile = "";

require_once ($xerte_toolkits_site->root_file_path . "website_code/php/scorm/archive.php");
require_once ($xerte_toolkits_site->root_file_path . "website_code/php/scorm/scorm_library.php");
require_once ($xerte_toolkits_site->root_file_path . "website_code/php/xmlInspector.php");
require_once ($xerte_toolkits_site->root_file_path . "website_code/php/screen_size_library.php");
require_once ($xerte_toolkits_site->root_file_path . "website_code/php/user_library.php");
require_once ($xerte_toolkits_site->root_file_path . "website_code/php/url_library.php");

/*
 * Set up the paths
 */
$dir_path = $xerte_toolkits_site->users_file_area_full . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";
$parent_template_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/parent_templates/" . $row['template_name'] . "/";
$js_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/js/";


/*
 * Make the zip
 */
$zipfile_tmpname = tempnam(sys_get_temp_dir(), 'xerteExport');
if ($zipfile_tmpname === false)
{
    $zipfile_tmpname = tempnam('/tmp', 'xerteExport');
}

_debug("Temporary zip file is : ". $zipfile_tmpname);

$options = array(
    'basedir' => $dir_path, 
    'prepand' => "", 
    'inmemory' => 0, 
    'overwrite' => 1,
    'recurse' => 1, 
    'storepaths' => 1);


$zipfile = Xerte_Zip_Factory::factory($zipfile_tmpname, $options);


/*
 * Copy the core files over from the parent folder
 */
copy($dir_path . "data.xml", $dir_path . "template.xml");
$xml = new XerteXMLInspector();
$xml->loadTemplateXML($dir_path . 'template.xml');
if ($fullArchive) {
    _debug("Full archive");
    export_folder_loop($parent_template_path);

    copy_parent_files();
}
else
{
    _debug("Deployment archive");
    export_folder_loop($parent_template_path . "common/");

    copy_parent_files();
}


/*
 * Language support
 */
export_folder_loop($xerte_toolkits_site->root_file_path . 'languages/', false, '.xml');
copy_extra_files();



export_folder_loop($dir_path);

/*
 * Get the name of the learning object
 */
$lo_name = $xml->getName();

/*
 * Create basic HTML page
 */
basic_html5_page_create($row['template_framework'], $row['template_name'], $lo_name);

/*
 * Add the files to the zip file, create the archive, then send it to the user
 */

xerte_zip_files($fullArchive, $dir_path);
$zipfile->create_archive();


// This outputs http headers etc.
$zipfile->download_file($row['zipname']);

_debug("Zip file errors? " . implode(',', $zipfile->error));

/*
 * remove the files
 */
clean_up_files();

@unlink($dir_path . "template.xml");

@unlink($zipfile_tmpname);
