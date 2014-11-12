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

University of Nottingham Xerte Online Toolkits

Folder properties HTML page 
Version 1.0

-->

<link href="website_code/styles/properties_tab.css" media="screen" type="text/css" rel="stylesheet" />
<link href="website_code/styles/folderproperties_tab.css" media="screen" type="text/css" rel="stylesheet" />
<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />

<script type="text/javascript" language="javascript" src="website_code/scripts/validation.js"></script>
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

<body onload="javascript:folderproperties_template();tab_highlight('1');">
<div class="properties_main">
		<div class="main_area">
				<div>
						<span id="title">
								<img src="website_code/images/Icon_Folder.gif" style="vertical-align:middle; padding-left:10px;" /> 
								<?PHP echo FOLDERPROPERTIES_DISPLAY_TITLE; ?>
						</span>
				</div>
				<div id="data_area">

								<!--

										Dynamic area is the DIV used by the AJAX queries (The right hand side area of the properties panel.

								-->

								<div id="dynamic_area">
								</div>

								<!--

										Set up the three menu tabs

										Structure

										tab1-1 is the small part to the right of the main tab, this is used to deal with the border round the main section
										tab1 is the actual tab with the text in it

								-->

								<div id="menu_tabs">
										<div class="tab_spacer" style="height:35px;">							
										</div>
										<div id="tab1-1" class="tab_right_pad" style="height:38px;">
										</div>
										<div id="tab1" class="tab" style="width:146px; height:38px;">
												<p onclick="javascript:tab_highlight('1');folderproperties_template()">
														<?PHP echo FOLDERPROPERTIES_TAB_FOLDER; ?>
												</p>									
										</div>
										<div class="tab_spacer">							
										</div>
										<div id="tab2-1" class="tab_right_pad" style="height:38px;">										
										</div>
										<div id="tab2" class="tab" style="width:146px; height:38px;">
												<p onclick="javascript:tab_highlight('2'); folder_content_template()">
														<?PHP echo FOLDERPROPERTIES_TAB_CONTENT; ?>
												</p>									
										</div>
										<div class="tab_spacer">							
										</div>
										<div id="tab3-1" class="tab_right_pad" style="height:38px;">										
										</div>
										<div id="tab3" class="tab" style="width:146px; height:38px;">
												<p onclick="javascript:tab_highlight('3'); folder_rss_template()">
														<?PHP echo FOLDERPROPERTIES_TAB_RSS; ?>
												</p>									
										</div>
										<div class="tab_spacer">							
										</div>
										<!-- 

												Last spacer given sufficient heigbt to fill the rest of the border for the right hand panel

										-->

										<div class="tab_spacer" style="height:357px;">							
										</div>
								</div>						
				</div>									
		<div style="clear:both;"></div>
    </div>				
	<div style="clear:both;"></div>
</div>

</body>
</html>
