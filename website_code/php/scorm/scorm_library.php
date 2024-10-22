<?PHP

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
 *
 * Function lmsmanifest_create
 * This function creates a scorm manifest
 * @version 1.0
 * @author Patrick Lockley
 */

global $youtube_api_key;
$youtube_api_key = "";
if (file_exists(dirname(__FILE__) . "/../../../api_keys.php")){
    include_once(dirname(__FILE__) . "/../../../api_keys.php");
}

function lmsmanifest_create($name, $flash, $lo_name) {

    global $dir_path, $delete_file_array, $zipfile;

    $scorm_top_string = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><manifest xmlns=\"http://www.imsproject.org/xsd/imscp_rootv1p1p2\" xmlns:imsmd=\"http://www.imsglobal.org/xsd/imsmd_rootv1p2p1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:adlcp=\"http://www.adlnet.org/xsd/adlcp_rootv1p2\" identifier=\"MANIFEST-90878C16-EB60-D648-94ED-9651972B5F38\" xsi:schemaLocation=\"http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd\"><metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>";
    $date = time();

    $scorm_personalise_string = "";
    $scorm_personalise_string .= "<organizations default=\"" . "XERTE-ORG-" . $date . "\">";
    $scorm_personalise_string .= "<organization identifier=\"" . "XERTE-ORG-" . $date . "\" structure=\"hierarchical\">";
    $scorm_personalise_string .= "<title>" . $lo_name . "</title>";
    $scorm_personalise_string .= "<item identifier=\"" . "XERTE-ITEM-" . $date . "\" identifierref=\"" . "XERTE-RES-" . $date . "\" isvisible=\"true\">";
    $scorm_personalise_string .= "<title>" . $lo_name . "</title>";

    $scorm_bottom_string = "</item></organization></organizations><resources><resource type=\"webcontent\" adlcp:scormtype=\"sco\" identifier=\"" . "XERTE-RES-" . $date . "\" href=\"scormRLO.htm\"><file href=\"scormRLO.htm\" />";
    if ($flash) {
        $scorm_bottom_string .= "<file href=\"MainPreloader.swf\" /><file href=\"XMLEngine.swf\" />";
    }
    $scorm_bottom_string .= "</resource></resources></manifest>";

    $file_handle = fopen($dir_path . "imsmanifest.xml", 'w');
    $buffer = $scorm_top_string . $scorm_personalise_string . $scorm_bottom_string;

    fwrite($file_handle, $buffer, strlen($buffer));
    fclose($file_handle);

    $zipfile->add_files("imsmanifest.xml");
    array_push($delete_file_array, $dir_path . "imsmanifest.xml");
}

/**
 *
 * Function lmsmanifest_create
 * This function creates a scorm manifest
 * @version 1.0
 * @author Patrick Lockley
 * 
 * @param array $row
 * @param array $metadata
 * @param array $users
 * @param boolean flash
 * @param string $lo_name
 * 
 */
