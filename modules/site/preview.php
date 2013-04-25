<?PHP


require(dirname(__FILE__) .  '/../../website_code/php/xmlInspector.php');

function show_preview_code($row){

	global $xerte_toolkits_site;

    $string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

    $xmlfile = $string_for_flash . "preview.xml";

    $xmlFixer = new XerteXMLInspector();
    $xmlFixer->loadTemplateXML($xmlfile);

    $string_for_flash_xml = $xmlfile . "?time=" . time();

	$string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

	$template_path_string = "modules/site/parent_templates/" . $row['template_name'];

	require_once("config.php");

	_load_language_file("/modules/site/preview.inc");

	?>


	<!DOCTYPE html>
	<html xmlns:fb="http://ogp.me/ns/fb#">
		<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">
		<meta charset="utf-8">
		<title><?PHP echo SITE_PREVIEW_TITLE;  ?></title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<meta name="author" content="">
		
		<!--jquery-->
		<script src="<?PHP echo $template_path_string ?>/common/js/jquery.js"></script>

		<!--styles -->
		<link href="<?PHP echo $template_path_string ?>/common/css/bootstrap.css" rel="stylesheet">
		<link href="<?PHP echo $template_path_string ?>/common/css/bootstrap-responsive.css" rel="stylesheet">
		
		<!--custom styles for this template-->
		<link href="<?PHP echo $template_path_string ?>/common/css/custom.css" rel="stylesheet">
				
		<!--support for IE < 6-8 -->
		<script src="<?PHP echo $template_path_string ?>/common/js/html5shiv.js"></script>
		
		<!--media element and initialisation-->
		<script src="<?PHP echo $template_path_string ?>/common/mediaelement/mediaelement-and-player.min.js"></script>
		<link rel="stylesheet" href="<?PHP echo $template_path_string ?>/common/mediaelement/mediaelementplayer.min.css" />
		
		<script type="text/javascript">
		
			var FileLocation = "<?PHP echo $string_for_flash ?>";
			var templateLocation = "<?PHP echo $template_path_string ?>/";
			var projectXML = "<?PHP echo $string_for_flash_xml ?>/"; //this is the file to read, not the xml

		</script>
    
	</head>

	<body data-twttr-rendered="true" data-spy="scroll" data-target="#contentTable">
		
		<!--facebookAPI-->
		<div id="fb-root"></div>
		<script>(function(d, s, id) {var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) return;js = d.createElement(s); js.id = id;js.src = "//connect.facebook.net/en_GB/all.js#xfbml=1";		  fjs.parentNode.insertBefore(js, fjs);		}(document, 'script', 'facebook-jssdk'));</script>
	    
		<div class="navbar navbar-inverse navbar-fixed-top">
			<div class="navbar-inner">
			  
				<div class="container">
				
					<button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>

					<div class="nav-collapse collapse">
						<ul class="nav"id="nav">
							<!--<li class=""><a href="./index.html">Home</a></li>-->
						</ul>
					</div>
				</div>
			</div>
		</div>
	
		<!--Learning Object Title-->
		<header class="jumbotron" id="overview">
			<div class="container">
				<h1 id="pageTitle">Learning Object Title</h1>
				<p id="pageSubTitle" class="lead">Overview title for the content below</p>
			</div>
		</header>

		<!--main page content: nav bar and sections-->
		<div class="container">
			<div class="row-fluid">
				<!--navigation-->
				<div class="span3 bs-docs-sidebar" id="contentTable">
				
					<ul class="nav nav-list bs-docs-sidenav affix" id="toc">
						<!--<li><a href="#section1ID">Section 1</a></li>-->					
					</ul>
				</div>
				
				<!--content-->
				<div class="span9" id="mainContent">

				</div>
			</div>
		</div>

		<footer class="footer">
			<div class="container">
				<div class="row-fluid">
					<div class="span12">
					
						<div class="addthis_toolbox addthis_default_style ">
							<a class="addthis_button_facebook_like" fb:like:layout="button_count"></a>
							<a class="addthis_button_tweet"></a>
							<a class="addthis_button_google_plusone"></a>  
							<a class="addthis_button_linkedin_counter"></a>
							<a class="addthis_button_pinterest_pinit"></a>
							<a class="addthis_counter addthis_pill_style"></a>
						</div>

						<!--<script type="text/javascript">var addthis_config = {"data_track_addressbar":true};</script>-->
						<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-50f40a8436e8c4c5" defer></script>
						
					</div>
				</div>
			</div>
		</footer>
		
		<!--bootstrap script-->
		
		<script src="<?PHP echo $template_path_string ?>/common/js/bootstrap.min.js"></script>
		
		<!--initialise the application specific code-->
		<script src="<?PHP echo $template_path_string ?>/common/js/application.js"></script>
		
	<script type="text/javascript" language="JavaScript">
	
	
	<?PHP
	
	 echo "</script></body></html>";

	}

	?>