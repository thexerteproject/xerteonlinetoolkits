<?php
require_once("../../config.php");
require_once("../../website_code/php/display_library.php");
require_once("../../website_code/php/user_library.php");
require_once("../../website_code/php/xmlInspector.php");

if(empty($_SESSION['toolkits_logon_id'])) {
	die("");
}

$template_id = $_GET["id"];

/*
$workspace = json_decode(get_users_projects("date_down", true));

$items = array();
$Nottingham = simplexml_load_file("../../modules/xerte/parent_templates/Nottingham/wizards/en-GB/data.xwd");
$nodes = $Nottingham->xpath("/wizard/learningObject/newNodes/*");
$pageIcons = array();
foreach($nodes as $node)
{
    $name = $node->getName();
	$tmpelement = $Nottingham->xpath('/wizard/' . $name . '/@icon');
	$icon = (string) $tmpelement[0]['icon'];
    $pageIcons[$node->getName()] = $icon;
}

// Remove item in editor
for($i=count($workspace->items) - 1; $i>=0; $i--)
{
    $item = $workspace->items[$i];
    if ($item->type != "nottingham" && $item->type != "workspace" && $item->type != "folder")
    {
        unset($workspace->nodes->{$item->id});
        array_splice($workspace->items, $i, 1);
    }
}

$workspace_json = json_encode($workspace);

foreach($workspace->items as $item)
{
	if($item->xot_id == $template_id)
	{
        if ($item->xot_type == "file") {
*/


$pageIcons = json_decode($_SESSION['pageIcons']);

            $query = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}templatedetails WHERE template_id = ?";
            $source_row = db_query_one($query, array($template_id));

            $query = "SELECT username FROM {$xerte_toolkits_site->database_table_prefix}logindetails WHERE login_id = ?";
            $source_user = db_query_one($query, array($source_row["creator_id"]));
            $query = "SELECT template_name FROM {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails WHERE template_type_id = ?";
            $source_template_name = db_query_one($query, array($source_row["template_type_id"]));

            $source_folder = $xerte_toolkits_site->users_file_area_full . $source_row['template_id'] . "-" . $source_user['username'] . "-" . $source_template_name['template_name'];
            $source_file = $source_folder . "/data.xml";

            $template = new XerteXMLInspector();
            $template->loadTemplateXML($source_file);

            $x = new stdClass();
            //$x->name = $item->text;
            $x->id = $template_id;

            $x->glossary = $template->glossaryUsed();
            $x->pages = $template->getPages();
            for ($i = 0; $i < count($x->pages); $i++) {
                $page = $x->pages[$i];
                $type = $page->type;
                $page->icon = $pageIcons->$type;
            }

            echo str_replace("'", "\\'", json_encode($x));

/*
            $items[$x->id] = $x;
        }
        else
        {
            $x = new stdClass();
            $x->name = $item->text;
            $x->id = $item->xot_id;

            $x->glossary = false;
            $x->pages = [];

            $items[$x->id] = $x;
        }
        break;
	}

	
}

echo str_replace("'", "\\'", json_encode($items));


*/