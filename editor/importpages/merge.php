<?php

require_once("../../config.php");

require( "../../" . $xerte_toolkits_site->php_library_path . "screen_size_library.php" );
require( "../../" . $xerte_toolkits_site->php_library_path . "template_status.php" );
require( "../../" . $xerte_toolkits_site->php_library_path . "display_library.php" );
require( "../../" . $xerte_toolkits_site->php_library_path . "user_library.php" );

function merge_pages_to_project($source_project_id, $source_pages, $target_project, $target_page_location, $merge_glossary)
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
	$target_file = $target_folder . "/preview.xml";
	
	$xmlTarget = new DOMDocument();
	$xmlTarget->load($target_file);
	$xmlSource = new DOMDocument();
	$xmlSource->load($source_file);
	$nodes = array();
	$i = 0;

	$filemapping = getFileMapping($source_folder . "/media/", $target_folder . "/media/");
    $filesToCopy = array();

	if($merge_glossary === "true")
	{
		$str_glossary = $xmlSource->documentElement->getAttribute("glossary");
		$str_glossary = doFileMapping($str_glossary, $filemapping, $filesToCopy);

		$orig_glossary = "";
		if($xmlTarget->documentElement->hasAttribute("glossary"))
		{
			$orig_glossary = $xmlTarget->documentElement->getAttribute("glossary");
		}
		if($orig_glossary != "")
		{
			$orig_glossary .= "||";
		}
		$orig_glossary .= $str_glossary;
		$xmlTarget->documentElement->setAttribute("glossary", $orig_glossary);
	}
	$bannedLinkIDs = array();
	$xBannedPaths = new DOMXPath($xmlTarget);
	$bannedLinkIDsPath = $xBannedPaths->query("*[@linkID]");
	foreach($bannedLinkIDsPath as $id)
	{
		$attr = $id->getAttribute("linkID");
		if(!in_array($attr, $bannedLinkIDs)){
			array_push($bannedLinkIDs, $attr);
		}
	}
	
	$newlinkIDs = array();
	$xPath = new DOMXPath($xmlSource);
	$linkIDs = $xPath->evaluate("*[@linkID]");
	foreach($linkIDs as $id)
	{
		$attr = $id->getAttribute("linkID");
		if(!in_array($attr, $newlinkIDs)){
			array_push($newlinkIDs, $attr);
		}
	}
	$mapping = array();
	foreach($newlinkIDs as $newId)
	{
		$oldId = $newId;
		if(in_array($newId, $bannedLinkIDs))
		{
			while(in_array($newId, $bannedLinkIDs) || in_array($newId, $newlinkIDs))
			{
				$newId = "PG" . (substr($newId, 2)+1);
			}
			array_push($newId, $bannedLinkIDs);
			$mapping[$oldId] = $newId;
				
		}else{
			$mapping[$newId] = $newId;
		}
	}
	foreach($linkIDs as $id)
	{
		
		$attr = $id->getAttribute("linkID");
		
		$id->setAttribute("linkID", $mapping[$attr]);
		$xmlSource = $id->ownerDocument;	
	}
	//copyMediaFolder($xmlSource, $source_folder . "/media/", $xmlTarget, $target_folder . "/media/", $source_pages);

	foreach($source_pages as $page)
	{
        $root = $xmlTarget->documentElement;

        $node = $xmlSource->documentElement->childNodes->item($page);

        // Convert to text, do filemapping, go back to xml
        $nodeXmlStr = $xmlSource->saveXML($node);
        $nodeXmlStr = doFileMapping($nodeXmlStr, $filemapping, $filesToCopy);
        $fragment = $xmlTarget->createDocumentFragment();
        $fragment->appendXml($nodeXmlStr);

        //$node = $xmlTarget->importNode($node, true);
        //addNode($target_page_location + $i, $node, $root);

        addNode($target_page_location + $i, $fragment, $root);
        $i++;
	}

	copyMediaFiles($source_folder . "/media/", $target_folder . "/media/", $filemapping, $filesToCopy);

	$xmlTarget->save($target_file);

	$xml = $xmlTarget->saveXML();
	echo $xml;


}

function getFileMapping($source_media_folder, $target_media_folder)
{
    $source_files = scandir($source_media_folder);
    $target_files = scandir($target_media_folder);

    $mappings = array();
    foreach($source_files as $file)
    {
        if ($file[0] != ".") {
            if (in_array($file, $target_files)) {
                $new_file = $file;
                while (in_array($new_file, $target_files) || in_array($new_file, $mappings) || isset($files[$new_file])) {
                    $new_file_parts = explode("-", $new_file);
                    if (is_numeric($new_file_parts[0])) {
                        $new_file_parts[0]++;
                        $new_file = implode("-", $new_file_parts);
                    } else {
                        $new_file = "1-" . $new_file;
                    }
                }
                $mappings[$file] = $new_file;

            } else {
                $mappings[$file] = $file;
            }
        }
    }

    return $mappings;
}

function doFileMapping($str, $filemapping, &$fileToCopy)
{
    foreach ($filemapping as $file => $mapping) {
        $pos = strpos($str, 'media/' . $file);
        if ($pos !== false)
        {
            array_push($fileToCopy, $file);
            $str = str_replace('media/' . $file, 'media/' . $mapping, $str);
        }
    }

    return $str;
}

function copyMediaFiles($source_media_folder, $target_media_folder, $filemapping, $files)
{
    foreach($files as $file)
    {
        copy($source_media_folder . $file, $target_media_folder . $filemapping[$file]);
    }
}

function indexOf($nodes, $node)
{
	$index = 0;
	foreach($nodes as $x)
	{
		if($x === $node)
		{
			return $index;
		}
		$index++;
	}
	return -1;
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


$source_project = $_REQUEST["source_project"];
$source_pages = explode(",", $_REQUEST["source_pages"]);
if($_REQUEST["source_pages"] == "")
{
	$source_pages = array();
}
$target_project = $_REQUEST["target_project"];
$target_insert_page_position = $_REQUEST["target_page_position"];
$merge_glossary= $_REQUEST["merge_glossary"];
merge_pages_to_project($source_project, $source_pages, $target_project, $target_insert_page_position, $merge_glossary);


?>