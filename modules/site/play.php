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
require(dirname(__FILE__) . "/module_functions.php");
require_once(dirname(__FILE__) .  '/../../website_code/php/config/popcorn.php');
//Function show_template
//
// (pl)
// Set up the preview window for a xerte piece

//popcorn bestanden toevoegen
require(dirname(__FILE__) .  '/../../website_code/php/xmlInspector.php');
require(dirname(__FILE__) .  '/../../website_code/php/user_library.php');

function process_logos($LO_logo, $theme_path, $template_path, $page_content) {
    $base_path = dirname(__FILE__) . '/../../' . $template_path . 'common/img/';
    $extensions = array('svg',  'png', 'jpg', 'gif');

    foreach (array(array('L', '_left'), array('R', '')) as $suffix) {
        $path = get_logo_path($suffix, $LO_logo, $theme_path, $template_path);
        if ($path) {
            $page_content = str_replace("%LOGO_" . $suffix[0] . "%", '<img class="logo" src="' . $path . '" alt="" />' , $page_content);
        }
        else {
            $page_content = str_replace("%LOGO_" . $suffix[0] . "%", '<img class="logo" src="" alt="" />' , $page_content);
        }
    }

    return $page_content;
}

function get_logo_path($suffix, $LO_logo, $theme_path, $template_path) {
    $base_path = dirname(__FILE__) . '/../../' . $template_path . 'common/img/';
    $extensions = array('svg',  'png', 'jpg', 'gif');

    // First the author logo
    $logo_path = trim($LO_logo->{$suffix[0] . '_path'});
    if (strlen($logo_path) > 0) {//(file_exists($LO_logo->{$suffix[0] . '_path'})) {
        return  $LO_logo->{$suffix[0] . '_path'};
    }

    // Secondly check the theme logo
    foreach($extensions as $ext) {
        if (file_exists($theme_path . '/logo'. $suffix[1] . '.' . $ext)) {
            return $theme_path . '/logo'. $suffix[1] . '.' . $ext;
        }
    }

    // Lastly check the default location
    foreach($extensions as $ext) {
        if (file_exists($template_path . 'common/img/logo'. $suffix[1] . '.' . $ext)) { 
            return $template_path . 'common/img/logo' . $suffix[1] . '.'. $ext;
        }
    }

    return; //null for not found
}

function fix_filelocation_path($path, $replacement) {
    if (strpos($path, "FileLocation + '") !== false) {
        $path = str_replace("FileLocation + '" , $replacement, $path);
        $path = rtrim($path, "'");
    }
    return $path;
}

function escape_javascript($string)
{
    return str_replace(array("\r", "\n"), array('\r', '\n'), addslashes($string));
}


