<?PHP

	_load_language_file("/website_code/php/workspaceproperties/workspace_library.inc");

	function workspace_templates_menu(){
	
		echo "<p class=\"header\"><span>My projects</span></p>";	
		echo "<div class=\"menu_holder\"><div class=\"menu_button\"><a href=\"javascript:workspace_templates_template()\">" . WORKSPACE_LIBRARY_MY . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:shared_templates_template()\">" . WORKSPACE_LIBRARY_SHARED . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:public_templates_template()\">" . WORKSPACE_LIBRARY_PUBLIC . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:usage_templates_template()\">" . WORKSPACE_LIBRARY_USAGE . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:rss_templates_template()\">" . WORKSPACE_LIBRARY_RSS . "</div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:syndication_templates_template()\">" . WORKSPACE_LIBRARY_OPEN . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:peer_templates_template()\">" . WORKSPACE_LIBRARY_PEER . "</a></div>";
		echo "<div class=\"menu_button\"><a href=\"javascript:xml_templates_template()\">" . WORKSPACE_LIBRARY_XML . "</a></div>";
		echo "</div>";

	}
	
	function workspace_menu_create($size){
	
		echo "<div style=\"clear:left; margin-left:20px; margin-top:10px; width:90%; float:left;\">";

		echo "<div style=\"float:left; width:" . $size . "%; height:20px;\">" . WORKSPACE_LIBRARY_TEMPLATE_NAME . "</div>";
	
	}

?>
