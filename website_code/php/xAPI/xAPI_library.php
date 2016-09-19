<?php

function xAPI_html_page_create($name, $type, $rlo_file, $lo_name, $language) {

global $xerte_toolkits_site, $dir_path, $delete_file_array, $zipfile, $youtube_api_key;

	$version = file_get_contents(dirname(__FILE__) . "/../../../version.txt");

	$xapi_html_page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $type . "/player_html5/rloObject.htm");

	$xapi_html_page_content = str_replace("%VERSION%", $version , $xapi_html_page_content);
    $xapi_html_page_content = str_replace("%TITLE%",$lo_name,$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%TEMPLATEPATH%","",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%XMLPATH%","",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%XMLFILE%","template.xml",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%THEMEPATH%", "themes/" . $template_name . "/",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%OFFLINESCRIPTS%", "",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%OFFLINEINCLUDES%", "",$xapi_html_page_content);
    $xapi_html_page_content = str_replace("%MATHJAXPATH%", "//cdn.mathjax.org/mathjax/latest/", $xapi_html_page_content);
	
	
	$tracking = "<script type=\"text/javascript\" src=\"xttracking_xapi.js\"></script>\n";
	$tracking .= "<script type=\"text/javascript\" src=\"languages/js/en-GB/xttracking_xapi.js\"></script>\n";
	$tracking .= "<script type=\"text/javascript\" src=\"tincan.js\"></script>\n";
	if (file_exists($dir_path . "languages/js/" . $language . "/xttracking_xapi.js") && $language != "en-GB")
	{
		$tracking .= "<script type=\"text/javascript\" src=\"languages/js/" . $language . "/xttracking_xapi.js\"></script>";
	}
	$xapi_html_page_content = str_replace("%TRACKING_SUPPORT%",$tracking,$xapi_html_page_content);
	$xapi_html_page_content = str_replace("%YOUTUBEAPIKEY%", $youtube_api_key, $xapi_html_page_content);
	

	$file_handle = fopen($dir_path . "index.htm", 'w');
	
	fwrite($file_handle,$xapi_html_page_content,strlen($xapi_html_page_content));
	fclose($file_handle);
	
	$zipfile->add_files("index.htm");
	
	array_push($delete_file_array,  $dir_path . "index.htm");
	
	
	/*
	$file = fopen("debug.txt", "a+");
	fwrite($file, $tracking."\n");
	fclose($file);
	*/
}

?>