<?PHP
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

 
require(dirname(__FILE__) .  '/../../website_code/php/xmlInspector.php');

function show_preview_code($row){

	global $xerte_toolkits_site;

    $string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

    $xmlfile = $string_for_flash . "preview.xml";

    $xmlFixer = new XerteXMLInspector();
    $xmlFixer->loadTemplateXML($xmlfile);
	
	if (strlen($xmlFixer->getName()) > 0)
    {
        $title = $xmlFixer->getName();
    }
    else
    {
        $title = XERTE_PREVIEW_TITLE;
    }

    $string_for_flash_xml = $xmlfile . "?time=" . time();

	$string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

	$template_path_string = "modules/decision/parent_templates/" . $row['template_name'];

	require_once("config.php");

	_load_language_file("/modules/decision/preview.inc");

	?>


	<!DOCTYPE html>
	<html>
		<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">
		<meta charset="utf-8">
		<title><?PHP echo $title  ?></title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<meta name="author" content="">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		
		<!--jquery-->
		<script type="text/javascript" src="<?PHP echo $template_path_string ?>/common/js/jquery/jquery-1.9.1.js"></script>
		<script type="text/javascript" src="<?PHP echo $template_path_string ?>/common/js/jquery/jquery-ui.min.js"></script>
		<script type="text/javascript" src="<?PHP echo $template_path_string ?>/common/js/jquery/jquery.ui.touch-punch.min.js"></script>

		<!--styles -->
		<link rel="stylesheet" href="<?PHP echo $template_path_string ?>/common/css/jquery-ui.min.css">
		<link rel="stylesheet" href="<?PHP echo $template_path_string ?>/common/css/styles.css">
		
		<!--support for IE < 6-8 -->
		<script src="<?PHP echo $template_path_string ?>/common/js/html5shiv.js"></script>
		
		<!--font awesome-->
		<link rel="stylesheet" href="<?PHP echo $template_path_string ?>/common/css/font-awesome-4.1.0/css/font-awesome.min.css">
		
		<script type="text/javascript">
		
			var FileLocation = "<?PHP echo $string_for_flash ?>";
			var templateLocation = "<?PHP echo $template_path_string ?>/";
			var projectXML = "<?PHP echo $string_for_flash_xml ?>/"; //this is the file to read, not the xml

		</script>

	</head>

	<body>
		
		<div id="mainHolder" style="visibility:hidden;">
			
			<div id="headerBlock">
				
				<div id="titles">
					<h1> </h1>
					<h2> </h2>
				</div>
				
				<div id="btnHolder">
					<span id="group1">
						<button id="backBtn"><span class="fa fa-chevron-circle-left fa-2x"></span><span class="btnLabel"></span></button>
						<button id="infoBtn"><span class="fa fa-info-circle fa-2x"></span><span class="btnLabel"></span></button>
						<button id="fwdBtn"><span class="fa fa-chevron-circle-right fa-2x"></span><span class="btnLabel"></span></button>
					</span>
					<span id="group2">
						<button id="newBtn"><span class="fa fa-plus-circle fa-2x"></span><span class="btnLabel"></span></button>
					</span>
				</div>
				
			</div>
			
			<div id="contentHolder">
				
				<div id="stepHolder">
					<button id="submitBtn" class="floatR"></button>
				</div>
				
				<div id="introHolder"></div>
				
				<div id="overviewHolder">
					<div id="overviewBtnHolder">
						<button id="emailBtn" class="floatR"><span class="fa fa-envelope fa-2x"></span><span class="btnLabel"></span></button>
						<button id="printBtn" class="floatR"><span class="fa fa-print fa-2x"></span><span class="btnLabel"></span></button>
					</div>
				</div>
				
			</div>
			
		</div>
		
		<div id="footerBlock" />
		
		<!--initialise the application specific code-->
		<script src="<?PHP echo $template_path_string ?>/common/js/decision.js"></script>
		
	<script type="text/javascript" language="JavaScript">
	
	<?PHP
	
	 echo "</script></body></html>";

	}

	?>
