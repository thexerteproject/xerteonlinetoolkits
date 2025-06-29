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
require_once(dirname(__FILE__) . "/../config/popcorn.php");

function get_logo_file($LO_icon_path, $theme_path, $template_path) {
	$extensions = ['svg',  'png', 'jpg', 'gif'];

	// First the author logo
	if (strlen(trim($LO_icon_path)) > 0) {
		return '../../../' . trim($LO_icon_path);
	}

	// Secondly check the theme logo
	//return $theme_path . '/logo.svg';
	foreach($extensions as $ext) {
		if (file_exists('../../../' . $theme_path . '/logo.' . $ext)) {
			return '../../../' . $theme_path . '/logo.'. $ext;
		}
	}

	// Lastly check the default location
	foreach($extensions as $ext) {
		if (file_exists('../../../' . $template_path . 'common_html5/logo.' . $ext)) {
			return '../../../' . $template_path . 'common_html5/logo.' . $ext;
		}
	}

	return;
}

function lmsmanifest_2004_create($name, $flash, $lo_name){

	global $dir_path, $delete_file_array, $zipfile;

	$scorm_top_string = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><manifest xmlns=\"http://www.imsglobal.org/xsd/imscp_v1p1\" xmlns:imsmd=\"http://ltsc.ieee.org/xsd/LOM\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:adlcp=\"http://www.adlnet.org/xsd/adlcp_v1p3\" xmlns:imsss=\"http://www.imsglobal.org/xsd/imsss\" xmlns:adlseq=\"http://www.adlnet.org/xsd/adlseq_v1p3\" xmlns:adlnav=\"http://www.adlnet.org/xsd/adlnav_v1p3\" identifier=\"MANIFEST-3C3E9123-F054-FA69-591D-D7B6F59A1660\" xsi:schemaLocation=\"http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd http://ltsc.ieee.org/xsd/LOM lom.xsd http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd\"><metadata><schema>ADL SCORM</schema><schemaversion>2004 3rd Edition</schemaversion></metadata>";


	$strID = time();

	$scorm_personalise_string = "";
	$scorm_personalise_string .= "<organizations default=\"" . "XERTE-ORG-" . $strID . "\">";
	$scorm_personalise_string .= "<organization identifier=\"" . "XERTE-ORG-" . $strID . "\" adlseq:objectivesGlobalToSystem=\"false\" structure=\"hierarchical\">";
	$scorm_personalise_string .= "<title>" . $lo_name . "</title>";
	$scorm_personalise_string .= "<item identifier=\"" . "XERTE-ITEM-" . $strID . "\" identifierref=\"" .  "XERTE-RES-" . $strID . "\" isvisible=\"true\">";
	$scorm_personalise_string .= "<title>" . $lo_name . "</title>";
	$scorm_personalise_string .= "<imsss:sequencing> <imsss:deliveryControls completionSetByContent=\"true\" objectiveSetByContent=\"true\"/> </imsss:sequencing>";
	$scorm_personalise_string .= "</item>";
	$scorm_personalise_string .= "<imsss:sequencing> <imsss:controlMode choice=\"false\" flow=\"true\" /> </imsss:sequencing>";
	$scorm_personalise_string .= "</organization></organizations>";
	$scorm_personalise_string .= "<resources><resource type=\"webcontent\" adlcp:scormType=\"sco\" identifier=\"" .  "XERTE-RES-" . $strID . "\" href=\"scorm2004RLO.htm\"><file href=\"scorm2004RLO.htm\" />";
    if ($flash)
    {
        $scorm_personalise_string .= "<file href=\"MainPreloader.swf\" /><file href=\"XMLEngine.swf\" />";
    }
    $scorm_personalise_string .= "</resource></resources></manifest>";

	$file_handle = fopen($dir_path . "imsmanifest.xml", 'w');

	$buffer = $scorm_top_string . $scorm_personalise_string;

	fwrite($file_handle,$buffer,strlen($buffer));
	fclose($file_handle);

	$zipfile->add_files("imsmanifest.xml");

	array_push($delete_file_array,  $dir_path . "imsmanifest.xml");

}

