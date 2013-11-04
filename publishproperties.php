<?php

require_once(dirname(__FILE__) . "/config.php");
_load_language_file("/publishproperties.inc");

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?PHP echo PUBLISH_PROPERTIES_TITLE; ?></title>

<!-- 

University of Nottingham Xerte Online Toolkits

Properties HTML page 
Version 1.0

-->

<link href="website_code/styles/properties_tab.css" media="screen" type="text/css" rel="stylesheet" />
<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />

<script type="text/javascript" language="javascript" src="website_code/scripts/ajax_management.js"></script>

<script type="text/javascript" language="javascript">

var site_url = "<?php echo $xerte_toolkits_site->site_url;  ?>";
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
?>

</head>

<!--

Start the page and once loaded set the default option

-->

<body onload="javascript:tab_highlight('1');publish_template()">

<!--

Hidden Iframe to allow for ajax file uploads

-->

<iframe id="upload_iframe" name="upload_iframe" src="#" style="width:0px;height:0px; display:none"></iframe>

<div class="properties_main">
    <div class="corner" style="background-image:url(website_code/images/MessBoxTL.gif); background-position:top left;">
    </div>
    <div class="central" style="background-image:url(website_code/images/MessBoxTop.gif);">
    </div>
    <div class="corner" style="background-image:url(website_code/images/MessBoxTR.gif); background-position:top right;">
    </div>
    <div class="main_area_holder_1">
        <div class="main_area_holder_2">
            <div class="main_area">
                <div>
                    <span id="title">
                        <img src="website_code/images/Icon_Page.gif" style="vertical-align:middle; padding-left:10px;" /> 
                        <?PHP echo PUBLISH_PROPERTIES_DISPLAY_TITLE; ?>
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
                            <div id="tab1-1" class="tab_right_pad" style="height:38px;">
                            </div>
                            <div id="tab1" class="tab" style="width:146px; height:38px;">
                                <p onclick="javascript:tab_highlight('1');publish_template()">
                                    <?PHP echo PUBLISH_PROPERTIES_TAB_PROJECT; ?>
                                </p>									
                            </div>
                            <div class="tab_spacer">							
                            </div>
                            <div id="tab2-1" class="tab_right_pad" style="height:38px;">
                            </div>
                            <div id="tab2" class="tab"  style="width:146px; height:38px;">
                                <p onclick="javascript:tab_highlight('2'); access_template()">
                                    <?PHP echo PUBLISH_PROPERTIES_TAB_ACCESS; ?>
                                </p>									
                            </div>
                            <div class="tab_spacer">							
                            </div>
                            <div id="tab3-1" class="tab_right_pad" style="height:38px;">					
                            </div>
                            <div id="tab3" class="tab"  style="width:146px;  height:38px;">
                                <p onclick="javascript:tab_highlight('3'); rss_template()">
                                    <?PHP echo PUBLISH_PROPERTIES_TAB_RSS; ?>
                                </p>									
                            </div>
                            <div class="tab_spacer">							
                            </div>
                            <div id="tab4-1" class="tab_right_pad" style="height:38px;">																	
                            </div>
                            <div id="tab4" class="tab"  style="width:146px;  height:38px;">
                                <p onclick="javascript:tab_highlight('4'); syndication_template()">
                                    <?PHP echo PUBLISH_PROPERTIES_TAB_OPEN; ?>
                                </p>									
                            </div>
                            <div class="tab_spacer">							
                            </div>					
                            <!-- 

                                Last spacer given sufficient heigbt to fill the rest of the border for the right hand panel	

                            -->
                            <div class="tab_spacer" style="height:315px;">							
                            </div>
                        </div>						
                </div>									
							<div style="clear:both;"></div>
            </div>		
        </div>
    </div>	
    <div class="corner" style="background-image:url(website_code/images/MessBoxBL.gif); background-position:top left;">
    </div>
    <div class="central" style="background-image:url(website_code/images/MessBoxBottom.gif);">
    </div>
    <div class="corner" style="background-image:url(website_code/images/MessBoxBR.gif); background-position:top right;">
    </div>
</div>

</body>
</html>
