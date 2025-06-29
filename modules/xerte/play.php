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
require_once(dirname(__FILE__) .  '/../../website_code/php/config/popcorn.php');

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

function escape_javascript($string)
{
    return str_replace(array("\r", "\n"), array('\r', '\n'), addslashes($string));
}

function show_template_page($row, $datafile="", $xapi_enabled = false)
{
    global $xerte_toolkits_site;
	global $youtube_api_key;
	global $pedit_enabled;
	global $lti_enabled;
	global $xapi_enabled;
	global $x_embed;
	global $x_embed_activated;

    _load_language_file("/modules/xerte/preview.inc");

    $version = getVersion();

    // set token to check validity of ajax call in rss models
    set_token();
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
    $string_for_flash_xml = $xmlfile;

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
    if($xapi_enabled) {
        if ($pedit_enabled) {
            if ($row["tsugi_xapi_enabled"] == 1) {
                $tracking_js_file = array($flash_js_dir . "pedit/ALOConnection.js", $flash_js_dir . "xAPI/xttracking_xapi.js");
            } else {
                $tracking_js_file = array($flash_js_dir . "pedit/ALOConnection.js", $template_path . "common_html5/js/xttracking_noop.js");
            }
        } else {
            if ($row["tsugi_xapi_enabled"] == 1) {
                $tracking_js_file = array($flash_js_dir . "xAPI/xttracking_xapi.js");
            }
        }
    }

    // Get plugins
    $plugins = array();
    if (file_exists($template_path . "plugins")) {
        $pluginfiles = scandir($template_path . "plugins/");
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
                $plugins[$plugininfo['filename']]->script = file_get_contents($template_path . "plugins/" . $pluginfile);
            }
            if ($plugininfo['extension'] == 'css') {
                $plugins[$plugininfo['filename']]->css = file_get_contents($template_path . "plugins/" . $pluginfile);
            }
        }
    }
    $rlo_object_file = "rloObject.htm";
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
        if ($xapi_enabled && $row["tsugi_xapi_enabled"] == 1) {
            $tracking .= "<script type=\"text/javascript\" src=\"" . $flash_js_dir . "xAPI/xapidashboard.min.js?version=" . $version . "\"></script>\n";
            $tracking .= "<script type=\"text/javascript\" src=\"" . $flash_js_dir . "xAPI/xapiwrapper.min.js?version=" . $version . "\"></script>\n";        }
        if($xapi_enabled)
        {
            $tracking .= "<script>\n";
            if($row["tsugi_xapi_enabled"] == 1) {
                $tracking .= "  var lrsEndpoint = '" . $xerte_toolkits_site->site_url . (isset($lti_enabled) && $lti_enabled && function_exists('addSession') ? addSession("xapi_proxy.php") . "&tsugisession=1" : "xapi_proxy.php") . "';\n";
                $tracking .= "  var lrsUsername = '';\n";
                $tracking .= "  var lrsPassword  = '';\n";
                $tracking .= "  var lrsAllowedUrls = '" . $row["dashboard_allowed_links"] . "';\n";
                if (isset($lti_enabled) && $lti_enabled && $row["tsugi_published"] == 1) {
                    _debug("LTI User detected: " . print_r($xerte_toolkits_site->lti_user, true));
                    $tracking .= "   var username = '" . $xerte_toolkits_site->lti_user->email . "';\n";
                    $tracking .= "   var fullusername = '" . escape_javascript($xerte_toolkits_site->lti_user->displayname) . "';\n";
                    $xapi_student_id_mode = $row['tsugi_xapi_student_id_mode'];
                    if (true_or_false($xerte_toolkits_site->xapi_force_anonymous_lrs)) {
                        if ($xapi_student_id_mode == 0 || $xapi_student_id_mode == 2)
                        {
                            $xapi_student_id_mode = 1;
                        }
                    }
                    $tracking .= "   var studentidmode = '" . $xapi_student_id_mode . "';\n";
                    if ($xapi_student_id_mode == 1) {
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
                        $tracking .= "   var fullusername = '" . escape_javascript($xerte_toolkits_site->xapi_user->displayname) . "';\n";
                        if (true_or_false($xerte_toolkits_site->xapi_force_anonymous_lrs))
                        {
                            $tracking .= "  var mboxsha1 = '" . sha1("mailto:" . $xerte_toolkits_site->lti_user->email) . "';\n";
                            $tracking .= "   var studentidmode = 1;\n";
                        }
                        else {
                            $tracking .= "   var studentidmode = 0;\n";
                        }
                    }
                    else {
                        $tracking .= "   var studentidmode = 3;\n";
                    }
                }
                if (isset($xerte_toolkits_site->group))
                {
                    $tracking .= "   var groupname = '" . escape_javascript($xerte_toolkits_site->group) . "';\n";
                }
                if (isset($xerte_toolkits_site->course))
                {
                    $tracking .= "   var coursename = '" . escape_javascript($xerte_toolkits_site->course) . "';\n";
                }
                if (isset($xerte_toolkits_site->module))
                {
                    $tracking .= "   var modulename = '" . escape_javascript($xerte_toolkits_site->module) . "';\n";
                }
            }
            $tracking .= "</script>\n";
            _debug("Tracking script: " . $tracking);
        }

        $page_content = str_replace("%TRACKING_SUPPORT%", $tracking, $page_content);
        $page_content = str_replace("%EMBED_SUPPORT%", "", $page_content);
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
        $language_ISO639_1code = substr($xmlFixer->getLanguage(), 0, 2);

        // $engine is assumed to be javascript if flash is NOT set
        $page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/player_html5/$rlo_object_file");

        // Process which logo to use, if any
        $LO_icon_path = $xmlFixer->getIcon()->url;
        if (strpos($LO_icon_path, "FileLocation + '") !== false) {
            $LO_icon_path = str_replace("FileLocation + '" , $string_for_flash, $LO_icon_path);
            $LO_icon_path = rtrim($LO_icon_path, "'");
        }
        $theme_path = 'themes/' . $row['parent_template'] . '/' . $xmlFixer->getTheme();
        $page_content = process_logos($LO_icon_path, $theme_path, $template_path, $page_content);
        $page_content = process_sidebar_logo($theme_path, $page_content);

        $page_content = str_replace("%VERSION%", $version , $page_content);
        $page_content = str_replace("%LANGUAGE%", $language_ISO639_1code, $page_content);
        $page_content = str_replace("%VERSION_PARAM%", "?version=" . $version , $page_content);
        $page_content = str_replace("%TITLE%", $title , $page_content);
        $page_content = str_replace("%TEMPLATEPATH%", $template_path, $page_content);
        $page_content = str_replace("%TEMPLATEID%", $row['template_id'], $page_content);
        $page_content = str_replace("%SITEURL%", $xerte_toolkits_site->site_url, $page_content);
        $page_content = str_replace("%XMLPATH%", $string_for_flash, $page_content);
        $page_content = str_replace("%XMLFILE%", $string_for_flash_xml, $page_content);
        $page_content = str_replace("%THEMEPATH%", "themes/" . $row['parent_template'] . "/",$page_content);
        $page_content = str_replace("%USE_URL%", "", $page_content);
        $page_content = str_replace("%PLUGINS%", 'var plugins=' . json_encode($plugins), $page_content);

        //twittercard
        $xml = new XerteXMLInspector();
        $xml->loadTemplateXML($xmlfile);
        $tcoption = $xml->getLOAttribute('tcoption');
        $tcmode= $xml->getLOAttribute('tcmode');
        $tcsite= $xml->getLOAttribute('tcsite');
        $tccreator= $xml->getLOAttribute('tccreator');
        $tctitle= $xml->getLOAttribute('tctitle');
        $tcdescription= $xml->getLOAttribute('tcdescription');
        $tcimage= $xml->getLOAttribute('tcimage');
        $tcimage = str_replace("FileLocation + '" , $xerte_toolkits_site->site_url . $string_for_flash, $tcimage);
        $tcimage = str_replace("'", "", $tcimage);
        $tcimagealt= $xml->getLOAttribute('tcimagealt');
        if ($tcoption=="true"){
            $page_content = str_replace("%TWITTERCARD%", '<meta name="twitter:card" content="'.$tcmode.'"><meta name="twitter:site" content="'.$tcsite.'"><meta name="twitter:creator" content="'.$tccreator.'"><meta name="twitter:title" content="'.$tctitle.'"><meta name="twitter:description" content="'.$tcdescription.'"><meta name="twitter:image" content="'.$tcimage.'"><meta name="twitter:image:alt" content="'.$tcimagealt.'">', $page_content);
        }else{
            $page_content = str_replace("%TWITTERCARD%", "", $page_content);
        }
        // Handle offline variables
        $page_content = str_replace("%OFFLINESCRIPTS%", "", $page_content);
        $page_content = str_replace("%OFFLINEINCLUDES%", "", $page_content);
        $page_content = str_replace("%MATHJAXPATH%", "https://cdn.jsdelivr.net/npm/mathjax@2/", $page_content);

        $tracking = "";
        foreach($tracking_js_file as $jsfile)
        {
            $tracking .= "<script type=\"text/javascript\" src=\"$jsfile?version=" . $version . "\"></script>\n";
        }
        if ($xapi_enabled && $row["tsugi_xapi_enabled"] == 1) {
            $tracking .= "<script type=\"text/javascript\" src=\"" . $flash_js_dir . "xAPI/xapidashboard.min.js?version=" . $version . "\"></script>\n";
            //$tracking .= "<script type=\"text/javascript\" src=\"" . $flash_js_dir . "xAPI/xapicollection.min.js?version=" . $version . "\"></script>\n";
            $tracking .= "<script type=\"text/javascript\" src=\"" . $flash_js_dir . "xAPI/xapiwrapper.min.js?version=" . $version . "\"></script>\n";
        }
        if($xapi_enabled)
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
                if (isset($lti_enabled) && $lti_enabled)
                {
                    $tracking .= "  var lrsEndpoint = '" . $xerte_toolkits_site->site_url . (function_exists('addSession') ? addSession("xapi_proxy.php") . "&tsugisession=1" : "xapi_proxy.php") . "';\n";
                    if (function_exists('addSession')) {
                        $tracking .= "  var sessionParam = '" . addSession("") . "&tsugisession=1';\n";
                    }
                }
                else
                {
                    $tracking .= "  var lrsEndpoint = '" . $xerte_toolkits_site->site_url . (function_exists('addSession') ? addSession("xapi_proxy.php") . "&tsugisession=0" : "xapi_proxy.php") . "';\n";
                    if (function_exists('addSession')) {
                        $tracking .= "  var sessionParam = '" . addSession("") . "&tsugisession=0';\n";
                    }
                }
                $tracking .= "  var lrsUsername = '';\n";
                $tracking .= "  var lrsPassword  = '';\n";
                $tracking .= "  var lrsAllowedUrls = '" . $row["dashboard_allowed_links"] . "';\n";
                if (isset($_SESSION['XAPI_PROXY'])){
                    if ($_SESSION['XAPI_PROXY']['db']) {
                        $tracking .= "  var lrsUseDb = true;\n";
                    }
                    else
                    {
                        $tracking .= "  var lrsUseDb = false;\n";
                    }
                    if ($_SESSION['XAPI_PROXY']['extra_install'] && $_SESSION['XAPI_PROXY']['extra_install'] != "") {
                        $tracking .= "  var lrsExtraInstall = " . json_encode($_SESSION['XAPI_PROXY']['extra_install']) . ";\n";
                    }
                }
                else
                {
                    $tracking .= "  var lrsUseDb = false;\n";
                }
                if (isset($lti_enabled) && $lti_enabled && $row["tsugi_published"] == 1) {
                    _debug("LTI User detected: " . print_r($xerte_toolkits_site->lti_user, true));
                    $tracking .= "   var username = '" . $xerte_toolkits_site->lti_user->email . "';\n";
                    $tracking .= "   var fullusername = '" . escape_javascript($xerte_toolkits_site->lti_user->displayname) . "';\n";
                    $tracking .= "   var studentidmode = '" . $row['tsugi_xapi_student_id_mode'] . "';\n";
                    $tracking .= "   var mboxsha1 = '" . sha1("mailto:" . $xerte_toolkits_site->lti_user->email) . "';\n";
                }
                else
                {
                    // Only xAPI - force group mode
                    if (isset($xerte_toolkits_site->xapi_user))
                    {
                        // actor is set
                        _debug("xAPI User detected: " . print_r($xerte_toolkits_site->xapi_user, true));
                        $tracking .= "   var username = '" . $xerte_toolkits_site->xapi_user->email . "';\n";
                        $tracking .= "   var fullusername = '" . escape_javascript($xerte_toolkits_site->xapi_user->displayname) . "';\n";
                        $tracking .= "   var studentidmode = " . $xerte_toolkits_site->xapi_user->studentidmode . ";\n";
                        $tracking .= "   var mboxsha1 = '" . sha1("mailto:" . $xerte_toolkits_site->lti_user->email) . "';\n";
                    }
                    else {
                        $tracking .= "   var studentidmode = 3;\n";
                    }
                }
                if (isset($xerte_toolkits_site->group))
                {
                    $tracking .= "   var groupname = '" . escape_javascript($xerte_toolkits_site->group) . "';\n";
                }
                if (isset($xerte_toolkits_site->course))
                {
                    $tracking .= "   var coursename = '" . escape_javascript($xerte_toolkits_site->course) . "';\n";
                }
                if (isset($xerte_toolkits_site->module))
                {
                    $tracking .= "   var modulename = '" . escape_javascript($xerte_toolkits_site->module) . "';\n";
                }
                if (isset($xerte_toolkits_site->lti_context_id))
                {
                    $tracking .= "   var lti_context_id = '" . escape_javascript($xerte_toolkits_site->lti_context_id) . "';\n";
                }
                if (isset($xerte_toolkits_site->lti_context_name))
                {
                    $tracking .= "   var lti_context_name = '" . escape_javascript($xerte_toolkits_site->lti_context_name) . "';\n";
                }
                if (isset($xerte_toolkits_site->lti_users))
                {
                    $tracking .= "   var lti_users = '" . escape_javascript(implode(",",$xerte_toolkits_site->lti_users)) . "';\n";
                } else {
                    $tracking .= "   var lti_users = '';\n";
                }
                //DONE if lti_users is set create js varaible
            }
	    $tracking .= "</script>\n";
            //$tracking .= "var lti_context_id = '1390';  var lti_context_name = 'Don Bosco College';\n</script>\n";
            _debug("Tracking script: " . $tracking);
        }
        else
        {
            if (isset($lti_enabled) && $lti_enabled)
            {
                // Set lti_enabled variable so that we can send back gradebook results through LTI
                $tracking .= "<script>\n";
                $tracking .= "  var lti_enabled=true;\n";
                $tracking .= "  var xapi_enabled=true;\n";
                $tracking .= "</script>\n";
                _debug("Tracking script: " . $tracking);
            }
        }

		$page_content = str_replace("%TRACKING_SUPPORT%", $tracking, $page_content);

		$page_content = str_replace("%YOUTUBEAPIKEY%", $youtube_api_key, $page_content);
        $page_content = str_replace("%LASTUPDATED%", $row['date_modified'], $page_content);
		$page_content = str_replace("%DATECREATED%", $row['date_created'], $page_content);
		$page_content = str_replace("%NUMPLAYS%", $row['number_of_uses'], $page_content);

		if ($x_embed)
        {
            if ($x_embed_activated)
            {
                $embedsupport = "    var x_embed = true;\n";
                $embedsupport .= "    var x_embed_activated = true;\n";
            }
            else{
                $embedsupport = "    var x_embed = true;\n";
                $embedsupport .= "    var x_embed_activated = false;\n";
                $embedsupport .= "    var x_embed_activation_url = '" . $_SERVER['REQUEST_URI'] . "&activated=true';\n";
            }
        }
		else
		{
            $embedsupport = "";
        }
        $page_content = str_replace("%EMBED_SUPPORT%", $embedsupport, $page_content);

        // Check popcorn mediasite and peertube config files
        $popcorn_config = popcorn_config($template_path . "common_html5/", $version);
        $page_content = str_replace("%POPCORN_CONFIG%", $popcorn_config, $page_content);
        $page_content = str_replace("%TOKEN%", $_SESSION['token'], $page_content);

    }

    return $page_content;
}

function show_template($row, $xapi_enabled=false)
{
    echo show_template_page($row, "", $xapi_enabled);
}

