<?php 

/**
 * 
 * module functions page, shared functions for this module
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once(dirname(__FILE__) . '/../../config.php');

/**
 * 
 * Function dont_show_template
 * This function outputs the HTML for people have no rights to this template
 * @version 1.0
 * @author Patrick Lockley
 */

function dont_show_template(){


    _load_language_file("/modules/xerte/module_functions.inc");

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <script src="modules/Xerte/javascript/swfobject.js"></script>
    <script src="website_code/scripts/opencloseedit.js"></script>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
    <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
    </head>

    <body>

    <div style="margin:0 auto; width:800px">
    <div class="edit_topbar" style="width:800px">
        <img src="website_code/images/edit_xerteLogo.jpg" style="margin-left:10px; float:left" />
        <img src="website_code/images/edit_UofNLogo.jpg" style="margin-right:10px; float:right" />
    </div>	
    <div style="margin:0 auto">
<?PHP

    echo XERTE_DISPLAY_FAIL;

    ?></div></div></body></html><?PHP

}

	function make_ncx($title, $parts, $path){
	
		$file = '<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
	<head>
		<meta name="dtb:totalPageCount" content="0"/>
		<meta name="dtb:maxPageNumber" content="0"/>
	</head>
	<docTitle>
		<text>' . $title . '</text>
	</docTitle>
	<navMap>';
	
		for($x=0;$x<count($parts);$x++){
		
			$file .= '<navPoint id="navPoint-' . ($x+1) . '" playOrder="' . ($x+1) . '">
			<navLabel>';
			
			$file .= '<text>' . str_replace(".html","",substr($parts[$x], strpos($parts[$x], "-")+1)) . '</text>';
						
			$file .='</navLabel>
			<content src="' . $parts[$x] . '"/>
		</navPoint>';
		
		}
		
		$file .= "</navMap>
</ncx>";

		file_put_contents($path . "toc.ncx", $file);
		
	}
	
	function make_opf($title, $parts, $path){
	
		$file = '<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="dcidid" version="2.0">
	<metadata xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
		<dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">' . $title . '</dc:title>
		<dc:language xmlns:dc="http://purl.org/dc/elements/1.1/" xsi:type="dcterms:RFC3066">eng</dc:language>
		<dc:identifier xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf" id="dcidid" opf:scheme="URI">' . $title . '</dc:identifier>
	</metadata>';
	
		$manifest = '<manifest>
						<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>';
		$spine = '<spine toc="ncx">';
		$guide = '<guide>';
		
		for($x=0;$x<count($parts);$x++){
		
			$spine .= '<itemref idref="section' . ($x+1) . '" linear="yes"/>';
			$guide .= '<reference type="text" href="' . $parts[$x] . '" title="' . str_replace(".html","",substr($parts[$x], strpos($parts[$x], "-")+1)) . '"/>';
			$manifest .= '<item href="' . $parts[$x] . '" media-type="application/xhtml+xml" id="section' . ($x+1) . '"/>';
		
		}
		
		$manifest .= "</manifest>";
		$spine .= "</spine>";
		$guide .= "</guide>";	

		file_put_contents($path . "content.opf", $file . $manifest . $spine . $guide . '</package>');
	
	}
	
	function Zip($source, $destination)
	{
		if (!extension_loaded('zip') || !file_exists($source)) {
			return false;
		}

		$zip = new ZipArchive();
		if (!$zip->open($destination, ZIPARCHIVE::CREATE)) {
			return false;
		}

		$source = str_replace('\\', '/', realpath($source));

		if (is_dir($source) === true)
		{
			$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($source), RecursiveIteratorIterator::SELF_FIRST);

			foreach ($files as $file)
			{
				$file = str_replace('\\', '/', realpath($file));

				if (is_dir($file) === true)
				{
					$zip->addEmptyDir(str_replace($source . '/', '', $file . '/'));
				}
				else if (is_file($file) === true)
				{
					$zip->addFromString(str_replace($source . '/', '', $file), file_get_contents($file));
				}
			}
		}
		else if (is_file($source) === true)
		{
			$zip->addFromString(basename($source), file_get_contents($source));
		}

		return $zip->close();
	}

?>
