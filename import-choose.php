<?php
require_once("config.php");
require_once("website_code/php/language_library.php");
require_once("website_code/php/display_library.php");
require_once("website_code/php/user_library.php");
require_once("website_code/php/xmlInspector.php");

_include_javascript_file("website_code/scripts/file_system.js?version=" . $version);
_include_javascript_file("website_code/scripts/screen_display.js?version=" . $version);
_include_javascript_file("website_code/scripts/ajax_management.js?version=" . $version);
_include_javascript_file("website_code/scripts/folders.js?version=" . $version);
_include_javascript_file("website_code/scripts/template_management.js?version" . $version);
_include_javascript_file("website_code/scripts/logout.js?version=" . $version);
_include_javascript_file("website_code/scripts/import.js?version=" . $version);


_include_javascript_file("editor/js/vendor/jquery.ui-1.10.4.js");
_include_javascript_file("editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js");
_include_javascript_file("editor/js/vendor/jquery.ui.touch-punch.min.js");
_include_javascript_file("editor/js/vendor/modernizr-latest.js");
_include_javascript_file("editor/js/vendor/jstree.js");
_include_javascript_file("editor/js/tree.js");






if(empty($_SESSION['toolkits_logon_id'])) {
	die("Please login");
}

$workspace = json_decode(get_users_projects("date_down", true));

$items = array();
//$xmlNottingham = new DOMDocument();
//$xmlNottingham->load("modules/xerte/parent_templates/Nottingham/wizards/en-GB/data.xwd");

// Retrieve icon per model page type
$Nottingham = simplexml_load_file("modules/xerte/parent_templates/Nottingham/wizards/en-GB/data.xwd");
$nodes = $Nottingham->xpath("/wizard/learningObject/newNodes/*");
$pageIcons = array();
foreach($nodes as $node)
{
    $name = $node->getName();
    $icon = (string)$Nottingham->xpath('/wizard/' . $name . '/@icon')[0]['icon'];
    $pageIcons[$node->getName()] = $icon;
}

// Remove item in editor
for($i=0; $i<count($workspace->items); $i++)
{
    $item = $workspace->items[$i];
    if ($item->xot_id == $_GET["id"])
    {
        unset($workspace->nodes->{$item->id});
        array_splice($workspace->items, $i, 1);
        continue;
    }
    if ($item->type != "nottingham" && $item->type != "workspace" && $item->type != "folder")
    {
        unset($workspace->nodes->{$item->id});
        array_splice($workspace->items, $i, 1);
    }
}

$workspace_json = json_encode($workspace);

foreach($workspace->items as $item)
{
	if($item->parent != "#" && $item->xot_id != $_GET["id"])
	{
		$query = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}templatedetails WHERE template_id = ?";
		$source_row = db_query_one($query, array($item->xot_id));
		
		$query = "SELECT username FROM {$xerte_toolkits_site->database_table_prefix}logindetails WHERE login_id = ?";
		$source_user = db_query_one($query, array($source_row["creator_id"]));
		$query = "SELECT template_name FROM {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails WHERE template_type_id = ?";
		$source_template_name = db_query_one($query, array($source_row["template_type_id"]));

		$source_folder = $xerte_toolkits_site->users_file_area_full . $source_row['template_id'] . "-" . $source_user['username'] . "-" . $source_template_name['template_name'];		
		$source_file = $source_folder . "/data.xml";
		
		$template = new XerteXMLInspector();
        $template->loadTemplateXML($source_file);
		
		$x = new stdClass();
		$x->name = $item->text;
		$x->id = $item->xot_id;
		
		$x->glossary = $template->glossaryUsed();
        $x->pages = $template->getPages();
        for ($i=0; $i<count($x->pages); $i++)
        {
            $page = $x->pages[$i];
            $page->icon = $pageIcons[$page->type];
        }

		$items[$x->id] = $x;
	}
	
}



?>
<html>
<head>


<script>
	function CheckAll() {
		if($(".allCheck")[0].checked) {
			$(".checkAll").each(function (i) {
				$(this).prop("checked", true);
			});
		}
		else {
			$(".checkAll").each(function(i){
				$(this).prop("checked", false);
			});
		}
	}
	<?php
		echo "var jsonData = " . json_encode($items) . ";";
	?>
	$(function(){

		initWorkspace = function()
		{
            workspace = JSON.parse('<?php echo $workspace_json; ?>');

            init_workspace(true);
		}

		var merged = false;
		currentProject = template_id;
		sourceProject = -1;
		$("#merge").hide();
		$("#mergeGlossary").hide();
		$("#pagetype").html("Import");
		$(".optButtonContainer").hide();
		initWorkspace();
		$('#workspace').bind("DOMSubtreeModified",function(){
		 	$("#workspace .jstree-clicked").removeClass("jstree-clicked");	
		});
		
		$("#merge").click(function(e)
		{
			publish();
			merged = true;
			source_pages = [];
			$(".pageCheckbox").each(function(){
			    var $this = $(this);

			    if($this.is(":checked")){
			    	source_pages.push($this.attr("id"));
			    }
			    
			});
			merge_glossary = $("#mergeGlossaryCheck").is(":checked");
			if(source_pages.length > 0 || merge_glossary)
			{
				source_page = source_pages.join();
				source_project = sourceProject;
				target_insert = $(".jstree-children li").length;
				target_project = currentProject;
				
				window.location.href = "merge.php?source_project="+source_project+"&target_project="+target_project+
					"&target_page_position="+target_insert+"&source_pages="+source_page + "&merge_glossary=" + merge_glossary;
				
			}else{
				alert("No pages selected");
			}
		}
		);
	});
	
</script>
<style>

	#importPagesPanel, #importPagesPanel
	{
		position: relative;
		width: 45%;
	}
	#importPanel{
		width: 100%;
		position: relative;
	}
</style>
</head>
<body>
<table id="importPanel">
	<tr >
		<td id="importProjectsPanel">
			<div id="workspace">
			</div>

		</td>
		<td id="importPagesPanel">
			<div id="mergeGlossary"><input type="checkbox" id="mergeGlossaryCheck"></input>Merge glossary</div>
			<h2>Pages</h2>
			<div id="pages">

			</div>
			<div>
				<button id="merge" >Merge</button>
			</div>
		</td>
	</tr>
</table>

</body>
</html>