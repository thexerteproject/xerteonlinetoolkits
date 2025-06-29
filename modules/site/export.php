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
$parent_template_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/parent_templates/" . $row['parent_template'] . "/";
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
}
else
{
    _debug("Deployment archive");
}
export_folder_loop($parent_template_path);

copy_parent_files();

// Copy language files
export_folder_loop($xerte_toolkits_site->root_file_path . 'languages/', false, '.xml');
copy_extra_files();

/*
 * Theme support
 */
$theme = $xml->getTheme();
// To please static code inspection tools, make sure it matches pattern of a theme (all characters and numbers or '_' or '-', no other special characters)
if (!preg_match('/^[a-zA-Z0-9_\-]+$/', $theme, $matches)) {
    die("Illegal theme name detected!");
}
if ($theme != "" && $theme != "default")
{
    export_folder_loop($xerte_toolkits_site->root_file_path . 'themes/' . $row['parent_template'] . '/' . $theme . '/');
    copy_extra_files();
}

// Copy the favicon file
copy($xerte_toolkits_site->root_file_path . "favicon.ico", $dir_path . "favicon.ico");
array_push($delete_file_array, $dir_path . "favicon.ico");

/*
* export logo(s)
*/
function process_logos($LO_logo, $theme_path, $template_path) {
    $base_path = dirname(__FILE__) . '/../../' . $template_path . 'common/img/';
    $extensions = array('svg',  'png', 'jpg', 'gif');
    $logoUrls = new stdClass;

    foreach (array(array('L', '_left'), array('R', '')) as $suffix) {
        $path = get_logo_path($suffix, $LO_logo, $theme_path, $template_path);
        if ($path) {
            $logoUrls->{'logo_' . $suffix[0]} = $path; // . '" alt="" />' , $page_content);
        }
        /*else {
            $page_content = str_replace("%LOGO_" . $suffix[0] . "%", '<img class="logo" src="" alt="" />' , $page_content);
        }*/
    }
    return $logoUrls;
}

function get_logo_path($suffix, $LO_logo, $theme_path, $template_path) {
    $base_path = dirname(__FILE__) . '/../../' . $template_path . 'common/img/';
    $extensions = array('svg',  'png', 'jpg', 'gif');

    // First the author logo
    $logo_path = trim($LO_logo->{$suffix[0] . '_path'});
    if (strlen($logo_path) > 0) {
        return  '../../../' . $LO_logo->{$suffix[0] . '_path'};
    }

    // Secondly check the theme logo
    foreach($extensions as $ext) {
        if (file_exists('../../../' . $theme_path . '/logo'. $suffix[1] . '.' . $ext)) {
            return '../../../' . $theme_path . '/logo'. $suffix[1] . '.' . $ext;
        }
    }

    // Lastly check the default location
    foreach($extensions as $ext) {
        if (file_exists('../../../' . $template_path . 'common/img/logo'. $suffix[1] . '.' . $ext)) { 
            return '../../../' . $template_path . 'common/img/logo' . $suffix[1] . '.'. $ext;
        }
    }

    return; //null for not found
}

$fileLocation = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . '-' . $row['username'] . '-' . $row['template_name'] . '/';
function fixFileLocation($LO_icon_path, $fileLocation) {
    if (strpos($LO_icon_path, "FileLocation + '") !== false) {
        $LO_icon_path = str_replace("FileLocation + '" , $fileLocation, $LO_icon_path);
        $LO_icon_path = rtrim($LO_icon_path, "'");
    }
    return $LO_icon_path;
}
$LO_logo = new stdClass;
$LO_logo->L_path = fixFileLocation($xml->getIcon()->logoL, $fileLocation);
$LO_logo->R_path = fixFileLocation($xml->getIcon()->logoR, $fileLocation);
$theme_base_path = 'themes/' . $row['parent_template'] . '/' . ($xml->getTheme() === 'default' ? 'apereo' : $xml->getTheme());
$default_path = 'modules/' . $row['template_framework'] . "/parent_templates/" . $row['parent_template'] . '/';

$temp = process_logos($LO_logo, $theme_base_path, $default_path);

$LO_logoL = '<img class="logo" src="" alt="" />';
if (property_exists($temp, 'logo_L')) {
    copy($xerte_toolkits_site->root_file_path . str_replace('../../../', '', $temp->logo_L), $dir_path . basename($temp->logo_L));
    array_push($delete_file_array, $dir_path . basename($temp->logo_L));
    $LO_logoL = '<img class="logo" src="' . basename($temp->logo_L) . '" alt="" />';
}

$LO_logoR = '<img class="logo" src="" alt="" />';
if (property_exists($temp, 'logo_R')) {
    copy($xerte_toolkits_site->root_file_path . str_replace('../../../', '', $temp->logo_R), $dir_path . basename($temp->logo_R));
    array_push($delete_file_array, $dir_path . basename($temp->logo_R));
    $LO_logoR = '<img class="logo" src="' . basename($temp->logo_R) . '" alt="" />';
}

export_folder_loop($dir_path);

/*
 * Get the name of the learning object
 */
$lo_name = $xml->getName();

/*
 * Do we need the s7 script for the social icons
*/
$hidesocial = $xml->getLOAttribute('hidesocial');
$footerhide = $xml->getLOAttribute('footerHide');
$footerpos = $xml->getLOAttribute('footerPos');
if ($hidesocial != 'true' && $footerhide != 'true' && $footerpos != 'replace' && ($xerte_toolkits_site->globalhidesocial != 'true' || $xerte_toolkits_site->globalsocialauth != 'false')) {
    $s7script = true;
} else {
    $s7script = false;
}

/*
 * Create basic HTML page
 */
basic_html5_page_create($row['template_id'], $row['template_framework'], $row['template_framework'], $lo_name, $row['date_modified'], $row['date_created'], false, false, '', false, $LO_logoL, $LO_logoR, '', $s7script);


/*
 * Improve the naming of the exported zip file
 */
	
$export_type = "";
if ($fullArchive)
	$export_type = "_archive";
else
	$export_type = "_deployment";

$row['zipname'] .= '_' . $_GET['template_id'] . $export_type;


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
