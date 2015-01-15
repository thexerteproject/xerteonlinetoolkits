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
require_once("../../../config.php");

require("../user_library.php");

if(is_user_admin()){

	_load_language_file("/extend.inc");

	$url = str_replace("github","codeload.github",$_POST['url']) . "/zip/master";
	
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
	
	$file = $xerte_toolkits_site->import_path . time() . ".zip";
	
	file_put_contents($file, $data);
	
	$zip = new ZipArchive();
	
	$data = $zip->open($file);
	
	$extract_files = array();
	$language_files = array();
	
	for($i = 0; $i < $zip->numFiles; $i++) {
	
		if(strpos($zip->getNameIndex($i),"/languagesXOT/")){
		
			$zip->renameIndex($i,str_replace($_POST['name'] . "-master/","",$zip->getNameIndex($i)));
			
			$name = explode("/", $zip->getNameIndex($i));
			
			$zip->renameIndex($i,$name[2] . "/modules/" . $name[0] . "/" . $name[3]);
			
			array_push($language_files, $zip->getNameIndex($i));
		
		}else{
		
			$zip->renameIndex($i,str_replace($_POST['name'] . "-master/","",$zip->getNameIndex($i)));
			array_push($extract_files, $zip->getNameIndex($i));
		
		}
	
	}
	
	array_shift($language_files);
	
	array_shift($extract_files);
	
	$zip->extractTo($xerte_toolkits_site->root_file_path . "modules/" , $extract_files);
	$zip->extractTo($xerte_toolkits_site->root_file_path . "languages/" , $language_files);
	
	echo "<p>" . $_POST['name'] . "  " . EXTEND_INSTALLED . " : <a onclick='module_activate(\"" . str_replace("XOT-","",$_POST['name']) . "\")'>" . EXTEND_ACTIVATE . "</a></p>";
	echo "<p><a onclick='list_modules(\"" . str_replace("XOT-","",$_POST['name']) . "\")'>" . EXTEND_LIST . "</a></p>";
	
}

?>