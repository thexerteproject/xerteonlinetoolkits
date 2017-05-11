<?php
require_once("../../config.php");
require_once("display_library.php");
require_once("user_library.php");
require_once("xmlInspector.php");
?>

<script type="text/javascript" src="editor/js/vendor/jquery.ui-1.10.4.js"></script>
<script type="text/javascript" src="editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/jquery.ui.touch-punch.min.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/modernizr-latest.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/tree.js?version=<?php echo $version;?>"></script>

<?php
_load_language_file("/website_code/php/import-choose.inc");

if(empty($_SESSION['toolkits_logon_id'])) {
	die("Please login");
}

$workspace = json_decode(get_users_projects("date_down", true));

$items = array();
$Nottingham = simplexml_load_file("../../modules/xerte/parent_templates/Nottingham/wizards/en-GB/data.xwd");
$nodes = $Nottingham->xpath("/wizard/learningObject/newNodes/*");
$pageIcons = array();
foreach($nodes as $node)
{
    $name = $node->getName();
    $icon = (string)$Nottingham->xpath('/wizard/' . $name . '/@icon')[0]['icon'];
    $pageIcons[$node->getName()] = $icon;
}

// Remove item in editor
for($i=count($workspace->items) - 1; $i>=0; $i--)
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


<div id="merge_mainContent" style="height:100%">
    <div id="merge_east" class="hide ui-layout-west">
        <div id="importProjectsPanel" class="content">
            <div id="workspace">
            </div>

        </div>
    </div>

    <div id="merge_center" class="hide ui-layout-center pane pane-center ui-layout-pane ui-layout-pane-center">
        <div id="content" class="content">
                <div id="mergeGlossary">
                    <div class="merge_title"><?php echo GLOSSARY;?></div>
                    <div><label><input type="checkbox" id="mergeGlossaryCheck"><?php echo MERGE_GLOSSARY;?></label></div>
                </div>
                <div class="merge_title"><?php echo PAGES;?></div>
                <div id="pages">

                </div>
                <div id="merge_button_container">
                    <button id="merge" class="xerte_button_dark"><img id="merge_button_icon" class=xerte_icon" src="editor/img/mergeIcon.svg"><?php echo MERGE;?></button>
                </div>
        </div>
    </div>
</div>

<script>
    jsonData = JSON.parse('<?php echo str_replace("'", "\\'", json_encode($items));?>');
    workspace = JSON.parse('<?php echo str_replace("'", "\\'",$workspace_json); ?>');
</script>

<?php
_include_javascript_file("website_code/scripts/import-choose.js?version=" . $version);

