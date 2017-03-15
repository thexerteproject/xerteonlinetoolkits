<?php
require_once("config.php");
require_once("website_code/php/language_library.php");
require_once("website_code/php/display_library.php");
require_once("website_code/php/user_library.php");

if(empty($_SESSION['toolkits_logon_id'])) {
	die("Please login");
}

$workspace = json_decode(get_users_projects(""));
$items = array();
$xmlNottingham = new DOMDocument();
$xmlNottingham->load("modules/xerte/parent_templates/Nottingham/wizards/en-GB/data.xwd");

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
		
		$templateXml = new DOMDocument();
		$templateXml->load($source_file);
		
		$x = new stdClass();
		$x->name = $item->text;
		$x->id = $item->xot_id;
		$x->pages = array();
		$children = $templateXml->documentElement->childNodes;
		for($i = 0; $i < $children->length; $i++)
		{
			
			$child = $children->item($i);	
			$j = 0;
			$iconChild = $xmlNottingham->documentElement->getElementsByTagName($child->tagName)->item($j);
			while($iconChild != null && !$iconChild->hasAttribute("icon"))
			{
				$j++;
				$iconChild = $xmlNottingham->documentElement->getElementsByTagName($child->tagName)->item($j);
			}
			$y = new stdClass();
			$y->name = $child->getAttribute("name");
			if(iconChild != null){
				$y->icon = $iconChild->getAttribute("icon");
			}
			$y->type = $child->tagName;
			$y->index = $i;
			array_push($x->pages, $y);
		}
		
		
		
		//$tag = $xmlNottingham->documentElement->childNodes->getElementsByTagName($item->type);
		
		$items[$x->id] = $x;
	}
	
}



?>
<html>
<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script>
	$(function(){
		<?php
			echo "jsonData = " . json_encode($items) . ";";
		?>;
		var merged = false;
		currentProject = template_id;
		sourceProject = -1;
		$("#merge").hide();
		$(".page-link").click(function(e)
		{
			
			e.stopPropagation();
			id = e.currentTarget.id;
			sourceProject = id;
			data = jsonData[id];
			html = "";
			$.each(data.pages, function(x){			
				html += "<input type=\"checkbox\" id=\""+this.index+"\">" + '<img src="modules/xerte/icons/'+this.icon+'.png">' + this.name + "<br>";
			});
			$("#merge").show();

			
			$("#pages").html(html);
		
		});

		$("#merge").click(function(e)
		{
			merged = true;
			source_pages = [];
			$("input:checkbox").each(function(){
			    var $this = $(this);

			    if($this.is(":checked")){
			    	source_pages.push($this.attr("id"));
			    }
			    
			});
			if(source_pages.length > 0)
			{
				source_page = source_pages.join();
				source_project = sourceProject;
				target_insert = $(".jstree-children li").length;
				target_project = currentProject;
				url = "merge.php?source_project="+source_project+"&target_project="+target_project+"&target_page_position="+target_insert+"&source_pages="+source_page;
				$.ajax(url).done(function(data)
				{
					window.location.href = "edithtml.php?template_id=" + target_project;
				});
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
			<h2>Projects</h2>
			<ul>
			<?php
			foreach($items as $item)
			{
				echo "<li>";
				echo "<a class=\"page-link\" id=\"$item->id\" href=\"#\">$item->name</a>\r\n";		
				echo "</li>";
			}
			?>
			</ul>
		</td>
		<td id="importPagesPanel">
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