/**
	 *
	 * Function lmsmanifest_create
 	 * This function creates a scorm manifest
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function lmsmanifest_2004_create_rich($row, $metadata, $users, $flash, $lo_name){

	global $dir_path, $delete_file_array, $zipfile, $xerte_toolkits_site;

	$scorm_top_string = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><manifest xmlns=\"http://www.imsproject.org/xsd/imscp_rootv1p1p2\" xmlns:imsmd=\"http://www.imsglobal.org/xsd/imsmd_rootv1p2p1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:adlcp=\"http://www.adlnet.org/xsd/adlcp_rootv1p2\" identifier=\"MANIFEST-90878C16-EB60-D648-94ED-9651972B5F38\" xsi:schemaLocation=\"http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd\"><metadata><schema>ADL SCORM</schema><schemaversion>2004 3rd Edition</schemaversion>";
	$scorm_top_string .= "<imsmd:lom><imsmd:general><imsmd:identifier><imsmd:catalog>" . $xerte_toolkits_site->site_title . "</imsmd:catalog><imsmd:entry>A180_2</imsmd:entry></imsmd:identifier><imsmd:title><imsmd:langstring xml:lang=\"en-GB\">" . $row['zipname'] . "</imsmd:langstring></imsmd:title><imsmd:language>en-GB</imsmd:language><imsmd:description><imsmd:langstring xml:lang=\"en-GB\">" . $metadata['description'] . "</imsmd:langstring></imsmd:description>";

	$keyword = explode(",",$metadata['keywords']);
	while($word = array_pop($keyword)){
		$scorm_top_string .= "<imsmd:keyword><imsmd:langstring xml:lang=\"en-GB\">" . $word . "</imsmd:langstring></imsmd:keyword>";
	}

	while($user = mysql_fetch_array($users)){
		$scorm_top_string .= "</imsmd:general><imsmd:lifeCycle><imsmd:contribute><imsmd:role><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>author</imsmd:value></imsmd:role><imsmd:entity>" . $user['firstname'] . " " . $user['surname'] . "</imsmd:entity></imsmd:contribute></imsmd:lifeCycle>";
	}

	$scorm_top_string .= "<imsmd:technical><imsmd:format>text/html</imsmd:format><imsmd:location>" . url_return("play", $_GET['template_id']) . "</imsmd:location></imsmd:technical>";
	$scorm_top_string .= "<imsmd:rights><imsmd:copyrightAndOtherRestrictions><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>yes</imsmd:value></imsmd:copyrightAndOtherRestrictions><imsmd:description><imsmd:langstring xml:lang=\"en-GB\">" . $metadata['licenses'] . "<imsmd:langstring xml:lang=\"x-t-cc-url\">" . $metadata['licenses'] . "</imsmd:string></imsmd:description></imsmd:rights>";
	$scorm_top_string .= "</imsmd:lom></metadata>";

	$date = time();

	$scorm_personalise_string = "";
	$scorm_personalise_string .= "<organizations default=\"" . "XERTE-ORG-" . $date . "\">";
	$scorm_personalise_string .= "<organization identifier=\"" . "XERTE-ORG-" . $date . "\" structure=\"hierarchical\">";
	$scorm_personalise_string .= "<title>" . $lo_name . "</title>";
	$scorm_personalise_string .= "<item identifier=\"" . "XERTE-ITEM-" . $date . "\" identifierref=\"" .  "XERTE-RES-" . $date . "\" isvisible=\"true\">";
    $scorm_personalise_string .= "<title>" . $lo_name . "</title>";
	$scorm_bottom_string = "</item></organization></organizations><resources><resource type=\"webcontent\" adlcp:scormType=\"sco\" identifier=\"" .  "XERTE-RES-" . $date . "\" href=\"scormRLO.htm\"><file href=\"scormRLO.htm\" />";
    if ($flash)
    {
        $scorm_bottom_string .= "<file href=\"MainPreloader.swf\" /><file href=\"XMLEngine.swf\" />";
    }
    $scorm_bottom_string .= "</resource></resources></manifest>";

	$file_handle = fopen($dir_path . "imsmanifest.xml", 'w');

	$buffer = $scorm_top_string . $scorm_personalise_string . $scorm_bottom_string;

	fwrite($file_handle,$buffer,strlen($buffer));
	fclose($file_handle);

	$zipfile->add_files("imsmanifest.xml");

	array_push($delete_file_array,  $dir_path . "imsmanifest.xml");

}

/**
*
* Function scorm html page create
* This function creates a customized scorm HTML page for export
* @param string $name - name of the template
* @param string $type - type of template this is
 * @param string $rlo_file - name of the lo file
 * @param string $lo_name - name of the lo
* @version 1.0
* @author Patrick Lockley
*/

