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
_load_language_file("/workspaceproperties.inc");

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title><?PHP echo WORKSPACE_PROPERTIES_TITLE; ?></title>

    <!--

    Workspace properties HTML page
    Version 1.0

    -->

<link href="website_code/styles/workspacemanagement_tab.css" media="screen" type="text/css" rel="stylesheet" />
<link href="website_code/styles/properties_tab.css" media="screen" type="text/css" rel="stylesheet" />
<!--<link href="website_code/styles/folderproperties_tab.css" media="screen" type="text/css" rel="stylesheet" />-->
<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
<link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
<link rel="stylesheet" href="editor/css/jquery-ui.css">
<link rel="stylesheet" href="editor/js/vendor/themes/default/style.css" />
<!-- link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome/css/font-awesome.min.css" -->
<!-- link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css" -->
<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/all.min.css">
<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v4-shims.min.css">
<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v5-font-face.min.css">

    <?php
    if (file_exists($xerte_toolkits_site->root_file_path . "branding/branding.css"))
    {
        ?>
        <link href='branding/branding.css' rel='stylesheet' type='text/css'>
        <?php
    }
    else {
        ?>
        <?php
    }
    ?>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script>
<script type="text/javascript" src="editor/js/vendor/jquery.ui-1.10.4.js"></script>
<script type="text/javascript" src="editor/js/vendor/jquery.ui.touch-punch.min.js"></script>

    <?php
    _include_javascript_file("website_code/scripts/template_management.js");
    _include_javascript_file("website_code/scripts/properties_tab.js");
    ?>
    <script type="text/javascript" language="javascript" src="website_code/scripts/validation.js"></script>
    <?php
    _include_javascript_file("website_code/scripts/workspaceproperties_tab.js");
    _include_javascript_file("website_code/scripts/ajax_management.js");
    _include_javascript_file("website_code/scripts/import.js");
    ?>

</head>

<!--

Start the page and once loaded set the default option

-->

<body onload="my_properties_template()">

<!--

Hidden Iframe to allow for ajax file uploads

-->

	<iframe id="upload_iframe" name="upload_iframe" src="" style="width:0px;height:0px; display:none"></iframe>
	<!--- error widget -->
	<div id="errorpopup" title="<?PHP echo PHP_ERROR; ?>" style="display:none"></div>
	
	<div class="properties_main">
		<div class="main_area">
			<div id="title">
				<h1><i class="fa fa-gear xerte-icon"></i><?php echo WORKSPACE_PROPERTIES_DISPLAY_TITLE; ?></h1>
			</div>
			<div id="data_area">
				
				<div id="menu_tabs">
					
					<div id="tabs" role="tablist">
						
						<button id="tabProp" type="button" role="tab" aria-controls="panelProp" aria-selected="true" class="tabSelected" onclick="javascript:my_properties_template(); tabClicked('tabProp');">
							<i class="fa fa-user fa-fw xerte-icon"></i>&nbsp;<?PHP echo WORKSPACE_PROPERTIES_TAB_DETAILS; ?>
						</button>
						
						<button id="tabProjects" type="button" role="tab" aria-controls="panelProjects" aria-selected="false" onclick="javascript:workspace_templates_template(); tabClicked('tabProjects');">
							<i class="fa fa-file-text fa-fw xerte-icon"></i>&nbsp;<?PHP echo WORKSPACE_PROPERTIES_TAB_PROJECTS; ?>
						</button>
						
						<button id="tabRss" type="button" role="tab" aria-controls="panelRss" aria-selected="false" onclick="javascript:folder_rss_templates_template(); tabClicked('tabRss');">
							<i class="fa fa-rss fa-fw xerte-icon"></i>&nbsp;<?PHP echo WORKSPACE_PROPERTIES_TAB_FEEDS; ?>
						</button>
						
						<button id="tabImport" type="button" role="tab" aria-controls="panelImport" aria-selected="false" onclick="javascript:import_templates_template(<?PHP echo $_SESSION['toolkits_logon_id']; ?>); tabClicked('tabImport');">
							<i class="fa fa-file-import fa-fw xerte-icon"></i>&nbsp;<?PHP echo WORKSPACE_PROPERTIES_TAB_IMPORT; ?>
						</button>
						
						<button id="tabApi" type="button" role="tab" aria-controls="panelApi" aria-selected="false" onclick="javascript:api_template(); tabClicked('tabApi');">
							<i class="fa fa-layer-group fa-fw xerte-icon"></i>&nbsp;<?PHP echo WORKSPACE_PROPERTIES_TAB_API; ?>
						</button>
					
					</div>
					
					<div id="dynamic_area">
						
						<div id="panelProp" class="tabPanel" role="tabpanel" aria-labelledby="tabProp"></div>
						<div id="panelProjects" class="tabPanel" role="tabpanel" aria-labelledby="tabProjects"></div>
						<div id="panelRss" class="tabPanel" role="tabpanel" aria-labelledby="tabRss"></div>
						<div id="panelImport" class="tabPanel" role="tabpanel" aria-labelledby="tabImport"></div>
						<div id="panelApi" class="tabPanel" role="tabpanel" aria-labelledby="tabApi"></div>
						
					</div>
				
				</div>
			</div>
			<div style="clear:both;"></div>
		</div>
	</div>
</body>
</html>