function lmsmanifest_create_rich($row, $metadata, $users, $flash, $lo_name) {

    global $dir_path, $delete_file_array, $zipfile, $xerte_toolkits_site;

    $scorm_top_string = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><manifest xmlns=\"http://www.imsproject.org/xsd/imscp_rootv1p1p2\" xmlns:imsmd=\"http://www.imsglobal.org/xsd/imsmd_rootv1p2p1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:adlcp=\"http://www.adlnet.org/xsd/adlcp_rootv1p2\" identifier=\"MANIFEST-90878C16-EB60-D648-94ED-9651972B5F38\" xsi:schemaLocation=\"http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd\"><metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion>";
    $scorm_top_string .= "<imsmd:lom><imsmd:general><imsmd:identifier><imsmd:catalog>" . $xerte_toolkits_site->site_title . "</imsmd:catalog><imsmd:entry>A180_2</imsmd:entry></imsmd:identifier><imsmd:title><imsmd:langstring xml:lang=\"en-GB\">" . $row['zipname'] . "</imsmd:langstring></imsmd:title><imsmd:language>en-GB</imsmd:language><imsmd:description><imsmd:langstring xml:lang=\"en-GB\">" . $metadata['description'] . "</imsmd:langstring></imsmd:description>";
    $keyword = explode(",", $metadata['keywords']);

    while ($word = array_pop($keyword)) {
        $scorm_top_string .= "<imsmd:keyword><imsmd:langstring xml:lang=\"en-GB\">" . $word . "</imsmd:langstring></imsmd:keyword>";
    }

    $scorm_top_string .= "</imsmd:general>";

	foreach($users as $user) { 
		$scorm_top_string .= "<imsmd:lifeCycle><imsmd:contribute><imsmd:role><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>author</imsmd:value></imsmd:role><imsmd:entity>" . $user['firstname'] . " " . $user['surname'] . "</imsmd:entity></imsmd:contribute></imsmd:lifeCycle>";
	}

	$scorm_top_string .= "<imsmd:technical><imsmd:format>text/html</imsmd:format><imsmd:location>" . url_return("play", $_GET['template_id']) . "</imsmd:location></imsmd:technical>";
	$scorm_top_string .= "<imsmd:rights><imsmd:copyrightAndOtherRestrictions><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>yes</imsmd:value></imsmd:copyrightAndOtherRestrictions><imsmd:description><imsmd:langstring xml:lang=\"en-GB\">" . $metadata['license'] . "</imsmd:langstring><imsmd:langstring xml:lang=\"x-t-cc-url\">" . $metadata['license'] . "</imsmd:langstring></imsmd:description></imsmd:rights>";
	$scorm_top_string .= "</imsmd:lom></metadata>";

    $date = time();

    $scorm_personalise_string = "";
    $scorm_personalise_string .= "<organizations default=\"" . "XERTE-ORG-" . $date . "\">";
    $scorm_personalise_string .= "<organization identifier=\"" . "XERTE-ORG-" . $date . "\" structure=\"hierarchical\">";
    $scorm_personalise_string .= "<title>" . $lo_name . "</title>";
    $scorm_personalise_string .= "<item identifier=\"" . "XERTE-ITEM-" . $date . "\" identifierref=\"" . "XERTE-RES-" . $date . "\" isvisible=\"true\">";
    $scorm_personalise_string .= "<title>" . $lo_name . "</title>";

    $scorm_bottom_string = "</item></organization></organizations><resources><resource type=\"webcontent\" adlcp:scormtype=\"sco\" identifier=\"" . "XERTE-RES-" . $date . "\" href=\"scormRLO.htm\"><file href=\"scormRLO.htm\" />";
    if ($flash) {
        $scorm_bottom_string .= "<file href=\"MainPreloader.swf\" /><file href=\"XMLEngine.swf\" />";
    }
    $scorm_bottom_string .= "</resource></resources></manifest>";
    $file_handle = fopen($dir_path . "imsmanifest.xml", 'w');

    $buffer = $scorm_top_string . $scorm_personalise_string . $scorm_bottom_string;

    fwrite($file_handle, $buffer, strlen($buffer));
    fclose($file_handle);

    $zipfile->add_files("imsmanifest.xml");

    array_push($delete_file_array, $dir_path . "imsmanifest.xml");
}

/**
 *
 * Function basic html page create for flash player
 * This function creates a basic HTML page for export
 * @param string $name - name of the template
 * @param string $type - type of template this is
 * @version 1.0
 * @author Patrick Lockley
 */
function basic_html_page_create($id, $name, $type, $rlo_file, $lo_name) {

    global $xerte_toolkits_site, $dir_path, $delete_file_array, $zipfile;

    $buffer = file_get_contents($xerte_toolkits_site->basic_template_path . $type . "/player/rloObject.htm");
    $temp = get_template_screen_size($name, $type);
    $new_temp = explode("~", $temp);

    $buffer = str_replace("%WIDTH%", $new_temp[0], $buffer);
    $buffer = str_replace("%HEIGHT%", $new_temp[1], $buffer);
    $buffer = str_replace("%TITLE%", $lo_name, $buffer);
    $buffer = str_replace("%RLOFILE%", $rlo_file, $buffer);
    $buffer = str_replace("%XMLPATH%", "", $buffer);
    $buffer = str_replace("%TEMPLATEID%", $id, $buffer);
    $buffer = str_replace("%JSDIR%", "", $buffer);
    $buffer = str_replace("%XMLFILE%", "template.xml", $buffer);
    $buffer = str_replace("%SITE%", $xerte_toolkits_site->site_url, $buffer);

    $file_handle = fopen($dir_path . "index_flash.htm", 'w');

    fwrite($file_handle, $buffer, strlen($buffer));
    fclose($file_handle);

    $zipfile->add_files("index_flash.htm");

    array_push($delete_file_array, $dir_path . "index_flash.htm");
}

