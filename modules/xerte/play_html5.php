<?php
require("module_functions.php");

//Function show_template
//
// Version 1.0 University of Nottingham
// (pl)
// Set up the preview window for a xerte piece
require(dirname(__FILE__) .  '/../../website_code/php/xmlInspector.php');
function show_template($row_play){
    global $xerte_toolkits_site;

    $string_for_flash = $xerte_toolkits_site-> users_file_area_short . $row_play['template_id'] . "-" . $row_play['username'] . "-" . $row_play['template_name'] . "/";

    $xmlfile = $string_for_flash . "data.xml";

    $xmlFixer = new XerteXMLInspector();
    $xmlFixer->loadTemplateXML($xmlfile);

    $string_for_flash_xml = $xmlfile . "?time=" . time();

	$template_path_string = "modules/xerte/parent_templates/" . $row_play['template_name'];

    list($x, $y) = explode("~",get_template_screen_size($row_play['template_name'],$row_play['template_framework']));

    _load_language_file("/modules/xerte/preview.inc");

?>

        <!-- 

        University of Nottingham Xerte Online Toolkits

        HTML to use at the top of the Xerte preview and play windows
        Version 1.0

        -->

   <!DOCTYPE html>
	<html>
	<head>
		
		<title><?PHP echo XERTE_PREVIEW_TITLE;  ?></title>
		
		<meta name="viewport" id="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=10.0, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="IE=8" />
		
		<link rel="stylesheet" href="<?PHP echo $template_path_string ?>/common_html5/css/smoothness/jquery-ui-1.8.18.custom.css" type="text/css" />
		<link rel="stylesheet" href="<?PHP echo $template_path_string ?>/common_html5/css/mainStyles.css" type="text/css" />
		<link rel="stylesheet" href="<?PHP echo $template_path_string ?>/common_html5/mediaelement/mediaelementplayer.min.css" />
		
		<script type="text/javascript" src="<?PHP echo $template_path_string ?>/common_html5/js/jquery-1.7.1.min.js"></script>
		<script type="text/javascript" src="<?PHP echo $template_path_string ?>/common_html5/js/jquery-ui-1.8.18.custom.min.js"></script>
		<script type="text/javascript" src="<?PHP echo $template_path_string ?>/common_html5/js/jquery.ui.touch-punch.min.js"></script>			<!-- allows jQuery components to work on touchscreen devices -->
		<script type="text/javascript" src="<?PHP echo $template_path_string ?>/common_html5/js/imageLens.js"></script>							<!-- for creating magnifiers on images -->
		<script type="text/javascript" src="<?PHP echo $template_path_string ?>/common_html5/mediaelement/mediaelement-and-player.js"></script>	<!-- for audio & video players -->
		<script type="text/javascript" src="<?PHP echo $template_path_string ?>/common_html5/mediaelement/mediaPlayer.js"></script> 
		<script type="text/javascript" src="<?PHP echo $template_path_string ?>/common_html5/js/swfobject.js"></script>
		
		<script type="text/javascript">
			var FileLocation = "<?PHP echo $string_for_flash ?>";
			var x_templateLocation = "<?PHP echo $template_path_string ?>/";
			var x_projectXML = "<?PHP echo $string_for_flash_xml ?>/";
		</script>
		
	</head>

	<body>
		
		<script type="text/javascript" src="<?PHP echo $template_path_string ?>/common_html5/js/xenith.js"></script>
		
		<div id="x_mainHolder">
			
			<div id="x_mobileScroll">
				<div id="x_headerBlock">
					<div>
						<h1> </h1>
						<h2> </h2>
					</div>
				</div>
				
				<div id="x_pageHolder">
					<div id="x_pageDiv">
						
					</div>
				</div>
			</div>
			
			<div id="x_footerBlock">
				<div id="x_footerBg"></div>
				<div class="x_floatLeft"></div>
				<div class="x_floatRight">
					<button id="x_menuBtn"></button>
					<div id="x_pageControls">
						<button id="x_prevBtn"></button>
						<div id="x_pageNo"></div>
						<button id="x_nextBtn"></button>
					</div>
				</div>
			</div>
			
			<div id="x_background"></div>
			
		</div>
		
	<script type="text/javascript" language="JavaScript">
	<?PHP
	
	echo "</script></body></html>";

	}

	?>