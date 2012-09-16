<?php
require("module_functions.php");

//Function show_template
//
// Version 1.0 University of Nottingham
// (pl)
// Set up the preview window for a xerte piece

function show_template($row_play){
    
	global $xerte_toolkits_site;

	require_once(dirname(__FILE__) . '/module_functions.php');
	
	/*
	* Format the XML strings to provide data to the engine
	*/

	if(!file_exists($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_play['username'] . "-" . $row_play	['template_name'] . "/preview.inc")){

		echo "UH OH!!!!!!!!!!!!!!";

	}
	
	?><html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title><?PHP echo SIMILE_EDIT_TITLE; ?></title>
		<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
		<script src="http://static.simile.mit.edu/timeline/api-2.3.0/timeline-api.js?bundle=true" type="text/javascript"></script>
    </head>

    <body><?PHP
	
	display_timeline(unserialize(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_play['username'] . "-" . $row_play['template_name'] . "/preview.inc")));

}