/**
 *
 * Function scorm html page create for flash
 * This function creates a scorm HTML page for export
 * @param string $name - name of the template
 * @param string $type - type of template this is
 * @version 1.0
 * @author Patrick Lockley
 */
function scorm_html_page_create($id, $name, $type, $rlo_file, $lo_name, $language) {

    global $xerte_toolkits_site, $dir_path, $delete_file_array, $zipfile;

    $scorm_html_page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $type . "/player/rloObject.htm");
    $temp = get_template_screen_size($name, $type);
    $new_temp = explode("~", $temp);

    $scorm_html_page_content = str_replace("%WIDTH%", $new_temp[0], $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%HEIGHT%", $new_temp[1], $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%TITLE%", $lo_name, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%RLOFILE%", $rlo_file, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%XMLPATH%", "", $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%TEMPLATEID%", $id, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%JSDIR%", "", $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%XMLFILE%", "template.xml", $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%SITE%", $xerte_toolkits_site->site_url, $scorm_html_page_content);

    $file_handle = fopen($dir_path . "scormRLO.htm", 'w');

    fwrite($file_handle, $scorm_html_page_content, strlen($scorm_html_page_content));
    fclose($file_handle);

    $zipfile->add_files("scormRLO.htm");

    array_push($delete_file_array, $dir_path . "scormRLO.htm");
}

/**
 *
 * Function basic html page create
 * This function creates a basic HTML page for export
 * @param string $name - name of the template
 * @param string $type - type of template this is
 * @version 1.0
 * @author Patrick Lockley
 */
