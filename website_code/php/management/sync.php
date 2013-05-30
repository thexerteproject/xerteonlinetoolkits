<?php

require_once("../../../config.php");

_load_language_file("/website_code/php/management/sync.inc");

require("../user_library.php");
require("management_library.php");

if(is_user_admin()){

	$dir = opendir($xerte_toolkits_site->root_file_path . "modules/");
	
	while($folder = readdir($dir)){
	
		if($folder!="."&&$folder!=".."){
			
			$inner_dir = opendir($xerte_toolkits_site->root_file_path . "modules/" . $folder . "/templates");
			
			while($inner_folder = readdir($inner_dir)){
	
				if($inner_folder!="."&&$inner_folder!=".."){
					
					if(file_exists($xerte_toolkits_site->root_file_path . "modules/" . $folder . "/templates/" . $inner_folder . "/" . $inner_folder . ".info")){
					
						$data = file_get_contents($xerte_toolkits_site->root_file_path . "modules/" . $folder . "/templates/" . $inner_folder . "/" . $inner_folder . ".info");	
						
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
						
							$row = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails where template_framework=? and template_name=?", array($folder, $inner_folder));
							
							if(isset($row)){
							
								if(is_array($row)){
							
									db_query("update {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails set display_name=?, description=? where template_type_id=?", array($template_object['display_name'],$template_object['description'], $row['template_type_id']));
									echo "<p>" . $folder . " / " . $inner_folder . " " . SYNC_UPDATE . "</p>";
								
								}
							
							}else{
								
								db_query("insert into {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails (template_framework,template_name,display_name,description,date_uploaded)values(?,?,?,?,?)", array($folder, $inner_folder,$template_object['display_name'],$template_object['description'],date("Y-m-d",time())));
								echo "<p>" . $folder . " / " . $inner_folder . " " . SYNC_INSTALL . "</p>";
							
							}
							
						}else{
						
							echo "<p>" . $folder . " / " . $inner_folder . " <span style='color:#f00'>" . SYNC_REQUIRES . "</span> <strong>" . $template_object['requires'] . "</strong></p>";
						
						}
						
					}
				
				}
				
			}
			
		}
	
	}

	echo "<p>" . SYNC_RETURN . "</p>";

}else{

    management_fail();

}

?>
