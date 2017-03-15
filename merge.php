<?php

require_once("config.php");

require $xerte_toolkits_site->php_library_path . "screen_size_library.php";
require $xerte_toolkits_site->php_library_path . "template_status.php";
require $xerte_toolkits_site->php_library_path . "display_library.php";
require $xerte_toolkits_site->php_library_path . "user_library.php";


	
function merge_pages_to_project($source_project_id, $source_pages, $target_project, $target_page_location)
{
	global $xerte_toolkits_site;
	
	
	$query = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}templatedetails WHERE template_id = ?";
	$source_row = db_query_one($query, array($source_project_id));
	
	$target_row = db_query_one($query, array($target_project));
	$query = "SELECT username FROM {$xerte_toolkits_site->database_table_prefix}logindetails WHERE login_id = ?";
	$source_user = db_query_one($query, array($source_row["creator_id"]));
	$target_user = db_query_one($query, array($target_row["creator_id"]));
	$query = "SELECT template_name FROM {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails WHERE template_type_id = ?";
	$source_template_name = db_query_one($query, array($source_row["template_type_id"]));
	$target_template_name = db_query_one($query, array($target_row["template_type_id"]));
	
	$source_folder = $xerte_toolkits_site->users_file_area_full . $source_row['template_id'] . "-" . $source_user['username'] . "-" . $source_template_name['template_name'];
	$target_folder = $xerte_toolkits_site->users_file_area_full . $target_row['template_id'] . "-" . $target_user['username'] . "-" . $target_template_name['template_name'];
	
	$source_file = $source_folder . "/data.xml";
	$target_file = $target_folder . "/data.xml";
	
	$source_xml = simplexml_load_file($source_file);
	$target_xml = simplexml_load_file($target_file);
	
	$xmlTarget = new DOMDocument();
	$xmlTarget->load($target_file);
	$xmlSource = new DOMDocument();
	$xmlSource->load($source_file);
	$nodes = array();
	$i = 0;
	
	foreach($source_pages as $page)
	{

			$root = $xmlTarget->getElementsByTagName("learningObject")->item(0);
			
			$node = $xmlSource->getElementsByTagName("learningObject")->item(0)->childNodes->item($page);
			
			$node = $xmlTarget->importNode($node, true);
			
			addNode($target_page_location + $i, $node, $root);
			$i++;
			

	}
	$xmlTarget->save($target_folder . "/preview.xml");
	$xmlTarget->save($target_file);

	$xml = $xmlTarget->saveXML();
	file_put_contents($target_folder . "/data.json.1", json_decode($xml));
	file_put_contents($target_folder . "/preview.json.1", json_decode($xml));
	

}

function addNode($index, $node, $root)
{
		$count = count($root);
		if($count == 0)
		{
			echo "First";
			$root->appendChild($node);
			echo "Last";
		}
		if($index == 0)
		{
			$root->insertBefore($node, $root->childNodes->item(0));
		}else if($index == $count)
		{		
			$root->appendChild($node);
		}
		else{
			$item = $root->childNodes->item($index+1);
			$root->insertBefore($node, $item);
		}
}

$source_project = $_GET["source_project"];
$source_pages = explode(",", $_GET["source_pages"]);
$target_project = $_GET["target_project"];
$target_insert_page_position = $_GET["target_page_position"];
merge_pages_to_project($source_project, $source_pages, $target_project, $target_insert_page_position);
	


?>