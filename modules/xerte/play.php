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

function show_template_page($row, $datafile="", $tsugi_enabled = false)
{
    global $xerte_toolkits_site;
	global $youtube_api_key;
	global $pedit_enabled;

    _load_language_file("/modules/xerte/preview.inc");

    $version = getVersion();
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
    $template_path = "modules/" . $row['template_framework'] . "/parent_templates/" . $row['parent_template'] . "/";
    $rlo_file = $template_path . $row['template_name'] . ".rlt";
    if (file_exists("modules/" . $row['template_framework'] . "/templates/" . $row['template_name'] . "/wizards/" . $xmlFixer->getLanguage() . "/data.xwd"))
    {
        $xwd_file = "modules/" . $row['template_framework'] . "/templates/" . $row['template_name'] . "/wizards/" . $xmlFixer->getLanguage() . "/data.xwd";
    }
    else{
        $xwd_file = $template_path . "/wizards/" . $xmlFixer->getLanguage() . "/data.xwd";
    }

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
    if (isset($_REQUEST['engine'])) {
        if ($_REQUEST['engine'] == 'other') {
            if ($engine == 'flash')
                $engine = 'javascript';
            else
                $engine = 'flash';
        } else {
            $engine = $_REQUEST['engine'];
        }
    }
    $tracking_js_file = array($template_path . "common_html5/js/xttracking_noop.js");
    if($tsugi_enabled) {
        $rlo_object_file = "rloObject.htm";


        if ($pedit_enabled)
        {
            if($row["tsugi_xapi_enabled"] == 1) {
                $tracking_js_file = array($flash_js_dir . "pedit/ALOConnection.js", $flash_js_dir . "xAPI/xttracking_xapi.js");
            }
            else
            {
                $tracking_js_file = array($flash_js_dir . "pedit/ALOConnection.js", $template_path . "common_html5/js/xttracking_noop.js");
            }
        }
        else
        {
            if($row["tsugi_xapi_enabled"] == 1) {
                $tracking_js_file = array($flash_js_dir . "xAPI/xttracking_xapi.js");
            }
        }
    }else{
        $rlo_object_file = "rloObject.htm";
    }
    if ($engine == 'flash')
    {
        $page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/player/$rlo_object_file");

        $page_content = str_replace("%WIDTH%", $x, $page_content);
        $page_content = str_replace("%HEIGHT%", $y, $page_content);
        $page_content = str_replace("%TITLE%", $title , $page_content);
        $page_content = str_replace("%RLOFILE%", $rlo_file, $page_content);
        $page_content = str_replace("%JSDIR%", $flash_js_dir, $page_content);
        $page_content = str_replace("%XMLPATH%", $string_for_flash, $page_content);
        $page_content = str_replace("%XMLFILE%", $string_for_flash_xml, $page_content);
        $page_content = str_replace("%SITE%",$xerte_toolkits_site->site_url,$page_content);

        $tracking = "";
        foreach($tracking_js_file as $jsfile)
        {
            $tracking .= "<script type=\"text/javascript\" src=\"$jsfile?version=" . $version . "\"></script>\n";
        }
        if ($tsugi_enabled && $row["tsugi_xapi_enabled"] == 1) {
            $tracking .= "<script type=\"text/javascript\" src=\"" . $flash_js_dir . "xAPI/xapidashboard.min.js?version=" . $version . "\"></script>\n";
            $tracking .= "<script type=\"text/javascript\" src=\"" . $flash_js_dir . "xAPI/xapiwrapper.min.js?version=" . $version . "\"></script>\n";        }
        if($tsugi_enabled)
        {
            $tracking .= "<script>\n";
            if($row["tsugi_xapi_enabled"] == 1) {
                $tracking .= "  var lrsEndpoint = '" . $xerte_toolkits_site->site_url . (function_exists('addSession') ? addSession("xapi_proxy.php") . "&tsugisession=1" : "xapi_proxy.php") . "';\n";
                $tracking .= "  var lrsUsername = '';\n";
                $tracking .= "  var lrsPassword  = '';\n";
                $tracking .= "  var lrsAllowedUrls = '" . $row["dashboard_allowed_links"] . "';\n";
                if ($row["tsugi_published"] == 1) {
                    _debug("LTI User detected: " . print_r($xerte_toolkits_site->lti_user, true));
                    $tracking .= "   var username = '" . $xerte_toolkits_site->lti_user->email . "';\n";
                    $tracking .= "   var fullusername = '" . $xerte_toolkits_site->lti_user->displayname . "';\n";
                    $tracking .= "   var studentidmode = '" . $row['tsugi_xapi_student_id_mode'] . "';\n";
                    if ($row['tsugi_xapi_student_id_mode'] == 1)
                    {
                        $tracking .= "  var mboxsha1 = '" . sha1("mailto:" . $xerte_toolkits_site->lti_user->email) . "';\n";
                    }
                }
                else
                {
                    // Only xAPI - force group mode
                    if (isset($xerte_toolkits_site->xapi_user))
                    {
                        // actor is set
                        _debug("xAPI User detected: " . print_r($xerte_toolkits_site->xapi_user, true));
                        $tracking .= "   var username = '" . $xerte_toolkits_site->xapi_user->email . "';\n";
                        $tracking .= "   var fullusername = '" . $xerte_toolkits_site->xapi_user->displayname . "';\n";
                        $tracking .= "   var studentidmode = 0;\n";
                    }
                    else {
                        $tracking .= "   var studentidmode = 3;\n";
                    }
                }
                if (isset($xerte_toolkits_site->group))
                {
                    $tracking .= "   var groupname = '" . $xerte_toolkits_site->group . "';\n";
                }
                if (isset($xerte_toolkits_site->course))
                {
                    $tracking .= "   var coursename = '" . $xerte_toolkits_site->course . "';\n";
                }
                if (isset($xerte_toolkits_site->module))
                {
                    $tracking .= "   var modulename = '" . $xerte_toolkits_site->module . "';\n";
                }
            }
            $tracking .= "</script>\n";
            _debug("Tracking script: " . $tracking);
        }

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
        $page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/player_html5/$rlo_object_file");
        $page_content = str_replace("%VERSION%", $version , $page_content);
        $page_content = str_replace("%VERSION_PARAM%", "?version=" . $version , $page_content);
        $page_content = str_replace("%TITLE%", $title , $page_content);
        $page_content = str_replace("%TEMPLATEPATH%", $template_path, $page_content);
        $page_content = str_replace("%TEMPLATEID%", $_GET['template_id'], $page_content);
        $page_content = str_replace("%XMLPATH%", $string_for_flash, $page_content);
        $page_content = str_replace("%XMLFILE%", $string_for_flash_xml, $page_content);
        $page_content = str_replace("%THEMEPATH%", "themes/" . $row['parent_template'] . "/",$page_content);

        // Handle offline variables
        $page_content = str_replace("%OFFLINESCRIPTS%", "", $page_content);
        $page_content = str_replace("%OFFLINEINCLUDES%", "", $page_content);
        $page_content = str_replace("%MATHJAXPATH%", "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/", $page_content);

        $tracking = "";
        foreach($tracking_js_file as $jsfile)
        {
            $tracking .= "<script type=\"text/javascript\" src=\"$jsfile?version=" . $version . "\"></script>\n";
        }
        if ($tsugi_enabled && $row["tsugi_xapi_enabled"] == 1) {
            $tracking .= "<script type=\"text/javascript\" src=\"" . $flash_js_dir . "xAPI/xapidashboard.min.js?version=" . $version . "\"></script>\n";
            //$tracking .= "<script type=\"text/javascript\" src=\"" . $flash_js_dir . "xAPI/xapicollection.min.js?version=" . $version . "\"></script>\n";
            $tracking .= "<script type=\"text/javascript\" src=\"" . $flash_js_dir . "xAPI/xapiwrapper.min.js?version=" . $version . "\"></script>\n";
        }
        if($tsugi_enabled)
        {
            $tracking .= "<script>\n";
            if (isset($lti_enabled) && $lti_enabled)
            {
                // Set lti_enabled variable so that we can send back gradebook results through LTI
                $tracking .= "  var lti_enabled=true;\n";
            }
            else
            {
                $tracking .= "  var lti_enabled=false;\n";
            }
            if($row["tsugi_xapi_enabled"] == 1) {
                $tracking .= "  var lrsEndpoint = '" . $xerte_toolkits_site->site_url . (function_exists('addSession') ? addSession("xapi_proxy.php") . "&tsugisession=1" : "xapi_proxy.php") . "';\n";
                $tracking .= "  var lrsUsername = '';\n";
                $tracking .= "  var lrsPassword  = '';\n";
                $tracking .= "  var lrsAllowedUrls = '" . $row["dashboard_allowed_links"] . "';\n";
                if ($row["tsugi_published"] == 1) {
                    _debug("LTI User detected: " . print_r($xerte_toolkits_site->lti_user, true));
                    $tracking .= "   var username = '" . $xerte_toolkits_site->lti_user->email . "';\n";
                    $tracking .= "   var fullusername = '" . $xerte_toolkits_site->lti_user->displayname . "';\n";
                    $tracking .= "   var studentidmode = '" . $row['tsugi_xapi_student_id_mode'] . "';\n";
                    if ($row['tsugi_xapi_student_id_mode'] == 1)
                    {
                        $tracking .= "  var mboxsha1 = '" . sha1("mailto:" . $xerte_toolkits_site->lti_user->email) . "';\n";
                    }
                }
                else
                {
                    // Only xAPI - force group mode
                    if (isset($xerte_toolkits_site->xapi_user))
                    {
                        // actor is set
                        _debug("xAPI User detected: " . print_r($xerte_toolkits_site->xapi_user, true));
                        $tracking .= "   var username = '" . $xerte_toolkits_site->xapi_user->email . "';\n";
                        $tracking .= "   var fullusername = '" . $xerte_toolkits_site->xapi_user->displayname . "';\n";
                        $tracking .= "   var studentidmode = " . $xerte_toolkits_site->xapi_user->studentidmode . ";\n";
                    }
                    else {
                        $tracking .= "   var studentidmode = 3;\n";
                    }
                }
                if (isset($xerte_toolkits_site->group))
                {
                    $tracking .= "   var groupname = '" . $xerte_toolkits_site->group . "';\n";
                }
                if (isset($xerte_toolkits_site->course))
                {
                    $tracking .= "   var coursename = '" . $xerte_toolkits_site->course . "';\n";
                }
                if (isset($xerte_toolkits_site->module))
                {
                    $tracking .= "   var modulename = '" . $xerte_toolkits_site->module . "';\n";
                }
            }
            $tracking .= "</script>\n";
            _debug("Tracking script: " . $tracking);
        }

		$page_content = str_replace("%TRACKING_SUPPORT%", $tracking, $page_content);

		$page_content = str_replace("%YOUTUBEAPIKEY%", $youtube_api_key, $page_content);

    }
    if(substr($rlo_object_file, -3) == "php")
    {
        $tmp = tmpfile ();
        $tmpf = stream_get_meta_data ( $tmp );
        $tmpf = $tmpf ['uri'];
        fwrite ( $tmp, $page_content );
        $ret = include($tmpf);
        fclose ( $tmp );
        return $ret;

    }

    return $page_content;
}

function show_template($row, $tsugi_enabled=false)
{
    echo show_template_page($row, "", $tsugi_enabled);
}

