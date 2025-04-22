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

require_once(dirname(__FILE__) . "/../config/popcorn.php");


function CheckLearningLocker($lrs, $allowdb=false)
{
    global $xerte_toolkits_site;

    _debug("Checking LRS (allowdb=" . $allowdb ? 'true' : 'false' . "): " . $lrs['lrsendpoint']);
    if ($allowdb && isset($xerte_toolkits_site->LRSDbs) && isset($xerte_toolkits_site->LRSDbs[$lrs['lrsendpoint']]))
    {
        $lrsendpoint = $lrs['lrsendpoint'];
        $lrs['dblrsendpoint'] = $xerte_toolkits_site->LRSDbs[$lrsendpoint]['endpoint'];
        $lrs['dblrskey'] = $xerte_toolkits_site->LRSDbs[$lrsendpoint]['key'];
        $lrs['dblrssecret'] = $xerte_toolkits_site->LRSDbs[$lrsendpoint]['secret'];
        if (isset($xerte_toolkits_site->LRSDbs[$lrsendpoint]['extra_install']))
        {
            $lrs['extra_install'] = $xerte_toolkits_site->LRSDbs[$lrsendpoint]['extra_install'];
        }
        else
        {
            $lrs['extra_install'] = '';
        }
        $lrs['db'] = true;
    }
    else
    {
        $lrs['db'] = false;
    }
    $apos = strpos($lrs['lrsendpoint'], 'api/statements/aggregate');
    if ($apos !== false)
    {
        $lrs['aggregate'] = true;
        $lrs['aggregateendpoint'] = $lrs['lrsendpoint'];
        $lrs['lrsendpoint'] = substr($lrs['lrsendpoint'], 0, $apos) . 'data/xAPI';
    }
    else
    {
        $lrs['aggregate'] = false;
    }
    return $lrs;
}

function xAPI_html_page_create($id, $template_name, $type, $parent_name, $lo_name, $language, $date_modified, $date_created, $need_download_url=false, $logo='', $plugins='') {
global $xerte_toolkits_site, $dir_path, $delete_file_array, $zipfile, $youtube_api_key;

	$version = file_get_contents(dirname(__FILE__) . "/../../../version.txt");
    $language_ISO639_1code = substr($language, 0, 2);
    if ($parent_name == "Nottingham")
    {
        $common_folder = "common_html5/";
    }
    else
    {
        $common_folder = "common/";
    }

    $template_path = $xerte_toolkits_site->basic_template_path . $type . '/parent_templates/' . $parent_name . "/";

    $xapi_html_page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $type . "/player_html5/rloObject.htm");

    $xapi_html_page_content = str_replace("%LANGUAGE%", $language_ISO639_1code , $xapi_html_page_content);
	$xapi_html_page_content = str_replace("%VERSION%", $version , $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%TWITTERCARD%", "",$xapi_html_page_content);

    $xapi_html_page_content = str_replace("%VERSION_PARAM%", "", $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%TITLE%",$lo_name,$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%LOGO%", $logo, $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%TEMPLATEPATH%","",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%XMLPATH%","",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%TEMPLATEID%", $id, $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%XMLFILE%","template.xml",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%THEMEPATH%", "themes/" . $template_name . "/",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%OFFLINESCRIPTS%", "",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%OFFLINEINCLUDES%", "",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%MATHJAXPATH%", "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/", $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%LASTUPDATED%", $date_modified, $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%DATECREATED%", $date_created, $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%NUMPLAYS%", 0, $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%USE_URL%", "var use_url=true;", $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%GLOBALHIDESOCIAL%", $xerte_toolkits_site->globalhidesocial, $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%GLOBALSOCIALAUTH%", $xerte_toolkits_site->globalsocialauth, $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%PLUGINS%", 'var plugins=' . json_encode($plugins), $xapi_html_page_content);

    // Check popcorn mediasite and peertube config files
    $popcorn_config = popcorn_config($template_path . $common_folder, $version, $common_folder);
    $xapi_html_page_content = str_replace("%POPCORN_CONFIG%", $popcorn_config, $xapi_html_page_content);

    $endpoint = $xerte_toolkits_site->LRS_Endpoint;
    $secret = $xerte_toolkits_site->LRS_Secret;
    $key = $xerte_toolkits_site->LRS_Key;
	
	$tracking = "<script type=\"text/javascript\" src=\"xttracking_xapi.js\"></script>\n";
	$tracking .= "<script type=\"text/javascript\" src=\"languages/js/en-GB/xttracking_xapi.js\"></script>\n";
	$tracking .= "<script type=\"text/javascript\" src=\"tincan.js\"></script>\n";
	$tracking .= "<script>var lrsEndpoint=\"$endpoint\";var lrsPassword=\"$secret\"; var lrsUsername=\"$key\";</script>";

	if (file_exists($dir_path . "languages/js/" . $language . "/xttracking_xapi.js") && $language != "en-GB")
	{
		$tracking .= "<script type=\"text/javascript\" src=\"languages/js/" . $language . "/xttracking_xapi.js\"></script>";
	}
	$xapi_html_page_content = str_replace("%TRACKING_SUPPORT%",$tracking,$xapi_html_page_content);
	$xapi_html_page_content = str_replace("%EMBED_SUPPORT%", "",$xapi_html_page_content);
	$xapi_html_page_content = str_replace("%YOUTUBEAPIKEY%", $youtube_api_key, $xapi_html_page_content);

	$index_file = "index.htm";

	$file_handle = fopen($dir_path . $index_file, 'w');
	
	fwrite($file_handle,$xapi_html_page_content,strlen($xapi_html_page_content));
	fclose($file_handle);
	
	$zipfile->add_files($index_file);
	
	array_push($delete_file_array,  $dir_path . $index_file);
	
	
	/*
	$file = fopen("debug.txt", "a+");
	fwrite($file, $tracking."\n");
	fclose($file);
	*/
}

