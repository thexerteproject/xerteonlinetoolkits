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
require_once ($xerte_toolkits_site->root_file_path . "website_code/php/scorm/scorm2004_library.php");
require_once ($xerte_toolkits_site->root_file_path . "website_code/php/xAPI/xAPI_library.php");
require_once ($xerte_toolkits_site->root_file_path . "website_code/php/xmlInspector.php");
require_once ($xerte_toolkits_site->root_file_path . "website_code/php/screen_size_library.php");
require_once ($xerte_toolkits_site->root_file_path . "website_code/php/user_library.php");
require_once ($xerte_toolkits_site->root_file_path . "website_code/php/url_library.php");

function create_offline_file($varname, $sourcefile, $destfile)
{
    global $dir_path, $delete_file_array;

    $source = file_get_contents($sourcefile);
    // Remove comments from source
    $source = preg_replace('!/\*.*?\*/!s', '', $source);
    // If this is an xml file, remove the <? xml ... line
    $source = preg_replace('/<\?.*\?>/', '', $source);

    $dest = $varname . " = hereDoc(function(){/*!\n";
    $dest .= $source;
    $dest .= "\n*/});";

    directory_maker($destfile);
    file_put_contents($dir_path . $destfile, $dest);
    array_push($delete_file_array, $dir_path . $destfile);
}

/*
 * Set up the paths
 */
$dir_path = $xerte_toolkits_site->users_file_area_full . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";
$parent_template_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/parent_templates/" . $row['parent_template'] . "/";
$scorm_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/scorm1.2/";
$scorm_language_relpath = $xerte_toolkits_site->module_path . $row['template_framework'] . "/scorm1.2/";
$scorm2004_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/scorm2004.3rd/";
$scorm2004_language_relpath = $xerte_toolkits_site->module_path . $row['template_framework'] . "/scorm2004.3rd/";

$xAPI_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/xAPI/";
$xAPI_language_relpath = $xerte_toolkits_site->module_path . $row['template_framework'] . "/xAPI/";

$js_path = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/js/";

$export_html5 = false;
$export_flash = false;
$export_offline = false;
$xAPI = false;
$offline_includes="";
$need_download_url = false;
if (!isset($tsugi))
{
    $tsugi = false;
}

if (isset($_REQUEST['html5'])) {
    $export_html5 = (x_clean_input($_REQUEST['html5']) == 'true' ? true : false);
}
if (isset($_REQUEST['flash'])) {
    $export_flash = (x_clean_input($_REQUEST['flash']) == 'true' ? true : false);
}
if (!$export_html5 && !$export_flash) {
    if (isset($row['extra_flags'])) {
        if (strpos($row['extra_flags'], 'flash') !== false) {
            $export_flash = true;
        } else {
            $export_html5 = true;
        }
    } else {
        $export_html5 = true;
    }
}

if (isset($_REQUEST['offline']))
{
    $export_offline = true;
    // offline is only supported by html5
    $export_html5 = true;
    $export_flash = false;
    $fullArchive = false;
}

if (isset($_REQUEST['xAPI']) && x_clean_input($_REQUEST['xAPI']) == "true")
{
	$xAPI = true;
}

/*
 * Make the zip
 */
$zipfile_tmpname = tempnam(sys_get_temp_dir(), 'xerteExport');
if ($zipfile_tmpname === false)
{
    $zipfile_tmpname = tempnam('/tmp', 'xerteExport');
}

_debug("Temporary zip file is : $zipfile_tmpname");

$options = array(
    'basedir' => $dir_path, 
    'prepand' => "", 
    'inmemory' => 0,
    'overwrite' => 1,
    'recurse' => 1, 
    'storepaths' => 1);


$zipfile = Xerte_Zip_Factory::factory($zipfile_tmpname, $options);
$scorm = $_GET['scorm'];

/*
 * Copy the core files over from the parent folder
 */
copy($dir_path . "data.xml", $dir_path . "template.xml");
$xml = new XerteXMLInspector();
$xml->loadTemplateXML($dir_path . 'template.xml', $scorm == '2004'|| $scorm == 'true' || $xAPI || $export_offline);

