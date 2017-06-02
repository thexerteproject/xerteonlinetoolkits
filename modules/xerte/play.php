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

require("module_functions.php");
global $youtube_api_key;
$youtube_api_key = "";
if (file_exists(dirname(__FILE__) . "/../../api_keys.php")){
    include_once(dirname(__FILE__) . "/../../api_keys.php");
}

require_once(dirname(__FILE__) .  '/../../website_code/php/xmlInspector.php');
//Function show_template
//
// Version 1.0 University of Nottingham
// (pl)
// Set up the preview window for a xerte piece

function show_template_page($row, $datafile="")
{
    global $xerte_toolkits_site;
	global $youtube_api_key;

    _load_language_file("/modules/xerte/preview.inc");


    $string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

    if (strlen($datafile) > 0)
    {
        $xmlfile = $string_for_flash . $datafile;
    }
    else
    {
        $xmlfile = $string_for_flash . "data.xml";
    }

    $xmlFixer = new XerteXMLInspector();
    $xmlFixer->loadTemplateXML($xmlfile, true);

    if (strlen($xmlFixer->getName()) > 0)
    {
        $title = $xmlFixer->getName();
    }
    else
    {
        $title = XERTE_PREVIEW_TITLE;
    }
    $string_for_flash_xml = $xmlfile . "?time=" . time();

    $flash_js_dir = "modules/" . $row['template_framework'] . "/";
    $template_path = "modules/" . $row['template_framework'] . "/parent_templates/" . $row['template_name'] . "/";
    $rlo_file = $template_path . $row['template_name'] . ".rlt";

    list($x, $y) = explode("~",get_template_screen_size($row['template_name'],$row['template_framework']));

    // determine the correct engine to use
    $engine = 'flash';
    $extra_flags = explode(";", $row['extra_flags']);
    foreach($extra_flags as $flag)
    {
        $parameter = explode("=", $flag);
        switch($parameter[0])
        {
            case 'engine':
                $engine = $parameter[1];
                break;
        }
    }
    // If given as a parameter, force this engine
    if (isset($_REQUEST['engine']))
    {
        if ($_REQUEST['engine'] == 'other')
        {
            if ($engine == 'flash')
                $engine = 'javascript';
            else
                $engine = 'flash';
        }
        else
        {
            $engine=$_REQUEST['engine'];
        }
    }
    if ($engine == 'flash')
    {
        $page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/player/rloObject.htm");

        $page_content = str_replace("%WIDTH%", $x, $page_content);
        $page_content = str_replace("%HEIGHT%", $y, $page_content);
        $page_content = str_replace("%TITLE%", $title , $page_content);
        $page_content = str_replace("%RLOFILE%", $rlo_file, $page_content);
        $page_content = str_replace("%JSDIR%", $flash_js_dir, $page_content);
        $page_content = str_replace("%XMLPATH%", $string_for_flash, $page_content);
        $page_content = str_replace("%XMLFILE%", $string_for_flash_xml, $page_content);
        $page_content = str_replace("%SITE%",$xerte_toolkits_site->site_url,$page_content);

        $tracking = "<script type=\"text/javascript\" src=\"" . $template_path . "common_html5/js/xttracking_noop.js?version=" . $version . "\"></script>";

        $page_content = str_replace("%TRACKING_SUPPORT%", $tracking, $page_content);
    }
    else if ($engine == 'xml')
    {
        // Just return the raw xml
        $page_content = file_get_contents($xmlfile);

        // Replace "FileLocation + '" with $xerte_toolkits_site->site_url . $string_for_flash
        // NOTE: also get rid of the closing '
        return preg_replace("#FileLocation\s*\+\s*'([^']+)'#", $xerte_toolkits_site->site_url . $string_for_flash . "$1", $page_content);
    }
    else if ($engine == 'export')
    {
        ini_set('max_execution_time', 300);
        require_once($xerte_toolkits_site->root_file_path . "website_code/php/template_status.php");

        if(is_template_exportable($_GET['template_id'])){
                require_once($xerte_toolkits_site->root_file_path . "modules/xerte/export.php");
        }
    }
    else
    {
        $version = getVersion();
        // $engine is assumed to be javascript if flash is NOT set
        $page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/player_html5/rloObject.htm");
        $page_content = str_replace("%VERSION%", $version , $page_content);
        $page_content = str_replace("%VERSION_PARAM%", "?version=" . $version , $page_content);
        $page_content = str_replace("%TITLE%", $title , $page_content);
        $page_content = str_replace("%TEMPLATEPATH%", $template_path, $page_content);
        $page_content = str_replace("%XMLPATH%", $string_for_flash, $page_content);
        $page_content = str_replace("%XMLFILE%", $string_for_flash_xml, $page_content);
        $page_content = str_replace("%THEMEPATH%",$xerte_toolkits_site->site_url . "themes/" . $row['template_name'] . "/",$page_content);

        // Handle offline variables
        $page_content = str_replace("%OFFLINESCRIPTS%", "", $page_content);
        $page_content = str_replace("%OFFLINEINCLUDES%", "", $page_content);
        $page_content = str_replace("%MATHJAXPATH%", "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/", $page_content);

        $tracking = "<script type=\"text/javascript\" src=\"" . $template_path . "common_html5/js/xttracking_noop.js?version=" . $version . "\"></script>";

		$page_content = str_replace("%TRACKING_SUPPORT%", $tracking, $page_content);
		
		$page_content = str_replace("%YOUTUBEAPIKEY%", $youtube_api_key, $page_content);
		
    }
    return $page_content;
}

function show_template($row)
{
    echo show_template_page($row);
}