function show_template($row, $xapi_enabled=false){
    global $xerte_toolkits_site;
    global $youtube_api_key;
    global $pedit_enabled;
    global $lti_enabled;

    $string_for_flash = $xerte_toolkits_site-> users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

    $xmlfile = $string_for_flash . "data.xml";

    $xmlFixer = new XerteXMLInspector();
    $xmlFixer->loadTemplateXML($xmlfile, true);

    _load_language_file("/modules/site/preview.inc");

    if (strlen($xmlFixer->getName()) > 0)
    {
        $title = $xmlFixer->getName();
    }
    else
    {
        $title = SITE_PREVIEW_TITLE;
    }

    $string_for_flash_xml = $xmlfile;

	$template_path = "modules/" . $row['template_framework'] . "/parent_templates/" . $row['parent_template'] . "/";
    $js_dir = "modules/" . $row['template_framework'] . "/";

    list($x, $y) = explode("~",get_template_screen_size($row['template_name'],$row['template_framework']));


    $version = getVersion();

    $tracking_js_file = array($template_path . "common/js/xttracking_noop.js");
    if($xapi_enabled) {
        if ($pedit_enabled) {
            if ($row["tsugi_xapi_enabled"] == 1) {
                $tracking_js_file = array($js_dir . "pedit/ALOConnection.js", $js_dir . "xAPI/xttracking_xapi.js");
            } else {
                $tracking_js_file = array($js_dir . "pedit/ALOConnection.js", $template_path . "common/js/xttracking_noop.js");
            }
        } else {
            if ($row["tsugi_xapi_enabled"] == 1) {
                $tracking_js_file = array($js_dir . "xAPI/xttracking_xapi.js");
            }
        }
    }

    $language_ISO639_1code = substr($xmlFixer->getLanguage(), 0, 2);
    // $engine is assumed to be javascript if flash is NOT set
    $page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/player_html5/rloObject.htm");

    // Process which logo to use, if any
    $LO_logo = new stdClass;
    $LO_logo->L_path = fix_filelocation_path($xmlFixer->getIcon()->logoL, $string_for_flash);
    $LO_logo->R_path = fix_filelocation_path($xmlFixer->getIcon()->logoR, $string_for_flash);
    $theme_path = 'themes/' . $row['parent_template'] . '/' . ($xmlFixer->getTheme() === 'default' ? 'apereo' : $xmlFixer->getTheme());
    $page_content = process_logos($LO_logo, $theme_path, $template_path, $page_content);

    $page_content = str_replace("%VERSION%", $version , $page_content);
    $page_content = str_replace("%VERSION_PARAM%", "?version=" . $version , $page_content);
    $page_content = str_replace("%LANGUAGE%", $language_ISO639_1code, $page_content);
    $page_content = str_replace("%TITLE%", $title , $page_content);
    $page_content = str_replace("%TEMPLATEPATH%", $template_path, $page_content);
    $page_content = str_replace("%TEMPLATEID%", $row['template_id'], $page_content);
    $page_content = str_replace("%XMLPATH%", $string_for_flash, $page_content);
    $page_content = str_replace("%XMLFILE%", $string_for_flash_xml, $page_content);
	$page_content = str_replace("%THEMEPATH%", "themes/" . $row['parent_template'] . "/",$page_content);
	$page_content = str_replace("%SITEURL%", $xerte_toolkits_site->site_url, $page_content);

    $tracking = "";
    foreach($tracking_js_file as $jsfile)
    {
        $tracking .= "<script type=\"text/javascript\" src=\"$jsfile?version=" . $version . "\"></script>\n";
    }
    if ($xapi_enabled && $row["tsugi_xapi_enabled"] == 1) {
        $tracking .= "<script type=\"text/javascript\" src=\"" . $js_dir . "xAPI/xapidashboard.min.js?version=" . $version . "\"></script>\n";
        $tracking .= "<script type=\"text/javascript\" src=\"" . $js_dir . "xAPI/xapiwrapper.min.js?version=" . $version . "\"></script>\n";
    }
    if($xapi_enabled)
    {
        $tracking .= "<script>\n";
        $tracking .= "  var xapi_enabled=true;\n";
        if (isset($lti_enabled) && $lti_enabled)
        {
            // Set lti_enabled variable so that we can send back gradebook results through LTI
            $tracking .= "  var lti_enabled=true;\n";
        }
        else
        {
            $tracking .= "  var lti_enabled=false;\n";
        }
        if (isset($pedit_enabled) && $pedit_enabled)
        {
            // Set lti_enabled variable so that we can send back gradebook results through LTI
            $tracking .= "  var pedit_enabled=true;\n";
        }
        else
        {
            $tracking .= "  var pedit_enabled=false;\n";
        }
        if($row["tsugi_xapi_enabled"] == 1) {
            $tracking .= "  var lrsEndpoint = '" . $xerte_toolkits_site->site_url . (function_exists('addSession') ? addSession("xapi_proxy.php") . "&tsugisession=1" : "xapi_proxy.php") . "';\n";
            $tracking .= "  var lrsUsername = '';\n";
            $tracking .= "  var lrsPassword  = '';\n";
            $tracking .= "  var lrsAllowedUrls = '" . $row["dashboard_allowed_links"] . "';\n";
            $tracking .= "  var ltiEndpoint = '" .  (isset($lti_enabled) && $lti_enabled && function_exists('addSession') ? addSession("lti_launch.php") . "&tsugisession=1&" : "lti_launch.php?") . "';\n";
            $tracking .= "  var lti13Endpoint = '" .  (isset($lti_enabled) && $lti_enabled && function_exists('addSession') ? addSession("lti13_launch.php") . "&tsugisession=1&" : "lti13_launch.php?") . "';\n";
            $tracking .= "  var peditEndpoint = '" . (isset($lti_enabled) && $lti_enabled && function_exists('addSession') ? addSession("pedit_launch.php") . "&tsugisession=1&" : "pedit_launch.php?") . "';\n";
            $tracking .= "  var xapiEndpoint = '" . (isset($lti_enabled) && $lti_enabled && function_exists('addSession') ? addSession("xapi_launch.php") . "&tsugisession=1&" : "xapi_launch.php?") . "';\n";
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
            if (isset($xerte_toolkits_site->lti_context_id))
            {
                $tracking .= "   var lti_context_id = '" . escape_javascript($xerte_toolkits_site->lti_context_id) . "';\n";
            }
            if (isset($xerte_toolkits_site->lti_context_name))
            {
                $tracking .= "   var lti_context_name = '" . escape_javascript($xerte_toolkits_site->lti_context_name) . "';\n";
            }
        }
        $tracking .= "</script>\n";
        _debug("Tracking script: " . $tracking);
    }
    else {
        if (isset($lti_enabled) && $lti_enabled) {
            // Set lti_enabled variable so that we can send back gradebook results through LTI
            $tracking .= "<script>\n";
            $tracking .= "  var lti_enabled=true;\n";
            $tracking .= "  var xapi_enabled=false;\n";
            $tracking .= "  var ltiEndpoint = '" .  (function_exists('addSession') ? addSession("lti_launch.php") . "&tsugisession=1&" : "lti_launch.php?") . "';\n";
            $tracking .= "  var lti13Endpoint = '" .  (function_exists('addSession') ? addSession("lti13_launch.php") . "&tsugisession=1&" : "lti13_launch.php?") . "';\n";
            $tracking .= "  var peditEndpoint = '" . (function_exists('addSession') ? addSession("pedit_launch.php") . "&tsugisession=1&" : "pedit_launch.php?") . "';\n";
            $tracking .= "  var xapiEndpoint = '" . (function_exists('addSession') ? addSession("xapi_launch.php") . "&tsugisession=1&" : "xapi_launch.php?") . "';\n";
            $tracking .=  "</script>\n";
            _debug("Tracking script: " . $tracking);
        }
    }

    $page_content = str_replace("%TRACKING_SUPPORT%", $tracking, $page_content);
    if (isset($youtube_api_key)) {
        $page_content = str_replace("%YOUTUBEAPIKEY%", $youtube_api_key, $page_content);
    }
    else{
        $page_content = str_replace("%YOUTUBEAPIKEY%", "", $page_content);
    }
    $page_content = str_replace("%LASTUPDATED%", $row['date_modified'], $page_content);
    $page_content = str_replace("%DATECREATED%", $row['date_created'], $page_content);
    $page_content = str_replace("%NUMPLAYS%", $row['number_of_uses'], $page_content);
    $page_content = str_replace("%USE_URL%", "", $page_content);
    $page_content = str_replace("%GLOBALHIDESOCIAL%", $xerte_toolkits_site->globalhidesocial, $page_content);
    $page_content = str_replace("%GLOBALSOCIALAUTH%", $xerte_toolkits_site->globalsocialauth, $page_content);


    //remove socialicons script
    $xml = new XerteXMLInspector();
    $xml->loadTemplateXML($xmlfile);
    $hidesocial = $xml->getLOAttribute('hidesocial');
    $footerhide = $xml->getLOAttribute('footerHide');
    $footerpos = $xml->getLOAttribute('footerPos');
    if ($hidesocial != 'true' && $footerhide != 'true' && $footerpos != 'replace' && ($xerte_toolkits_site->globalhidesocial != 'true' || $xerte_toolkits_site->globalsocialauth != 'false')) {
        $page_content = str_replace("%ADDTHISSCRIPT%", '<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-50f40a8436e8c4c5" async="async"></script>', $page_content);
    } else {
        $page_content = str_replace("%ADDTHISSCRIPT%", '', $page_content);
    }

    //twittercard
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

    // Check popcorn mediasite and peertube config files
    $popcorn_config = popcorn_config($template_path . "common/", $version);
    $page_content = str_replace("%POPCORN_CONFIG%", $popcorn_config, $page_content);

    echo $page_content;

}
