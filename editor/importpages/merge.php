<?php

require_once("../../config.php");

require( "../../" . $xerte_toolkits_site->php_library_path . "screen_size_library.php" );
require( "../../" . $xerte_toolkits_site->php_library_path . "template_status.php" );
require( "../../" . $xerte_toolkits_site->php_library_path . "display_library.php" );

require( "../../" . $xerte_toolkits_site->php_library_path . "xmlInspector.php" );

function merge_pages_to_project($source_project_id, $source_pages, $target_project, $target_page_location, $merge_glossary, $overwrite_glossary)
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
	$xmlSourceInspector = new XerteXMLInspector();
	$xmlSourceInspector->loadTemplateXML($source_file);

	$nodes = array();
	$i = 0;

	$filemapping = getFileMapping($source_folder . "/media", $target_folder . "/media");
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
        if ($overwrite_glossary === "false") {
            if ($orig_glossary != "") {
                $orig_glossary .= "||";
            }
            $orig_glossary .= $str_glossary;
        } else {
            if ($orig_glossary === "") {
                $orig_glossary .= $str_glossary;
            } else {
                $orig_gloss_array = glossaryToArray($orig_glossary);
                $str_gloss_array = glossaryToArray($str_glossary);
                $doubles = array_uintersect($orig_gloss_array, $str_gloss_array, 'compareTerms');
                foreach ($doubles as $key => $var){
                    unset($orig_gloss_array[$key]);
                }
                $orig_glossary = arrayToGlossary($orig_gloss_array);
                $orig_glossary .= "||";
                $orig_glossary .= $str_glossary;
            }

        }
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
			array_push($bannedLinkIDs, $newId);
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
        $nodeXmlStr = doFileMapping($nodeXmlStr, $filemapping, $filesToCopy, $page, $xmlSourceInspector);
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
	_debug("Merged xml: '" . print_r($xml, true) . "'");
	echo $xml;


}
//converts a glossary to an array.
function glossaryToArray($glossary){
    $glosArray = array();
    $rows = explode('||', $glossary);
    foreach ($rows as $key => $row){
        $glosArray[$key] = explode('|', $row);
    }
    return $glosArray;
}
//returns the indexes of all terms in source that are also in target
function compareTerms($source, $target){
    return strcmp($source[0], $target[0]);
}
//converts an array to a glossary
function arrayToGlossary($inputArray) {
    $glossary = "";
    foreach ($inputArray as $row) {
        $glossary .= $row[0] . "|" . $row[1] . "||";
    }
    return substr($glossary, 0, -2);
}

function getFileMapping($source_media_folder, $target_media_folder)
{
    $source_files = recursive_scanDir($source_media_folder);
    $target_files = recursive_scanDir($target_media_folder);

    $mappings = array();
    foreach($source_files as $file)
    {
        if ($file[0] != ".") {
            if (in_array($file, $target_files)) {
                $new_file = $file;
                while (in_array($new_file, $target_files) || in_array($new_file, $mappings) || isset($files[$new_file])) {

                    $new_filepath_parts = explode('/', $new_file);
                    $new_file_parts = explode("-", end($new_filepath_parts));

                    array_pop($new_filepath_parts);
                    $temp_filepath = implode('/', $new_filepath_parts);

                    if (is_numeric($new_file_parts[0])) {
                        $new_file_parts[0]++;
                        $new_file = ($temp_filepath == "") ? implode("-", $new_file_parts) :  $temp_filepath . "/" . implode("-", $new_file_parts);
                    } else {
                        $new_file = ($temp_filepath == "") ? "1-" . implode("-", $new_file_parts) : $temp_filepath . "/" . "1-" . implode("-", $new_file_parts);
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

function recursive_scanDir($dir){
    $result = [];
    foreach(scandir($dir) as $filename) {
        if ($filename[0] === '.') continue;
        $filePath = $dir . '/' . $filename;
        if (is_dir($filePath)) {
            foreach (recursive_scanDir($filePath) as $childFilename) {
                $result[] = $filename . "/" . $childFilename;
            }
        } else {
            $result[] = $filename;
        }
    }
    return $result;
}

function doFileMapping($str, $filemapping, &$fileToCopy, $page=null, $xmlSourceInspector=null)
{
    foreach ($filemapping as $file => $mapping) {
        if ($page !== null) {
            $found = $xmlSourceInspector->fileIsUsed($file, $page);
        }
        else {
            $pos = strpos($str, 'media/' . $file);
            $found = $pos !== false;
        }
        if ($found)
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
        copy_and_make_dir($source_media_folder . $file, $target_media_folder . $filemapping[$file]);
    }
}

function copy_and_make_dir($s1, $s2) {
    $path = pathinfo($s2);
    if (!file_exists($path['dirname'])) {
        mkdir($path['dirname'], 0777, true);
    }
    if (!copy($s1, $s2)) {
        echo "copy failed \n";
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
		$count = count($root->childNodes);
		if($count == 0)
		{
			$root->appendChild($node);
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


$source_project = x_clean_input($_REQUEST["source_project"], 'numeric');
$source_pages = explode(",", x_clean_input($_REQUEST["source_pages"]));
if($_REQUEST["source_pages"] == "")
{
	$source_pages = array();
}
else
{
    foreach ($source_pages as $page) {
        if (!is_numeric($page)) {
            die("Invalid page number");
        }
    }
}
$target_project = x_clean_input($_REQUEST["target_project"], 'numeric');
$target_insert_page_position = x_clean_input($_REQUEST["target_page_position"], 'numeric');
$merge_glossary= x_clean_input($_REQUEST["merge_glossary"]);
$overwrite_glossary = x_clean_input($_REQUEST["overwrite_glossary"]);
merge_pages_to_project($source_project, $source_pages, $target_project, $target_insert_page_position, $merge_glossary, $overwrite_glossary);

