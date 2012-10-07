<?PHP    

/**
* 
* preview page, allows the site to make a preview page for a xerte module
*
* @author Patrick Lockley
* @version 1.0
* @params array row_play - The array from the last mysql query
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/


/**
* 
* Function show_preview_code
* This function creates folders needed when creating a template
* @param array $row - an array from a mysql query for the template
* @param array $row_username - an array from a mysql query for the username
* @version 1.0
* @author Patrick Lockley
*/

function show_preview_code($row, $row_username){

	global $xerte_toolkits_site;
	
	require_once(dirname(__FILE__) . '/module_functions.php');
	require_once("website_code/php/url_library.php");
    _load_language_file("/modules/simile/edit.inc");

	
	$chapter = 1;
	
	if(isset($_POST['save_path'])){
	
		$save_path = $_POST['save_path'];
		
		$dir = opendir($save_path . "/draft/");
		
		while($file = readdir($dir)){
			
			if($file!="."&&$file!=".."){
			
				unlink($save_path . "/draft/" . $file);
			
			}
			
		}
		
		while(isset($_POST['chapter_' . $chapter . "_name"])){
		
			if($_POST['chapter_' . $chapter . "_name"]!=""){
		
				file_put_contents($save_path . "/draft/" . $chapter . "-" . $_POST['chapter_' . $chapter . "_name"] . ".html", $_POST['chapter_' . $chapter++ . '_content']);
				
			}
		
		}

		if(isset($_POST['new_page'])&&$_POST['new_page']!="Enter Chapter name here"){
		
			file_put_contents($save_path . "/draft/" . $chapter . "-" . $_POST['new_page'] . ".html", "");
		
		}
	
	}
	
	?>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title><?PHP echo SIMILE_EDIT_TITLE; ?></title>
		<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
		<link href="modules/epub/epub.css" media="screen" type="text/css" rel="stylesheet" />
		<script src="modules/epub/epub_edit.js" type="text/javascript"></script>
    </head>

    <body>
	<div style="float:left; position:relative; clear:both; width:90%; margin:20px;">
	<?PHP
	
	echo "<p><a href='" . url_return("edit",$row['template_id']) . "'>Return to editor</a> | <a href='" . url_return("play",$row['template_id']) . "'>Download epub</a></p>";

	?>
	<div id="pagemenu">
	<h1>Chapters</h1>
	<?PHP

		if(!isset($save_path)){
	
			$save_path = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'];
		
		}
	
		$dir = opendir($save_path . "/draft");
	
		$chapter_count = 1;
	
		while($chapter = readdir($dir)){
		
			if($chapter!="."&&$chapter!=".."){
			
				$chapter = str_replace(".html","",substr($chapter, strpos($chapter, "-")+1));
		
				?><p><a class="edit" onclick="show_page(<?PHP echo $chapter_count++; ?>)"><?PHP echo $chapter; ?></a></p><?PHP
				
			}
		
		}
	
	?>
	</div>
	<div id="pageholder">
	<?PHP
	
		$dir = opendir($save_path . "/draft");
	
		$chapter_count = 1;
	
		while($chapter = readdir($dir)){
		
			if($chapter!="."&&$chapter!=".."){
			
				echo "<div id='editor_" . $chapter_count . "' class='chapter'";
				
				if($chapter_count!=1){
				
					echo " style='display:none' ";
				
				}
				
				echo " >";
				
				echo "<h2>" . str_replace(".html","",substr($chapter, strpos($chapter, "-")+1)) . "</h2>";
		
				echo file_get_contents($save_path . "/draft/" . $chapter);
				
				echo "</div>";
				
				$chapter_count++;
				
			}
		
		}
		
	?>	
	</div>
	</form>
	</div>
<?PHP
	
}
	
	
?>