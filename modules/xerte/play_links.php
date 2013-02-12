<?php

	function show_play_links($template){
	
		switch($template){
		
			case "Nottingham" : 
			
									echo "<p>" . PROPERTIES_LIBRARY_PROJECT_HTML5_LINK . "</p>";
		
									echo "<p><a target=\"new\" href='" . $xerte_toolkits_site->site_url . url_return("play_html5", $_POST['template_id']) . "'>" . $xerte_toolkits_site->site_url . url_return("play_html5", $_POST['template_id']) . "</a></p>";
									
									break;
									
			default : break;
		
		}
	
	}