if ($fullArchive) {
    _debug("Full archive");
    export_folder_loop($parent_template_path);
    copy_parent_files();
} else /* Only copy used models and the common folder */ {
    _debug("Deployment archive");
    if ($export_flash) {
        _debug("  use flash");
        $models = $xml->getUsedModels();
        foreach ($models as $model) {
            _debug("copy model " . $parent_template_path . "models/" . $model . ".rlm");
            array_push($file_array, array($parent_template_path . "models/" . $model . ".rlm", ""));
        }
        /* Always add menu.rlm */
        _debug("copy model " . $parent_template_path . "models/menu.rlm");
        array_push($file_array, array($parent_template_path . "models/menu.rlm", ""));

        export_folder_loop($parent_template_path . "common/");
        array_push($file_array, array($parent_template_path . $row['template_name'] . ".rlt", ""));
    }
    if ($export_html5) {
        _debug("  use html5");
        $models = $xml->getUsedModels();
        // To please static code inspection tools, iterate over models and make sure there just model names
        foreach ($models as $model) {
            if (strpos($model, '/') !== false) {
                die("Illegal model name detected!");
            }
            // Check whether the model only uses normal characters and numbers
            if (!ctype_alnum($model)) {
                die("Illegal model name detected!");
            }
        }
        if ($export_offline)
        {
            export_folder_loop($xerte_toolkits_site->root_file_path . "offline/");
            copy_extra_files();

            // Create offline language file and replacement text
            $language = $xml->getLanguage();
            // To please static code inspection tools, make sure it matches pattern of a language code (aa-aa)
            if (!preg_match('/^[a-z]{2}-[A-Z]{2}$/', $language)) {
                die("Illegal language code detected!");
            }
            create_offline_file("langxmlstr", $xerte_toolkits_site->root_file_path . "languages/engine_" . $language . ".xml", "offline/offline_engine_" . $language . ".js");
            $offline_includes .= "   <!-- Offline language -->\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"offline/offline_engine_" . $language . ".js\"></script>\n\n";

            // Offline template
            create_offline_file("dataxmlstr", $dir_path . "/template.xml", "offline/offline_template.js");
            $offline_includes .= "   <!-- Offline templatexml -->\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"offline/offline_template.js\"></script>\n\n";

            // Offline dialogs
            create_offline_file("modelfilestrs['colourChanger']", $parent_template_path . "models_html5/colourChanger.html", "offline/offline_colourChanger.js");
            array_push($file_array, array($parent_template_path . "models_html5/colourChanger.css", ""));
            $offline_includes .= "   <!-- Offline dialogs -->\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"offline/offline_colourChanger.js\"></script>\n";
            create_offline_file("modelfilestrs['menu']", $parent_template_path . "models_html5/menu.html", "offline/offline_menu.js");
            array_push($file_array, array($parent_template_path . "models_html5/menu.css", ""));
            $offline_includes .= "   <script type=\"text/javascript\" src=\"offline/offline_menu.js\"></script>\n";
            create_offline_file("modelfilestrs['language']", $parent_template_path . "models_html5/language.html", "offline/offline_language.js");
            array_push($file_array, array($parent_template_path . "models_html5/language.css", ""));
            $offline_includes .= "   <script type=\"text/javascript\" src=\"offline/offline_language.js\"></script>\n";
            if ($xml->glossaryUsed()) {
                create_offline_file("modelfilestrs['glossary']", $parent_template_path . "models_html5/glossary.html", "offline/offline_glossary.js");
                array_push($file_array, array($parent_template_path . "models_html5/glossary.css", ""));
                $offline_includes .= "   <script type=\"text/javascript\" src=\"offline/offline_glossary.js\"></script>\n";
            }
            create_offline_file("modelfilestrs['saveSession']", $parent_template_path . "models_html5/saveSession.html", "offline/offline_saveSession.js");
            array_push($file_array, array($parent_template_path . "models_html5/saveSession.css", ""));
            $offline_includes .= "   <!-- Offline dialogs -->\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"offline/offline_saveSession.js\"></script>\n";
            create_offline_file("modelfilestrs['resumeSession']", $parent_template_path . "models_html5/resumeSession.html", "offline/offline_resumeSession.js");
            array_push($file_array, array($parent_template_path . "models_html5/resumeSession.css", ""));
            $offline_includes .= "   <!-- Offline dialogs -->\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"offline/offline_resumeSession.js\"></script>\n";
            $offline_includes .= "\n";

            // Offline models
            $offline_includes .= "   <!-- Offline models -->\n";
            foreach($models as $model)
            {
                create_offline_file("modelfilestrs['" . $model . "']", $parent_template_path . "models_html5/" . $model . ".html", "offline/" . $model . ".js");
                array_push($file_array, array($parent_template_path . "models_html5/" .$model . ".css", ""));
                $offline_includes .= "   <script type=\"text/javascript\" src=\"offline/" . $model . ".js\"></script>\n";
            }

            // Extra include files normally loaded dynamically
            $offline_includes .= "   <!-- extra files, normally loaded dynamically -->\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/script.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/popcorn/popcorn-complete.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/popcorn/plugins/popcorn.textplus.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/popcorn/plugins/popcorn.subtitleplus.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/popcorn/plugins/popcorn.xot.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/popcorn/plugins/popcorn.mediaplus.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/popcorn/plugins/popcorn.mcq.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/popcorn/plugins/MediasitePlayerIFrameAPI.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/popcorn/plugins/MediasitePlayerControls.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/popcorn/plugins/popcorn.slides.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/popcorn/plugins/popcorn.sortholder.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/popcorn/plugins/popcorn.mediaconstructor.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"https://unpkg.com/@peertube/embed-api/build/player.min.js\"></script>\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"common_html5/js/timeline/timeline3.js\"></script>\n";


            // Offline theme
            $offline_includes .= "   <!-- theme file, normally loaded dynamically -->\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"themes/" . $row['parent_template'] . "/" . $xml->getTheme() . "/" . $xml->getTheme() . ".js\"></script>\n";

            create_offline_file("themeinfo", "themes/" . $row['parent_template'] . "/" . $xml->getTheme() . "/" . $xml->getTheme() . ".info", "offline/offline_themeinfo.js");
            $offline_includes .= "   <!-- Offline theme info -->\n";
            $offline_includes .= "   <script type=\"text/javascript\" src=\"offline/offline_themeinfo.js\"></script>\n";
            $offline_includes .= "\n";
        }
        else {
            foreach ($models as $model) {
                _debug("copy model " . $parent_template_path . "models_html5/" . $model . ".html");
                array_push($file_array, array($parent_template_path . "models_html5/" . $model . ".html", ""));
                array_push($file_array, array($parent_template_path . "models_html5/" . $model . ".css", ""));
            }
            /* Always add menu.html */
            _debug("copy model " . $parent_template_path . "models_html5/menu.html");
            array_push($file_array, array($parent_template_path . "models_html5/menu.html", ""));
            array_push($file_array, array($parent_template_path . "models_html5/menu.css", ""));
            /* Always add colourChanger.html */
            _debug("copy model " . $parent_template_path . "models_html5/colourChanger.html");
            array_push($file_array, array($parent_template_path . "models_html5/colourChanger.html", ""));
            array_push($file_array, array($parent_template_path . "models_html5/colourChanger.css", ""));
            /* Always add language.html */
            _debug("copy model " . $parent_template_path . "models_html5/language.html");
            array_push($file_array, array($parent_template_path . "models_html5/language.html", ""));
            array_push($file_array, array($parent_template_path . "models_html5/language.css", ""));
            /* Add glossary if used */
            if ($xml->glossaryUsed()) {
                _debug("copy model " . $parent_template_path . "models_html5/glossary.html");
                array_push($file_array, array($parent_template_path . "models_html5/glossary.html", ""));
                array_push($file_array, array($parent_template_path . "models_html5/glossary.css", ""));
            }
            /* Always add saveSession.html */
            _debug("copy model " . $parent_template_path . "models_html5/saveSession.html");
            array_push($file_array, array($parent_template_path . "models_html5/saveSession.html", ""));
            array_push($file_array, array($parent_template_path . "models_html5/saveSession.css", ""));
            /* Always add resumeSession.html */
            _debug("copy model " . $parent_template_path . "models_html5/resumeSession.html");
            array_push($file_array, array($parent_template_path . "models_html5/resumeSession.html", ""));
            array_push($file_array, array($parent_template_path . "models_html5/resumeSession.css", ""));
        }
        export_folder_loop($parent_template_path . "common_html5/");
        copy_parent_files();
    }

}
if (isset($_GET['local'])) {
    if ($_GET['local'] == "true") {
        $string = file_get_contents($dir_path . "/template.xml");
        $string = str_replace($xerte_toolkits_site->site_url . $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/", "", $string);
        $fh = fopen($dir_path . "/template.xml", 'w+');
        fwrite($fh, $string);
        fclose($fh);
    }
}


/*
 * Language support
 */
if (!$export_offline) {
    export_folder_loop($xerte_toolkits_site->root_file_path . 'languages/', false, '.xml');
    copy_extra_files();
}

/*
 * Theme support
 */
$theme = $xml->getTheme();
// To please static code inspection tools, make sure it matches pattern of a theme (all characters and numbers, no special characters)
if (!preg_match('/^[a-zA-Z0-9]+$/', $theme)) {
    die("Illegal theme name detected!");
}

if ($theme == "")
{
    $theme = "default";
}
// Add selected theme
export_folder_loop($xerte_toolkits_site->root_file_path . 'themes/' . $row['parent_template'] . '/' . $theme . '/');
copy_extra_files();
// Add colourChanger themes
export_folder_loop($xerte_toolkits_site->root_file_path . 'themes/' . $row['parent_template'] . '/blackonyellow/');
copy_extra_files();
export_folder_loop($xerte_toolkits_site->root_file_path . 'themes/' . $row['parent_template'] . '/highcontrast/');
copy_extra_files();

// Add default theme
export_folder_loop($xerte_toolkits_site->root_file_path . 'themes/' . $row['parent_template'] . '/default/');
copy_extra_files();


if ($export_flash) {
    /*
     * Javascript js folder
     */
    export_folder_loop($js_path, false, '.js', 'js/');
    copy_extra_files();

    /*
     * Copy engine and support files
     *
     *  From root
     */
    copy($xerte_toolkits_site->root_file_path . "XMLEngine.swf", $dir_path . "XMLEngine.swf");
    array_push($delete_file_array, $dir_path . "XMLEngine.swf");
    copy($xerte_toolkits_site->root_file_path . "MainPreloader.swf", $dir_path . "MainPreloader.swf");
    array_push($delete_file_array, $dir_path . "MainPreloader.swf");
    copy($xerte_toolkits_site->root_file_path . "rloObject.js", $dir_path . "rloObject.js");
    array_push($delete_file_array, $dir_path . "rloObject.js");
    copy($xerte_toolkits_site->root_file_path . "resources.swf", $dir_path . "resources.swf");
    array_push($delete_file_array, $dir_path . "resources.swf");
}
/*
 * If scorm copy the scorm files as well
 */
$scorm =x_clean_input($_GET['scorm']);
$language = $xml->getLanguage();
// To please static code inspection tools, make sure it matches pattern of a language code (aa-aa)
if (!preg_match('/^[a-z]{2}-[A-Z]{2}$/', $language)) {
    die("Illegal language code detected!");
}
if ($scorm == "true") {
    export_folder_loop($scorm_path, false, null, "/");
    copy_extra_files();
    if ($xml->getLanguage() != 'en-GB') {
        export_folder_loop($xerte_toolkits_site->root_file_path . 'languages/' . $language . '/' . $scorm_language_relpath, false, null, "/languages/js/" . $language . "/");
        copy_extra_files();
    }
    export_folder_loop($xerte_toolkits_site->root_file_path . 'languages/en-GB/' . $scorm_language_relpath, false, null, "/languages/js/en-GB/");
    copy_extra_files();
} else if ($scorm == "2004") {
    export_folder_loop($scorm2004_path, false, null, "/");
    copy_extra_files();
    if ($xml->getLanguage() != 'en-GB') {
        if (is_dir($xerte_toolkits_site->root_file_path . 'languages/' . $language . '/' . $scorm2004_language_relpath)) {
            export_folder_loop($xerte_toolkits_site->root_file_path . 'languages/' . $language . '/' . $scorm2004_language_relpath, false, null, "/languages/js/" . $language . "/");
            copy_extra_files();
        }
    }
    export_folder_loop($xerte_toolkits_site->root_file_path . 'languages/en-GB/' . $scorm2004_language_relpath, false, null, "/languages/js/en-GB/");
    copy_extra_files();
}

if($xAPI)
{	
	export_folder_loop($xAPI_path, false, null, "/");
	copy_extra_files();
	if ($xml->getLanguage() != 'en-GB') {
		export_folder_loop($xerte_toolkits_site->root_file_path . 'languages/' . $language . '/' . $xAPI_language_relpath, false, null, "/languages/js/" . $language . "/");
		copy_extra_files();
	}
	export_folder_loop($xerte_toolkits_site->root_file_path . 'languages/en-GB/' . $xAPI_language_relpath, false, null, "/languages/js/en-GB/");
	copy_extra_files();
}

// Copy the favicon file
copy($xerte_toolkits_site->root_file_path . "favicon.ico", $dir_path . "favicon.ico");
array_push($delete_file_array, $dir_path . "favicon.ico");

$rlo_file = $row['template_name'] . ".rlt";
/*
 * if used copy extra folders
 */
/*
 *  jmol
 */
if ($xml->modelUsed("jmol")) {
    export_folder_loop($xerte_toolkits_site->root_file_path . "JMolViewer/");
    copy_extra_files();
}
/*
 * mapstraction
 */
if ($xml->modelUsed("mapstraction")) {
    export_folder_loop($xerte_toolkits_site->root_file_path . "mapstraction/");
    copy_extra_files();
}
/*
 * mediaViewer
 */
if ($xml->mediaIsUsed()) {
    export_folder_loop($xerte_toolkits_site->root_file_path . "mediaViewer/");
    copy_extra_files();
}
/*
* export logo
*/
$LO_base_path = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . '-' . $row['username'] . '-' . $row['template_name'] . '/';
$LO_icon_path = $xml->getIcon()->url;
if (strpos($LO_icon_path, "FileLocation + '") !== false) {
    $LO_icon_path = str_replace("FileLocation + '" , $LO_base_path, $LO_icon_path);
    $LO_icon_path = rtrim($LO_icon_path, "'");
}
$theme_base_path = 'themes/' . $row['parent_template'] . '/' . $xml->getTheme();
$default_path = 'modules/' . $row['template_framework'] . "/parent_templates/" . $row['parent_template'] . '/';
$export_logo = get_logo_file($LO_icon_path, $theme_base_path, $default_path);
if ($export_logo) {
    copy($export_logo, $dir_path . basename($export_logo));
    array_push($delete_file_array, $dir_path . basename($export_logo));

    if (file_exists($export_logo)) {
        $export_logo = '<img class="x_icon" src="' . basename($export_logo) . '" alt="" />';
    }
    else {
        $export_logo = '';
    }
}

/* 
 * documentation
 */
 if ($xml->modelUsed("documentation")) $need_download_url = true;


export_folder_loop($dir_path);

/*
 * Get the name of the learning object
 */
$lo_name = $xml->getName();


// Get plugins
$plugins = array();
if (file_exists($parent_template_path . "plugins")) {
    $pluginfiles = scandir($parent_template_path . "plugins/");
    foreach ($pluginfiles as $pluginfile) {
        // get base name of plugin
        $plugininfo = pathinfo($pluginfile);
        if ($plugininfo['basename'] == '.' || $plugininfo['basename'] == '..') {
            continue;
        }
        if (!isset($plugins[$plugininfo['filename']])) {
            $plugins[$plugininfo['filename']] = new stdClass();
        }
        if ($plugininfo['extension'] == 'js') {
            $plugins[$plugininfo['filename']]->script = file_get_contents($parent_template_path . "plugins/" . $pluginfile);
        }
        if ($plugininfo['extension'] == 'css') {
            $plugins[$plugininfo['filename']]->css = file_get_contents($parent_template_path . "plugins/" . $pluginfile);
        }
    }
}

/*
 * Create scorm manifests or a basic HTML page
 */
if ($scorm == "true") {
    $useflash = ($export_flash && !$export_html5);
    if (isset($_GET['data'])) {
        if ($_GET['data'] == true) {

            $prefix = $xerte_toolkits_site->database_table_prefix;

            $query = "SELECT * FROM {$prefix}templatesyndication WHERE template_id = ? ";
            $metadata = db_query_one($query, array($_GET['template_id']));

            $query = "SELECT * FROM {$prefix}templaterights t, "
                    . "{$prefix}logindetails l WHERE t.template_id = ? and t.user_id = l.login_id ";

            $params = array($_GET['template_id']);

            $query_response_users = db_query($query, $params);
            lmsmanifest_create_rich($row, $metadata, $query_response_users, $useflash, $lo_name);
        }
    } else {
        lmsmanifest_create($row['zipname'], $useflash, $lo_name);
    }
    if ($useflash) {
        scorm_html_page_create($_GET['template_id'], $row['template_name'], $row['template_framework'], $rlo_file, $lo_name, $xml->getLanguage());
    } else {
            scorm_html5_page_create($_GET['template_id'], $row['template_framework'], $row['parent_template'], $lo_name, $xml->getLanguage(), $row['date_modified'], $row['date_created'], $need_download_url, $export_logo, $plugins);
    }
} else if ($scorm == "2004") {
    $useflash = ($export_flash && !$export_html5);
    lmsmanifest_2004_create($row['zipname'], $useflash, $lo_name);
    if ($export_flash && !$export_html5) {
        scorm2004_html_page_create($_GET['template_id'], $row['template_name'], $row['template_framework'], $rlo_file, $lo_name, $xml->getLanguage());
    } else {
        scorm2004_html5_page_create($_GET['template_id'], $row['template_framework'], $row['parent_template'], $lo_name, $xml->getLanguage(), $row['date_modified'], $row['date_created'], $need_download_url, $export_logo, $plugins);
    }
} else if($xAPI)
	{
		xAPI_html_page_create($_GET['template_id'], $row['template_name'], $row['template_framework'], $row['parent_template'], $lo_name, $xml->getLanguage(), $row['date_modified'], $row['date_created'], $need_download_url, $export_logo, $plugins);
	}
else {
    if ($export_flash) {
        basic_html_page_create($_GET['template_id'], $row['template_name'], $row['template_framework'], $rlo_file, $lo_name);
    }
    if ($export_html5) {
        basic_html5_page_create($_GET['template_id'], $row['template_framework'], $row['parent_template'],$lo_name,  $row['date_modified'], $row['date_created'], $tsugi, $export_offline, $offline_includes, $need_download_url, $export_logo, '', $plugins);
    }
}

/*
 * Improve the naming of the exported zip file
 */

$export_engine = "";
if ($export_flash && $export_html5)
	$export_engine = "_flash_html5";
elseif ($export_flash)
	$export_engine = "_flashonly";
	
$export_type = "";
if ($export_offline)
	$export_type = "_offline";
elseif ($fullArchive)
	$export_type = "_archive";
elseif ($scorm == "true")
	$export_type = "_scorm_1_2";
elseif ($scorm == "2004")
	$export_type = "_scorm_2004";
elseif ($xAPI)
	$export_type = "_xAPI";
else
	$export_type = "_deployment";

$row['zipname'] .= $export_engine . '_' . $_GET['template_id'] . $export_type;

/*
 * Add the files to the zip file, create the archive, then send it to the user
 */

xerte_zip_files($fullArchive, $dir_path);
$zipfile->create_archive();
$zipfile->download_file($row['zipname']);


_debug("Zip file errors? " . implode(',', $zipfile->error));

/*
 * remove the files
 */
clean_up_files();

@unlink($dir_path . "template.xml");

@unlink($zipfile_tmpname);