function scorm2004_html_page_create($id, $name, $type, $rlo_file, $lo_name, $language){

	global $xerte_toolkits_site, $dir_path, $delete_file_array, $zipfile;

	$scorm_html_page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $type . "/player/rloObject.htm");

	$temp = get_template_screen_size($name,$type);

	$new_temp = explode("~",$temp);

	$scorm_html_page_content = str_replace("%WIDTH%", $new_temp[0],$scorm_html_page_content);
	$scorm_html_page_content = str_replace("%HEIGHT%",$new_temp[1],$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%TITLE%",$lo_name,$scorm_html_page_content);
	$scorm_html_page_content = str_replace("%RLOFILE%",$rlo_file,$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%TEMPLATEID%", $id, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%XMLPATH%","",$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%JSDIR%","",$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%XMLFILE%","template.xml",$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%SITE%",$xerte_toolkits_site->site_url,$scorm_html_page_content);

    $tracking = "<script type=\"text/javascript\" src=\"apiwrapper_2004.3rd.js\"></script>\n";
    $tracking .= "<script type=\"text/javascript\" src=\"xttracking_scorm2004.3rd.js\"></script>\n";
    $tracking .= "<script type=\"text/javascript\" src=\"languages/js/en-GB/xttracking_scorm2004.3rd.js\"></script>\n";
    if (file_exists($dir_path . "languages/js/" . $language . "/xttracking_scorm2004.3rd.js"))
    {
        $tracking .= "<script type=\"text/javascript\" src=\"languages/js/" . $language . "/xttracking_scorm2004.3rd.js\"></script>";
    }
	$scorm_html_page_content = str_replace("%TRACKING_SUPPORT%",$tracking,$scorm_html_page_content);
	$scorm_html_page_content = str_replace("%EMBED_SUPPORT%", "",$scorm_html_page_content);

    $file_handle = fopen($dir_path . "scorm2004RLO.htm", 'w');

	fwrite($file_handle,$scorm_html_page_content,strlen($scorm_html_page_content));
	fclose($file_handle);

    $zipfile->add_files("scorm2004RLO.htm");

    array_push($delete_file_array,  $dir_path . "scorm2004RLO.htm");

}

function scorm2004_html5_page_create($id, $type, $parent_name, $lo_name, $language, $date_modified, $date_created, $need_download_url=false, $logo='', $plugins=''){

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
	$template_path = $xerte_toolkits_site->basic_template_path . $type . '/parent_templates/' . $parent_name . "/";


	$scorm_html_page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $type . "/player_html5/rloObject.htm");

	$scorm_html_page_content = str_replace("%LANGUAGE%", $language_ISO639_1code, $scorm_html_page_content);
	$scorm_html_page_content = str_replace("%VERSION%", $version , $scorm_html_page_content);
	$scorm_html_page_content = str_replace("%TWITTERCARD%", "",$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%VERSION_PARAM%", "" , $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%TITLE%",$lo_name,$scorm_html_page_content);
	$scorm_html_page_content = str_replace("%LOGO%", $logo, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%TEMPLATEID%", $id, $scorm_html_page_content);
    $scorm_html_page_content = str_replace("%TEMPLATEPATH%","",$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%XMLPATH%","",$scorm_html_page_content);
    $scorm_html_page_content = str_replace("%XMLFILE%","template.xml",$scorm_html_page_content);
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
	$popcorn_config = popcorn_config($template_path . $common_folder . '/', $version, $common_folder . '/');
	$scorm_html_page_content = str_replace("%POPCORN_CONFIG%", $popcorn_config, $scorm_html_page_content);


	$tracking = "<script type=\"text/javascript\" src=\"apiwrapper_2004.3rd.js?version=" . $version . "\"></script>\n";
    $tracking .= "<script type=\"text/javascript\" src=\"xttracking_scorm2004.3rd.js?version=" . $version . "\"></script>\n";
    $tracking .= "<script type=\"text/javascript\" src=\"languages/js/en-GB/xttracking_scorm2004.3rd.js?version=" . $version . "\"></script>\n";
    if (file_exists($dir_path . "languages/js/" . $language . "/xttracking_scorm2004.3rd.js"))
    {
        $tracking .= "<script type=\"text/javascript\" src=\"languages/js/" . $language . "/xttracking_scorm2004.3rd.js\"></script>\n";
    }
    if ($need_download_url) $tracking .= "   <script type=\"text/javascript\">var x_downloadURL = \"" . $xerte_toolkits_site->site_url . "download.php\";</script>\n";

    $scorm_html_page_content = str_replace("%TRACKING_SUPPORT%",$tracking,$scorm_html_page_content);
	$scorm_html_page_content = str_replace("%EMBED_SUPPORT%","",$scorm_html_page_content);
	$scorm_html_page_content = str_replace("%YOUTUBEAPIKEY%", $youtube_api_key, $scorm_html_page_content);

    $file_handle = fopen($dir_path . "scorm2004RLO.htm", 'w');

    fwrite($file_handle,$scorm_html_page_content,strlen($scorm_html_page_content));
    fclose($file_handle);

    $zipfile->add_files("scorm2004RLO.htm");

    array_push($delete_file_array,  $dir_path . "scorm2004RLO.htm");

}
?>
