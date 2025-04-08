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
require_once(dirname(__FILE__) . "/website_code/php/template_library.php");
require_once(dirname(__FILE__) . "/website_code/php/properties/properties_library.php");

_load_language_file("/properties.inc");
$version = getVersion();

$body_class = "";
if ($xerte_toolkits_site->rights == 'elevated')
{
    $body_class = ' class="elevated"';
}

?><!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>

        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo PROPERTIES_TITLE; ?></title>

        <!-- 
        
        Properties HTML page 
        Version 1.0
        
        -->

        <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
        <link href="website_code/styles/properties_tab.css" media="screen" type="text/css" rel="stylesheet" />
        <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
        <link href="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.css" type="text/css" rel="stylesheet" />
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
        <script>window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script>
        <script type="text/javascript" src="editor/js/vendor/jquery.ui-1.10.4.js"></script>
        <script type="text/javascript" src="editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js"></script>
        <script type="text/javascript" src="editor/js/vendor/jquery.ui.touch-punch.min.js"></script>
        <script type="text/javascript" language="javascript" src="website_code/scripts/ajax_management.js"></script>
		<script type="text/javascript" language="Javascript" src="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.js"></script>

        <script type="text/javascript" language="javascript">

            var site_url = "<?php echo $xerte_toolkits_site->site_url; ?>";
            var properties_ajax_php_path = "website_code/php/properties/";
            var management_ajax_php_path = "website_code/php/management/";
            var ajax_php_path = "website_code/php/";

        </script>
        <script type="text/javascript" language="javascript" src="website_code/scripts/validation.js"></script>
        <?php
        _include_javascript_file("website_code/scripts/import.js");
        _include_javascript_file("website_code/scripts/template_management.js");
        _include_javascript_file("website_code/scripts/properties_tab.js");
        _include_javascript_file("website_code/scripts/screen_display.js");
        _include_javascript_file("website_code/scripts/file_system.js");

        $template_supports = $learning_objects->{get_template_type((int) $_GET['template_id'])}->supports;

        if ($template_supports == "") {
            $template_supports = array();
        }
        ?>
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

    </head>

    <!--
    
    Start the page and once loaded set the default option
    
    -->

    <body onload="javascript:properties_template();" onunload="javascript:parent.window.opener.refresh_workspace()" <?php echo $body_class; ?> >

        <!--
        
        Hidden Iframes to allow for ajax file uploads and Downloads (Could be one I suppose)
        
        -->

        <iframe id="upload_iframe" name="upload_iframe" src="" style="width:0px;height:0px; display:none"></iframe>
        <iframe id="download_frame" style="display:none"></iframe>

        <div class="properties_main">
            <div class="main_area">
				<div id="title">
					<h1><i class="fa fa-info-circle xerte-icon"></i><?php echo PROPERTIES_DISPLAY_TITLE; ?></h1>
				</div>
                <div id="data_area">
					
                    <div id="menu_tabs">
						
						<div id="tabs" role="tablist">
							
							<button id="tabProject" type="button" role="tab" aria-controls="panelProject" aria-selected="true" class="tabSelected" onclick="javascript:properties_template(); tabClicked('tabProject');">
								<i class="fa fa-file-text fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_PROJECT; ?>
							</button>
							
							<button id="tabNotes" type="button" role="tab" aria-controls="panelNotes" aria-selected="false" onclick="javascript:notes_template(); tabClicked('tabNotes');">
								<i class="fa fa-edit fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_NOTES; ?>
							</button>
							
							<?PHP if (in_array("media", $template_supports)) { ?>
							<button id="tabMedia" type="button" role="tab" aria-controls="panelMedia" aria-selected="false" onclick="javascript:media_and_quota_template(); tabClicked('tabMedia');">
								<i class="fa fa-film fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_MEDIA; ?>
							</button>
							<?PHP } ?>
							
							<button id="tabAccess" type="button" role="tab" aria-controls="panelAccess" aria-selected="false" onclick="javascript:access_template(); tabClicked('tabAccess');">
								<i class="fa fa-unlock fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_ACCESS; ?>
							</button>
							
							<button id="tabShare" type="button" role="tab" aria-controls="panelShare" aria-selected="false" onclick="javascript:sharing_status_template(); tabClicked('tabShare');">
								<i class="fa fa-share fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_SHARED; ?>
							</button>
							
							<button id="tabRss" type="button" role="tab" aria-controls="panelRss" aria-selected="false" onclick="javascript:rss_template(); tabClicked('tabRss');">
								<i class="fa fa-rss fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_RSS; ?>
							</button>
							
							<button id="tabSyn" type="button" role="tab" aria-controls="panelSyn" aria-selected="false" onclick="javascript:syndication_template(); tabClicked('tabSyn');">
								<i class="fa fa-cc fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_OPEN; ?>
							</button>
							
							<?PHP if (in_array("export", $template_supports)) { ?>
							<button id="tabExport" type="button" role="tab" aria-controls="panelExport" aria-selected="false" onclick="javascript:export_template(); tabClicked('tabExport');">
								<i class="fa fa-save fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_EXPORT; ?>
							</button>
							<?PHP } ?>
							
							<?PHP if (in_array("lti/xapi", $template_supports)) { ?>
							<button id="tabLti" type="button" role="tab" aria-controls="panelLti" aria-selected="false" onclick="javascript:tsugi_template(); tabClicked('tabLti');">
								<i class="fa fa-layer-group fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_TSUGI; ?>
							</button>
							<?PHP } ?>
							
							<?PHP if (in_array("peer", $template_supports)) { ?>
							<button id="tabPeer" type="button" role="tab" aria-controls="panelPeer" aria-selected="false" onclick="javascript:peer_template(); tabClicked('tabPeer');">
								<i class="fa fa-comment fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_PEER; ?>
							</button>
							<?PHP } ?>
							
							<?PHP if (in_array("give", $template_supports)) { ?>
							<button id="tabGive" type="button" role="tab" aria-controls="panelGive" aria-selected="false" onclick="javascript:gift_template(); tabClicked('tabGive');">
								<i class="fa fa-gift fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_GIVE; ?>
							</button>
							<?PHP } ?>
							
							<?PHP if (in_array("xml", $template_supports)) { ?>
							<button id="tabXml" type="button" role="tab" aria-controls="panelXml" aria-selected="false" onclick="javascript:xml_template(); tabClicked('tabXml');">
								<i class="fa fa-code fa-fw xerte-icon"></i>&nbsp;<?PHP echo PROPERTIES_TAB_XML; ?>
							</button>
							<?PHP } ?>

						</div>
						
						<div id="dynamic_area">
							
							<div id="panelProject" class="tabPanel" role="tabpanel" aria-labelledby="tabProject"></div>
							<div id="panelNotes" class="tabPanel" role="tabpanel" aria-labelledby="tabNotes"></div>
							
							<?PHP if (in_array("media", $template_supports)) { ?>
							<div id="panelMedia" class="tabPanel" role="tabpanel" aria-labelledby="tabMedia"></div>
							<?PHP } ?>
						
							<div id="panelAccess" class="tabPanel" role="tabpanel" aria-labelledby="tabAccess"></div>
							<div id="panelShare" class="tabPanel" role="tabpanel" aria-labelledby="tabShare"></div>
							<div id="panelRss" class="tabPanel" role="tabpanel" aria-labelledby="tabRss"></div>
							<div id="panelSyn" class="tabPanel" role="tabpanel" aria-labelledby="tabSyn"></div>
							
							<?PHP if (in_array("export", $template_supports)) { ?>
							<div id="panelExport" class="tabPanel" role="tabpanel" aria-labelledby="tabExport"></div>
							<?PHP } ?>
						
							<?PHP if (in_array("lti/xapi", $template_supports)) { ?>
							<div id="panelLti" class="tabPanel" role="tabpanel" aria-labelledby="tabLti"></div>
							<?PHP } ?>
						
							<?PHP if (in_array("peer", $template_supports)) { ?>
							<div id="panelPeer" class="tabPanel" role="tabpanel" aria-labelledby="tabPeer"></div>
							<?PHP } ?>
						
							<?PHP if (in_array("give", $template_supports)) { ?>
							<div id="panelGive" class="tabPanel" role="tabpanel" aria-labelledby="tabGive"></div>
							<?PHP } ?>
						
							<?PHP if (in_array("xml", $template_supports)) { ?>
							<div id="panelXml" class="tabPanel" role="tabpanel" aria-labelledby="tabXml"></div>
							<?PHP } ?>
						
						</div>
						
					</div>
                </div>
				<div style="clear:both;"></div>
            </div>
        </div>

    </body>
</html>
