<?php
/**
 * allows the site to edit a simile module
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */


function output_editor_code($row_edit, $xerte_toolkits_site, $read_status, $version_control){

    require_once("config.php");
    require_once("website_code/php/url_library.php");

    _load_language_file("/modules/simile/edit.inc");

    $row_username = db_query_one("select username from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?" , array($row_edit['user_id']));

    if(empty($row_username)) {
        die("Invalid user id ?");
    }

?>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
		<script type="text/javascript" src="modules/epub/tinymce/tiny_mce.js"></script>
		<script type="text/javascript">
			tinyMCE.init({
				// General options
				mode : "textareas",
				theme : "advanced",
				plugins : "autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,wordcount,advlist,autosave,visualblocks",

				// Theme options
				theme_advanced_buttons1 : "save,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,styleselect,formatselect,fontselect,fontsizeselect",
				theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor",
				theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen",
				theme_advanced_buttons4 : "insertlayer,moveforward,movebackward,absolute,|,styleprops,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,pagebreak,restoredraft,visualblocks",
				theme_advanced_toolbar_location : "top",
				theme_advanced_toolbar_align : "left",
				theme_advanced_statusbar_location : "bottom",
				theme_advanced_resizing : true,

				// Example content CSS (should be your site CSS)
				//content_css : "css/content.css",

				// Drop lists for link/image/media/template dialogs
				template_external_list_url : "lists/template_list.js",
				external_link_list_url : "lists/link_list.js",
				external_image_list_url : "lists/image_list.js",
				media_external_list_url : "lists/media_list.js",

				// Style formats
				style_formats : [
					{title : 'Bold text', inline : 'b'},
					{title : 'Red text', inline : 'span', styles : {color : '#ff0000'}},
					{title : 'Red header', block : 'h1', styles : {color : '#ff0000'}},
					{title : 'Example 1', inline : 'span', classes : 'example1'},
					{title : 'Example 2', inline : 'span', classes : 'example2'},
					{title : 'Table styles'},
					{title : 'Table row 1', selector : 'tr', classes : 'tablerow1'}
				],

				// Replace values for the template plugin
				
			});
		</script>
    	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title><?PHP echo SIMILE_EDIT_TITLE; ?></title>
		<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
		<link href="modules/epub/epub.css" media="screen" type="text/css" rel="stylesheet" />
		<script src="modules/epub/epub_edit.js" type="text/javascript"></script>
    </head>

    <body>
	<div style="float:left; position:relative; clear:both; width:90%; margin:20px;">
	<form method="POST" action="<?PHP echo url_return("preview",$row_edit['template_id']); ?>">
	<input type="hidden" name="save_path" value="<?PHP echo $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name']; ?>" />
	<div id="newpage">
		<label>New Page</label>
		<input type="text" name="new_page" value="Enter Chapter name here" />
		<input type="submit" id="submit" value="<? echo SIMILE_PREVIEW; ?>" />
	</div>
	<div id="pagemenu">
	<?PHP
	
		$dir = opendir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/draft");
	
		$chapter_count = 1;
	
		while($chapter = readdir($dir)){
		
			if($chapter!="."&&$chapter!=".."){
			
				$chapter = str_replace(".html","",substr($chapter, strpos($chapter, "-")+1));
		
				?><p><label><?PHP echo $chapter; ?></label> : <a class="edit" onclick="edit_page(<?PHP echo $chapter_count; ?>)">Edit</a></p><p><input size="35" length="25" name="chapter_<?PHP echo $chapter_count++; ?>_name" value="<?PHP echo $chapter; ?>" /></p><?PHP
				
			}
		
		}
	
	?>
	</div>
	<div id="pageholder">
	<?PHP
	
		$dir = opendir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/draft");
	
		$chapter_count = 1;
	
		while($chapter = readdir($dir)){
		
			if($chapter!="."&&$chapter!=".."){
			
				echo "<div id='editor_" . $chapter_count . "' class='chapter'";
				
				if($chapter_count!=1){
				
					echo " style='display:none' ";
				
				}
				
				echo " >";
				
				echo "<h2>" . str_replace(".html","",substr($chapter, strpos($chapter, "-")+1)) . "</h2>";
		
				echo "<textarea style='width:90%' id='elm" . $chapter_count . "' name='chapter_" . $chapter_count++ . "_content'>";
				
				echo file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/draft/" . $chapter);
		
				echo "</textarea>";
				
				echo "</div>";
				
			}
		
		}
		
	?>	
	</div>
	</form>
	</div>

	<?PHP

	}
	
?>
