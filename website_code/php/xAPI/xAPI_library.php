<?php

function xAPI_html_page_create($name, $type, $rlo_file, $lo_name, $language) {

	global $xerte_toolkits_site, $dir_path, $delete_file_array, $zipfile;
	
	$tracking = $name . "\n";
	$tracking.= $type . "\n";
	$tracking.= $rlo_file . "\n";
	$tracking.= $lo_name . "\n";
	$tracking.= $language . "\n";

	
	$scorm_html_page_content = $tracking;//str_replace("%TRACKING_SUPPORT%", $tracking, $scorm_html_page_content);

		
	$file_handle = fopen($dir_path . "index.htm", 'w');
	
	fwrite($file_handle, $scorm_html_page_content, strlen($scorm_html_page_content));
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