function basic_html5_page_create($id, $type, $parent_name, $lo_name, $date_modified, $date_created, $tsugi=false, $offline=false, $offline_includes="", $need_download_url=false, $logo='', $logo_r='', $plugins='', $adds7script=false) {

    global $xerte_toolkits_site, $dir_path, $delete_file_array, $zipfile;

    $version = getVersion();
    $language = $_SESSION['toolkits_language'];
    $language_ISO639_1code = substr($language, 0, 2);

    if ($parent_name == "Nottingham")
    {
        $common_folder = "common_html5";
    }
    else
    {
        $common_folder = "common";
    }
    $template_path = $xerte_toolkits_site->basic_template_path . $type . '/parent_templates/' . $parent_name . "/";

    $buffer = file_get_contents($xerte_toolkits_site->basic_template_path . $type . "/player_html5/rloObject.htm");
	
    $buffer = str_replace("%TWITTERCARD%", "",$buffer);
    $buffer = str_replace("%VERSION%", $version, $buffer);
    $buffer = str_replace("%LANGUAGE%", $language_ISO639_1code, $buffer);
    $buffer = str_replace("%VERSION_PARAM%", "", $buffer);
    $buffer = str_replace("%TITLE%", $lo_name, $buffer);
    $buffer = str_replace("%LOGO%", $logo, $buffer);
    $buffer = str_replace("%LOGO_L%", $logo, $buffer);
    $buffer = str_replace("%LOGO_R%", $logo_r, $buffer);
    $buffer = str_replace("%TEMPLATEPATH%", "", $buffer);
    $buffer = str_replace("%TEMPLATEID%", $id, $buffer);
    $buffer = str_replace("%XMLPATH%", "", $buffer);
    $buffer = str_replace("%XMLFILE%", "template.xml", $buffer);
    $buffer = str_replace("%THEMEPATH%", "themes/" . $parent_name . "/",$buffer);

    if ($offline) {
        // Handle offline variables
        $buffer = str_replace("%OFFLINESCRIPTS%", "    <script type=\"text/javascript\" src=\"offline/js/offlinesupport.js\"></script>", $buffer);
        if ($need_download_url) $offline_includes .= "   <script type=\"text/javascript\">var x_downloadURL = \"" . $xerte_toolkits_site->site_url . "download.php\";</script>\n";
        $buffer = str_replace("%OFFLINEINCLUDES%", $offline_includes, $buffer);
        $buffer = str_replace("%MATHJAXPATH%", "offline/js/mathjax/", $buffer);
    }
    else
    {
        // Handle offline variables
        $buffer = str_replace("%OFFLINESCRIPTS%", "", $buffer);
        if ($need_download_url) $offline_includes .= "   <script type=\"text/javascript\">var x_downloadURL = \"" . $xerte_toolkits_site->site_url . "download.php\";</script>\n";
        $buffer = str_replace("%OFFLINEINCLUDES%", $offline_includes, $buffer);
        $buffer = str_replace("%MATHJAXPATH%", "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/", $buffer);
    }
    $buffer = str_replace("%TRACKING_SUPPORT%", "<script type=\"text/javascript\" src=\"{$common_folder}/js/xttracking_noop.js\"></script>", $buffer);
    $buffer = str_replace("%EMBED_SUPPORT%", "", $buffer);
    $buffer = str_replace("%LASTUPDATED%", $date_modified, $buffer);
    $buffer = str_replace("%DATECREATED%", $date_created, $buffer);
    $buffer = str_replace("%NUMPLAYS%", 0, $buffer);
    $buffer = str_replace("%USE_URL%", "var use_url=true;", $buffer);
    $buffer = str_replace("%GLOBALHIDESOCIAL%", $xerte_toolkits_site->globalhidesocial, $buffer);
    $buffer = str_replace("%GLOBALSOCIALAUTH%", $xerte_toolkits_site->globalsocialauth, $buffer);
    $buffer = str_replace("%PLUGINS%", 'var plugins=' . json_encode($plugins), $buffer);

    // Check popcorn mediasite and peertube config files
    $popcorn_config = "";
    $mediasite_config_js = $common_folder . "/js/popcorn/config/mediasite_urls.js";
    if (file_exists($template_path . $mediasite_config_js))
    {
        $popcorn_config .= "<script type=\"text/javascript\" src=\"{$mediasite_config_js}?version=" . $version . "\"></script>\n";
    }
    $peertube_config_js = $common_folder . "/js/popcorn/config/peertube_urls.js";
    if (file_exists($template_path . $peertube_config_js))
    {
        $popcorn_config .= "<script type=\"text/javascript\" src=\"{$peertube_config_js}?version=" . $version . "\"></script>\n";
    }
    $buffer = str_replace("%POPCORN_CONFIG%", $popcorn_config, $buffer);

    if ($type == 'site')
    {
        //add socialicons script
        if ($adds7script) {
            $buffer = str_replace("%ADDTHISSCRIPT%", '<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-50f40a8436e8c4c5" async="async"></script>', $buffer);
        } else {
            $buffer = str_replace("%ADDTHISSCRIPT%", '', $buffer);
        }
    }
    $index = "index.htm";

	
    $file_handle = fopen($dir_path . $index, 'w');

    fwrite($file_handle, $buffer, strlen($buffer));
    fclose($file_handle);

    $zipfile->add_files($index);

    array_push($delete_file_array, $dir_path . $index);
}


/**
 *
 * Function scorm html page create
 * This function creates a scorm HTML page for export
 * @param string $name - name of the template
 * @param string $type - type of template this is
 * @version 1.0
 * @author Patrick Lockley
 */
