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
require_once(dirname(__FILE__) . "/config.php");
_load_language_file("/folderproperties.inc");

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?PHP echo FOLDERPROPERTIES_TITLE; ?></title>

<!-- 

Folder properties HTML page 
Version 1.0

-->

<link href="website_code/styles/properties_tab.css" media="screen" type="text/css" rel="stylesheet" />
<!--<link href="website_code/styles/folderproperties_tab.css" media="screen" type="text/css" rel="stylesheet" />-->
<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
<link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
<!-- link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome/css/font-awesome.min.css"-->
<!-- link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css"-->
<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/all.min.css">
<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v4-shims.min.css">
<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v5-font-face.min.css">

<script type="text/javascript" language="javascript" src="website_code/scripts/validation.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script>

<?php
_include_javascript_file("website_code/scripts/template_management.js");
_include_javascript_file("website_code/scripts/properties_tab.js");
_include_javascript_file("website_code/scripts/folderproperties_tab.js");
_include_javascript_file("website_code/scripts/ajax_management.js");
?>

</head>

<!--

Start the page and once loaded set the default option

-->

<body onload="javascript:folderproperties();" onunload="javascript:parent.window.opener.refresh_workspace();">

	<div class="properties_main">
		<div class="main_area">
			<div id="title">
				<h1><i class="fa fa-info-circle xerte-icon"></i><?php echo FOLDERPROPERTIES_DISPLAY_TITLE; ?></h1>
			</div>
			<div id="data_area">
				
				<div id="menu_tabs">
					
					<div id="tabs" role="tablist">
						
						<button id="tabFolder" type="button" role="tab" aria-controls="panelFolder" aria-selected="true" class="tabSelected" onclick="javascript:folderproperties(); tabClicked('tabFolder');">
							<i class="fa fa-folder fa-fw xerte-icon"></i>&nbsp;<?PHP echo FOLDERPROPERTIES_TAB_FOLDER; ?>
						</button>
						
						<button id="tabContent" type="button" role="tab" aria-controls="panelContent" aria-selected="false" onclick="javascript:folder_content(); tabClicked('tabContent');">
							<i class="fa fa-file-text fa-fw xerte-icon"></i>&nbsp;<?PHP echo FOLDERPROPERTIES_TAB_CONTENT; ?>
						</button>
						
						<button id="tabRss" type="button" role="tab" aria-controls="panelRss" aria-selected="false" onclick="javascript:folder_rss(); tabClicked('tabRss');">
							<i class="fa fa-rss fa-fw xerte-icon"></i>&nbsp;<?PHP echo FOLDERPROPERTIES_TAB_RSS; ?>
						</button>
						
						<button id="tabSyn" type="button" role="tab" aria-controls="panelSyn" aria-selected="false" onclick="javascript:sharing_status_folder(); tabClicked('tabSyn');">
							<i class="fa fa-share fa-fw xerte-icon"></i>&nbsp;<?PHP echo FOLDERPROPERTIES_TAB_SHARED; ?>
						</button>
						
					</div>
					
					<div id="dynamic_area">
						
						<div id="panelFolder" class="tabPanel" role="tabpanel" aria-labelledby="tabFolder"></div>
						<div id="panelContent" class="tabPanel" role="tabpanel" aria-labelledby="tabContent"></div>
						<div id="panelRss" class="tabPanel" role="tabpanel" aria-labelledby="tabRss"></div>
						<div id="panelSyn" class="tabPanel" role="tabpanel" aria-labelledby="tabSyn"></div>
						
					</div>
						
				</div>
			</div>
			<div style="clear:both;"></div>
		</div>
	</div>

</body>
</html>
