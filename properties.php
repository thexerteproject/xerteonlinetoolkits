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

_load_language_file("/properties.inc");
?><!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo PROPERTIES_TITLE; ?></title>

        <!-- 
        
        University of Nottingham Xerte Online Toolkits
        
        Properties HTML page 
        Version 1.0
        
        -->

        <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
        <link href="website_code/styles/properties_tab.css" media="screen" type="text/css" rel="stylesheet" />
        <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />

        <script type="text/javascript" language="javascript" src="website_code/scripts/ajax_management.js"></script>

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

    </head>

    <!--
    
    Start the page and once loaded set the default option
    
    -->

    <body onload="javascript:tab_highlight('1');
        properties_template()" onunload="javascript:window.opener.refresh_workspace()">

        <!--
        
        Hidden Iframes to allow for ajax file uploads and Downloads (Could be one I suppose)
        
        -->

        <iframe id="upload_iframe" name="upload_iframe" src="#" style="width:0px;height:0px; display:none"></iframe>
        <iframe id="download_frame" style="display:none"></iframe>

        <div class="properties_main">
            <div class="main_area">
                <div>
                    <span id="title">
                        <img src="website_code/images/Icon_Page.gif" style="vertical-align:middle; padding-left:10px;" /> 
<?php echo PROPERTIES_DISPLAY_TITLE; ?>
                    </span>
                </div>
                <div id="data_area">

                    <!--

                                    Dynamic area is the DIV used by the AJAX queries (The right hand side area of the properties panel.

                    -->

                    <div id="dynamic_area">
                    </div>

                    <!--

                                    Set up the three parts for each tab

                                    Structure

                                    tab1-1 is the small part to the right of the main tab, this is used to deal with the border round the main section
                                    tab1 is the actual tab with the text in it

                    -->

                    <div id="menu_tabs">
                        <div class="tab_spacer" style="height:35px;">							
                        </div>
                        <!--<div id="tab1-1" class="tab_right_pad" style="height:38px;"></div>-->
                        <div id="tab1" class="tab" style="width:146px; height:38px;">
                            <p onclick="javascript:tab_highlight('1');
                                                                                                        properties_template()">
                                <?PHP echo PROPERTIES_TAB_PROJECT; ?>
                            </p>									
                        </div>
                        <div class="tab_spacer">							
                        </div>
                        <!--<div id="tab2-1" class="tab_right_pad" style="height:38px;"></div>-->
                        <div id="tab2" class="tab"  style="width:146px; height:38px;">
                            <p onclick="javascript:tab_highlight('2');
                                                                                                        notes_template()">
                                <?PHP echo PROPERTIES_TAB_NOTES; ?>
                            </p>									
                        </div>
                        <div class="tab_spacer">							
                        </div>
<?PHP
if (in_array("media", $template_supports)) {
    ?>
                            <!--<div id="tab3-1" class="tab_right_pad" style="height:38px;"></div>-->
                            <div id="tab3" class="tab"  style="width:146px;  height:38px;">
                                <p onclick="javascript:tab_highlight('3');
                                                                                                            media_and_quota_template()">
    <?PHP echo PROPERTIES_TAB_MEDIA; ?>
                                </p>									
                            </div>
                            <div class="tab_spacer">							
                            </div>
    <?PHP
}
?>
                        <!--<div id="tab4-1" class="tab_right_pad" style="height:38px;"></div>-->
                        <div id="tab4" class="tab"  style="width:146px;  height:38px;">
                            <p onclick="javascript:tab_highlight('4');
                                                                                                        access_template()">
                        <?PHP echo PROPERTIES_TAB_ACCESS; ?>
                            </p>									
                        </div>
                        <div class="tab_spacer">							
                        </div>
                        <!--<div id="tab5-1" class="tab_right_pad" style="height:38px;"></div>-->
                        <div id="tab5" class="tab"  style="width:146px; height:38px;">
                            <p onclick="javascript:tab_highlight('5');
                                                                                                        sharing_status_template()">
<?PHP echo PROPERTIES_TAB_SHARED; ?>
                            </p>									
                        </div>
                        <div class="tab_spacer">							
                        </div>
                        <!--<div id="tab6-1" class="tab_right_pad" style="height:38px;"></div>-->
                        <div id="tab6" class="tab"  style="width:146px; height:38px;">
                            <p onclick="javascript:tab_highlight('6');
                                                                                                        rss_template()">
<?PHP echo PROPERTIES_TAB_RSS; ?>
                            </p>									
                        </div>
                        <div class="tab_spacer">							
                        </div>
                        <!--<div id="tab7-1" class="tab_right_pad" style="height:38px;"></div>-->
                        <div id="tab7" class="tab" style="width:146px; height:38px;">
                            <p onclick="javascript:tab_highlight('7');
                                                                                                        syndication_template()">
<?PHP echo PROPERTIES_TAB_OPEN; ?>
                            </p>									
                        </div>							
                        <div class="tab_spacer">							
                        </div>
                                <?PHP
                                if (in_array("export", $template_supports)) {
                                    ?>							
                            <!--<div id="tab8-1" class="tab_right_pad" style="height:38px;"></div>-->
                            <div id="tab8" class="tab" style="width:146px; height:38px;">
                                <p onclick="javascript:tab_highlight('8');
                                                                                                            export_template()">
                            <?PHP echo PROPERTIES_TAB_EXPORT; ?>
                                </p>									
                            </div>
                            <div class="tab_spacer">							
                            </div>
    <?PHP
}
?>							                            
                                <?PHP
                                if (in_array("peer", $template_supports)) {
                                    ?>	
                            <!--<div id="tab9-1" class="tab_right_pad" style="height:38px;"></div>-->
                            <div id="tab9" class="tab" style="width:146px; height:38px;">
                                <p onclick="javascript:tab_highlight('9');
                                                                                                            peer_template()">
                            <?PHP echo PROPERTIES_TAB_PEER; ?>
                                </p>									
                            </div>	
                            <div class="tab_spacer">							
                            </div>
                            <?PHP
                        }
                        ?>	
<?PHP
if (in_array("give", $template_supports)) {
    ?>
                            <!--<div id="tab10-1" class="tab_right_pad" style="height:38px;"></div>-->
                            <div id="tab10" class="tab" style="width:146px; height:38px;">
                                <p onclick="javascript:tab_highlight('10');
                                                                                                            gift_template()">
    <?PHP echo PROPERTIES_TAB_GIVE; ?>
                                </p>									
                            </div>
                            <div class="tab_spacer">							
                            </div>
                            <?PHP
                        }
                        ?>
                        <?PHP
                        if (in_array("xml", $template_supports)) {
                            ?>
                            <!--<div id="tab11-1" class="tab_right_pad" style="height:38px;"></div>-->
                            <div id="tab11" class="tab" style="width:146px; height:38px;">
                                <p onclick="javascript:tab_highlight('11');
                                                                                                            xml_template()">
                                    <?PHP echo PROPERTIES_TAB_XML; ?>
                                </p>									
                            </div>						
                            <!-- 

                                            Last spacer given sufficient heigbt to fill the rest of the border for the right hand panel	

                            -->
                            <?PHP
                        }
                        ?>
                        <div class="tab_spacer" style="height:<?PHP echo (((5 - count($template_supports)) * 53)) + 18; ?>px;">							
                        </div>
                    </div>						
                </div>									
                <div style="clear:both;"></div>
            </div>
            <div style="clear:both;"></div>
        </div>

    </body>
</html>
