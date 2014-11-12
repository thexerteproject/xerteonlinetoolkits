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
	
	if(file_exists($xerte_toolkits_site->root_file_path . "modules/" . $_POST['name'] . "/templates/")){
	
		$dir = opendir($xerte_toolkits_site->root_file_path . "modules/" . $_POST['name'] . "/templates/");
		
		while($template = readdir($dir)){
		
			if($template!="."&&$template!=".."){
					
				$data = file_get_contents($xerte_toolkits_site->root_file_path . "modules/" . $_POST['name'] . "/templates/" . $template . "/" . $template . ".info");	
				
				$info = explode("\n",$data);
				
				$template_object = array();
				$template_name = array();
				
				while($attribute = array_pop($info)){
				
					$attr_data = explode(":",$attribute);
					
					$template_object['name'] = trim($inner_folder); 
					$template_name['name'] = trim($inner_folder);
					
					switch(trim(strtolower($attr_data[0]))){
					
						case "display name" : $template_object['display_name'] = trim($attr_data[1]); break;
						case "description" : $template_object['description'] = trim($attr_data[1]); break;
						case "requires" : $template_object['requires'] = trim($attr_data[1]); break;
					
					}
				
				}
				
				if(isset($template_object['requires'])){
				
					$row = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails where template_framework=?", array($template_object['requires']));
				
					if(isset($row)){
					
						$continue = true;
					
					}else{
					
						$continue = false;
					
					}
				
				}else{
				
					$continue = true;
				
				}
				
				if($continue){
				
					$row = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails where template_framework=? and template_name=?", array($_POST['name'], $template));
					
					if(isset($row)){
					
						if(is_array($row)){
					
							db_query("update {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails set display_name=?, description=?, access_rights=?, active=? where template_type_id=?", array($template_object['display_name'],$template_object['description'], $row['template_type_id'], "*", 1));
							echo "<p>" . $_POST['name'] . "/" . $template . " " . EXTEND_MODULE_UPDATE . "</p>";
						
						}
					
					}else{
						
						db_query("insert into {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails (template_framework,template_name,display_name,description,date_uploaded,access_rights,active)values(?,?,?,?,?,?,?)", array($_POST['name'], $template,$template_object['display_name'],$template_object['description'],date("Y-m-d",time()),"*",1));
						echo "<p>" . $_POST['name'] . "/" . $template . " " . EXTEND_MODULE_INSTALL . "</p>";
					
					}
					
				}else{
				
					echo "<p>" . $_POST['name'] . "/" . $template . " <span style='color:#f00'>" . EXTEND_MODULE_REQUIRES . "</span> <strong>" . $template_object['requires'] . "</strong></p>";
				
				}
				
			}
			
		}
	
	}
	
	echo "<p><a onclick='list_modules(\"" . str_replace("XOT-","",$_POST['name']) . "\")'>" . EXTEND_LIST . "</a></p>";
	
}

?>