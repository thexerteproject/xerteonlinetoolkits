<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
	<!DOCTYPE html>
	<html xmlns:fb="http://ogp.me/ns/fb#">
		<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">
		<meta charset="utf-8">
		<title><?PHP echo XERTE_PREVIEW_TITLE;  ?></title>
		<link rel="icon" href="favicon.ico" type="image/x-icon" />
		<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
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
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>

		<!--media element and initialisation-->
		<script src="<?PHP echo $template_path_string ?>/common/mediaelement/mediaelement-and-player.min.js"></script>
		<link rel="stylesheet" href="<?PHP echo $template_path_string ?>/common/mediaelement/mediaelementplayer.min.css" />

		<script type="text/javascript">

			var FileLocation = "<?PHP echo $string_for_flash ?>";
			var templateLocation = "<?PHP echo $template_path_string ?>/";
			var projectXML = "<?PHP echo $string_for_flash_xml ?>/"; //this is the file to read, not the xml

		</script>

	</head>

	<body data-twttr-rendered="true" data-spy="scroll" data-target=".bs-docs-sidebar">

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
				<div class="span3 bs-docs-sidebar">
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
						<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-50f40a8436e8c4c5"></script>

						<img src="<?PHP echo $template_path_string ?>/common/footer/cc-by-nc-sa.png">
						<strong><small>� 2013 The Univeristy of Nottingham</small></strong>

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

	 "</script></body></html>";

	}

	?>