function scorm_html5_page_create($id, $type, $parent_name, $lo_name, $language, $date_modified, $date_created, $need_download_url=false, $logo='', $plugins='') {

    global $xerte_toolkits_site, $dir_path, $delete_file_array, $zipfile, $youtube_api_key;

    $version = getVersion();
    $language_ISO639_1code = substr($language, 0, 2);

    if ($parent_name == "Nottingham")
    {
        $common_folder = "common_html5";
    }
    else
    {
        $common_folder = "common";
    }
    $template_path = $xerte_toolkits_site->basic_template_path . $type . 'parent_templates/' . $parent_name;


    $scorm_html_page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $type . "/player_html5/rloObject.htm");
    $scorm_html_page_content = str_replace("%TWITTERCARD%", "",$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%VERSION%", $version, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%LANGUAGE%", $language_ISO639_1code, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%VERSION_PARAM%", "", $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%TITLE%", $lo_name, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%LOGO%", $logo, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%TEMPLATEPATH%", "", $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%TEMPLATEID%", $id, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%XMLPATH%", "", $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%XMLFILE%", "template.xml", $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%THEMEPATH%", "themes/" . $parent_name . "/",$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%OFFLINESCRIPTS%", "",$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%OFFLINEINCLUDES%", "",$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%MATHJAXPATH%", "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/", $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%LASTUPDATED%", $date_modified, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%DATECREATED%", $date_created, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%NUMPLAYS%", 0, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%USE_URL%", "var use_url=true;", $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%GLOBALHIDESOCIAL%", $xerte_toolkits_site->globalhidesocial, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%GLOBALSOCIALAUTH%", $xerte_toolkits_site->globalsocialauth, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%PLUGINS%", 'var plugins=' . json_encode($plugins), $scorm_html_page_content);

    // Check popcorn mediasite and peertube config files
    $popcorn_config = "";
    $mediasite_config_js = $common_folder . "/js/popcorn/config/mediasite_urls.js";
    if (file_exists($template_path . $mediasite_config_js))
    {
        $popcorn_config .= "<script type=\"text/javascript\" src=\"{$mediasite_config_js}?version=" . $version . "\"></script>\n";
    }
    $peertube_config_js = $common_folder . "/js/popcorn/config/peertube_urls.js";
    if (file_exists($template_path . $peertube_config_js))
    {
        $popcorn_config .= "<script type=\"text/javascript\" src=\"{$peertube_config_js}?version=" . $version . "\"></script>\n";
    }
    $scorm_html_page_content = str_replace("%POPCORN_CONFIG%", $popcorn_config, $scorm_html_page_content);

    $tracking = "<script type=\"text/javascript\" src=\"apiwrapper_1.2.js\"></script>\n";
    $tracking .= "<script type=\"text/javascript\" src=\"xttracking_scorm1.2.js\"></script>\n";
    $tracking .= "<script type=\"text/javascript\" src=\"languages/js/en-GB/xttracking_scorm1.2.js\"></script>\n";
    if (file_exists($dir_path . "languages/js/" . $language . "/xttracking_scorm1.2.js")) {
        $tracking .= "<script type=\"text/javascript\" src=\"languages/js/" . $language . "/xttracking_scorm1.2.js\"></script>\n";
    }
    if ($need_download_url) $tracking .= "   <script type=\"text/javascript\">var x_downloadURL = \"" . $xerte_toolkits_site->site_url . "download.php\";</script>\n";

    $scorm_html_page_content = str_replace("%TRACKING_SUPPORT%", $tracking, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%EMBED_SUPPORT%", "", $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%YOUTUBEAPIKEY%", $youtube_api_key, $scorm_html_page_content);

    $file_handle = fopen($dir_path . "scormRLO.htm", 'w');

    fwrite($file_handle, $scorm_html_page_content, strlen($scorm_html_page_content));
    fclose($file_handle);

    $zipfile->add_files("scormRLO.htm");

    array_push($delete_file_array, $dir_path . "scormRLO.htm");
}

/**
 *
 * Function folder loop
 * This function loops through a folder tree collating files
 * @param string $path - path to move through
 * @version 1.0
 * @author Patrick Lockley
 */
function export_folder_loop($path, $recursive = true, $ext = NULL, $dest = NULL) {

    global $folder_id_array, $folder_array, $file_array, $zipfile, $dir_path;

    $d = opendir($path);
    array_push($folder_id_array, $d);
    while ($f = readdir($d)) {

        if (is_dir($path . $f)) {

            if (($f != ".") && ($f != "..") && $recursive) {
                export_folder_loop($path . $f . "/");
            }
        } else {
            if ($f != "data.xml" && $f != "preview.xml") {
                if ($ext == NULL || strrpos($f, $ext) == strlen($f) - strlen($ext)) {
                    $srcfile = $path . $f;
                    if ($dest != NULL) {
                        $destfile = $dest . $f;
                    } else {
                        $destfile = "";
                    }
                    //echo $string . "<br />";
                    array_push($file_array, array($srcfile, $destfile));
                }
            }
        }
    }

    $x = array_pop($folder_id_array);

    closedir($d);
}

