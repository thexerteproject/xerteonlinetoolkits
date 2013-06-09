<?php
require_once("../../../config.php");

require("../user_library.php");

if(is_user_admin()){

	_load_language_file("/extend.inc");

	$url = "https://api.github.com/legacy/repos/search/XOT";
		
	// set URL and other appropriate options
	$ch = curl_init();
	$vers = curl_version();
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_USERAGENT, 'curl/' . $vers['version'] );
	
	curl_setopt($ch, CURLOPT_URL, $url);
	
	// grab URL and pass it to the browser
	$data = curl_exec($ch);
	
	$data = json_decode($data);
	
	foreach($data->repositories as $key => $plugin){
	
		if(strpos($plugin->name, "XOT-")!==FALSE){
		
			echo "<div>";
			
			echo "<h2>" . $plugin->name . "</h2>";
			echo "<p>" . $plugin->description . "</p>";
			
			$created = explode("T", $plugin->created);
			
			echo "<p><span>" . EXTEND_AUTHOR . " : " . $plugin->owner . "</span> | <span>" . EXTEND_CREATED . " : " . $created[0] . "</span> | <span>" . EXTEND_SIZE . " : " . $plugin->size . "</span>  | <span><a href='" . $plugin->url . "'>" . EXTEND_VISIT . "</a></span></p>";
			
			if(file_exists($xerte_toolkits_site->root_file_path . "modules/" . str_replace("XOT-","",$plugin->name))){
			
				echo "<p>" . EXTEND_ALREADY . "</p>";
				echo "<button onclick='get_module(\"" . $plugin->url  . "\", \"" . $plugin->name . "\")'>" . EXTEND_UPGRADE . "</button>";
			
			}else{
			
				echo "<button onclick='get_module(\"" . $plugin->url  . "\", \"" . $plugin->name . "\")'>" . EXTEND_INSTALL . "</button>";
			
			}
			
			echo "</div>";
		
		}
	
	}

}