/**
 *
 * Function clean up files
 * This function removes files used in making the export
 * @param string $name - name of the template
 * @param string $type - type of template this is
 * @version 1.0
 * @author Patrick Lockley
 */
function clean_up_files() {

    global $dir_path, $delete_file_array, $delete_folder_array;

    while ($file = array_pop($delete_file_array)) {
        @unlink($file);
    }

    while ($folder = array_pop($delete_folder_array)) {
        @rmdir($folder);
    }
}

/**
 *
 * Function directory maker
 * This function adds directories to file names so as to make the zip names correct
 * @param string $name - name of the template
 * @param string $type - type of template this is
 * @version 1.0
 * @author Patrick Lockley
 */
function directory_maker($string) {
    global $dir_path, $delete_folder_array;

    $directory_path_array = explode("/", $string);
    $x = 0;
    while ($x != (count($directory_path_array) - 1)) {
        if ($x != 0) {
            $y = 0;
            $extra_dir_string = "";
            while ($y <= $x) {
                $extra_dir_string .= $directory_path_array[$y++] . "/";
                if (!file_exists($dir_path . $extra_dir_string)) {
                    mkdir($dir_path . $extra_dir_string);
                    chmod($dir_path . $extra_dir_string, 0777);
                    array_push($delete_folder_array, $dir_path . $extra_dir_string);
                }
            }
        } else {
            if (!file_exists($dir_path . $directory_path_array[$x])) {
                mkdir($dir_path . $directory_path_array[$x]);
                chmod($dir_path . $directory_path_array[$x], 0777);
                array_push($delete_folder_array, $dir_path . $directory_path_array[$x]);
            }
        }
        $x++;
    }
}

/**
 *
 * Function copy parent files
 * This function copies the files from parent template folder into the zip
 * @version 1.0
 * @author Patrick Lockley
 */
function copy_parent_files() {

    global $file_array, $dir_path, $parent_template_path, $delete_file_array;

    while ($file = array_pop($file_array)) {
        $string = str_replace($parent_template_path, "", $file[0]);

        directory_maker($string);
        if ($string == "data.xwd") {
            $string = "template.xwd";
        }
        array_push($delete_file_array, $dir_path . $string);
        @copy($file[0], $dir_path . $string);
    }
}

/**
 *
 * Function copy extra files
 * This function copies the files from parent template folder into the zip
 * @version 1.0
 * @author Patrick Lockley, Tom Reijnders
 */
function copy_extra_files() {

    global $file_array, $dir_path, $xerte_toolkits_site, $delete_file_array;

    while ($file = array_pop($file_array)) {
        if (strlen($file[1]) == 0) {
            $string = str_replace($xerte_toolkits_site->root_file_path, "", $file[0]);
        } else {
            $string = $file[1];
        }
        directory_maker($string);

        array_push($delete_file_array, $dir_path . $string);
        @copy($file[0], $dir_path . $string);
    }
}

/**
 *
 * Function xerte zip files
 * This function zips up the files
 * @version 1.0
 * @author Patrick Lockley
 * @global $zipfile
 * @global $file_array - emptied by array_pop calls.
 */
function xerte_zip_files($fullArchive, $dir_path) {

    global $file_array, $zipfile;

    _debug("Zipping up: " . $fullArchive);

    $data = file_get_contents($dir_path . "data.xml");
    // Decode all filenames in data
    $data2 = rawurldecode($data);
    $data3 = html_entity_decode($data2);

    while ($file = array_pop($file_array)) {
        if (strpos($file[0], "data.xwd") === false) {
            /* Check if this is a media file */
            if (!$fullArchive) {
                $skipfile = false;
                // Skip extra copies
                if (strpos($file[0], ".json" ) !== false || strpos($file[0], "data.xml") !== false || strpos($file[0], "preview.xml") !== false)
                {
                    $skipfile = true;
                }
                if ($skipfile)
                    continue;
            }
            $string = str_replace($dir_path, "", $file[0]);
            if (!$fullArchive && strpos($string, "/media/") !== false) {
                /* only add file if used */
                if (strpos($data3, $string) !== false) {
                    $zipfile->add_files($string);
                }
            } else {
                $zipfile->add_files($string);
            }
        }
    }
}
