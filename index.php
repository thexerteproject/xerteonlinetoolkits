<?php

// Load the plugin files and fire a startup action
require_once(dirname(__FILE__) . "/plugins.php"); 

startup();

require_once(dirname(__FILE__) . "/config.php");

_load_language_file("/index.inc");

/**
 *
 * Login page, self posts to become management page
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */
include $xerte_toolkits_site->php_library_path . "display_library.php";


require_once(dirname(__FILE__) . "/website_code/php/login_library.php");


login_processing();
login_processing2();

recycle_bin();


/*
 * Output the main page, including the user's and blank templates
 */
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><head>
<?php head_start();?>
        <!--

        University of Nottingham Xerte Online Toolkits

        HTML to use to set up the template management page

        Version 1.0

        -->

        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?PHP echo apply_filters("head_title", $xerte_toolkits_site->site_title); ?></title>

        <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
        <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
        <link href="website_code/styles/folder_popup.css" media="screen" type="text/css" rel="stylesheet" />
    <?PHP
echo "
            <script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS
            var site_url = \"{$xerte_toolkits_site->site_url}\";
            var site_apache = \"{$xerte_toolkits_site->apache}\";
            var properties_ajax_php_path = \"website_code/php/properties/\";
            var management_ajax_php_path = \"website_code/php/management/\";
            var ajax_php_path = \"website_code/php/\";
            </script>";
?>
        <script type="text/javascript" language="javascript" src="website_code/scripts/validation.js" ></script>
<?php
_include_javascript_file("website_code/scripts/file_system.js");
_include_javascript_file("website_code/scripts/screen_display.js");
_include_javascript_file("website_code/scripts/ajax_management.js");
_include_javascript_file("website_code/scripts/folders.js");
_include_javascript_file("website_code/scripts/template_management.js");
_include_javascript_file("website_code/scripts/logout.js");
_include_javascript_file("website_code/scripts/import.js");
?>
    <?php head_end();?></head>

    <!--

    code to sort out the javascript which prevents the text selection of the templates (allowing drag and drop to look nicer

    body_scroll handles the calculation of the documents actual height in IE.

    -->

    <body onload="javascript:sort_display_settings()"  onselectstart="return false;" onscroll="body_scroll()">
	<?php body_start();?>
        <!--

        Folder popup is the div that appears when creating a new folder

        -->

        <div class="folder_popup" id="message_box">
            <div class="corner" style="background-image:url(website_code/images/MessBoxTL.gif); background-position:top left;">
            </div>
            <div class="central" style="background-image:url(website_code/images/MessBoxTop.gif);">
            </div>
            <div class="corner" style="background-image:url(website_code/images/MessBoxTR.gif); background-position:top right;">
            </div>
            <div class="main_area_holder_1">
                <div class="main_area_holder_2">
                    <div class="main_area" id="dynamic_section">
                        <p><?PHP echo INDEX_FOLDER_PROMPT; ?></p><form id="foldernamepopup" action="javascript:create_folder()" method="post" enctype="text/plain"><input type="text" width="200" id="foldername" name="foldername" style="margin:0px; margin-right:5px; padding:3px" /><br /><br />   <button type="submit" class="xerte_button"><img src="website_code/images/Icon_Folder_15x12.gif"/><?php echo INDEX_BUTTON_NEWFOLDER; ?></button><button type="button" class="xerte_button"  onclick="javascript:popup_close()"><?php echo INDEX_BUTTON_CANCEL; ?></button></form>
                        <p><span id="folder_feedback"></span></p>
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

        <div class="topbar">
            <div style="width:50%; height:100%; float:right; position:relative; background-image:url(<?php echo $xerte_toolkits_site->site_url . $xerte_toolkits_site->organisational_logo ?>); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                <p style="float:right; margin:0px; color:#a01a13;"><button type="button" class="xerte_button" onclick="javascript:logout()" ><?PHP echo INDEX_BUTTON_LOGOUT; ?></button></p>
            </div>
            <img src="<?php echo $xerte_toolkits_site->site_logo;?>" style="margin-left:10px; float:left" />
        </div>

        <!--

            Main part of the page

        -->

        <div class="pagecontainer">

            <div class="file_mgt_area">
                <div class="file_mgt_area_top">
                    <div class="top_left sign_in_TL m_b_d_2_child">
                        <div class="top_right sign_in_TR m_b_d_2_child">
                            <p class="heading">
                                <?PHP echo apply_filters('page_title', INDEX_WORKSPACE_TITLE);?>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="file_mgt_area_middle">
                    <div class="file_mgt_area_middle_button">

                        <!--

                            File area menu

                        -->

                        <div class="file_mgt_area_middle_button_left">
                            <button type="button" class="xerte_button" id="newfolder" onclick="javascript:make_new_folder()"><img src="website_code/images/Icon_Folder_15x12.gif"/><?php echo INDEX_BUTTON_NEWFOLDER; ?></button>
                        </div>
                        <div class="file_mgt_area_middle_button_left">
                            <button type="button" class="xerte_button_disabled" disabled="disabled" id="properties"><?php echo INDEX_BUTTON_PROPERTIES; ?></button>
                            <button type="button" class="xerte_button_disabled" disabled="disabled" id="edit"><?php echo INDEX_BUTTON_EDIT; ?></button>
                            <button type="button" class="xerte_button_disabled" disabled="disabled" id="preview"><?php echo INDEX_BUTTON_PREVIEW; ?></button>
                        </div>
                        <div class="file_mgt_area_middle_button_right">
                            <button type="button" class="xerte_button_disabled" disabled="disabled" id="delete"><?php echo INDEX_BUTTON_DELETE; ?></button>
                            <button type="button" class="xerte_button_disabled" disabled="disabled" id="duplicate"><?php echo INDEX_BUTTON_DUPLICATE; ?></button>
                            <button type="button" class="xerte_button_disabled" disabled="disabled" id="publish"><?php echo INDEX_BUTTON_PUBLISH; ?></button>
                        </div>
                        <div id="file_area" onscroll="scroll_check(event,this)" onmousemove="mousecoords(event)" onmouseup="file_drag_stop(event,this)"><?PHP
                                list_users_projects("data_down");
                                ?></div>
                    </div>
                    <!--

                            Everything from the end of the file system to the top of the blank templates area


                    -->

                </div>
                <div class="file_mgt_area_bottom" style="height:30px;">
                    <div class="bottom_left sign_in_BL m_b_d_2_child" style="height:30px;">
                        <div class="bottom_right sign_in_BR m_b_d_2_child" style="height:30px;">
                            <form name="sorting" style="display:inline">
                                <p style="padding:0px; margin:3px 0 0 5px">
                                    <?PHP echo INDEX_SORT; ?>
                                    <select name="type">
                                        <option value="alpha_up"><?PHP echo INDEX_SORT_A; ?></option>
                                        <option value="alpha_down"><?PHP echo INDEX_SORT_Z; ?></option>
                                        <option value="date_down"><?PHP echo INDEX_SORT_NEW; ?></option>
                                        <option value="date_up"><?PHP echo INDEX_SORT_OLD; ?></option>
                                    </select>
                                    <button type="button" class="xerte_button" onclick="javascript:selection_changed()"><?php echo INDEX_BUTTON_SORT; ?></button>

                                </p>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="border" style="margin-top:10px"></div>
                <div class="help" style="width:48%">
                    <?PHP echo apply_filters('editor_pod_one', $xerte_toolkits_site->pod_one); ?>
                </div>

                <div class="help" style="width:48%; float:right;">
                    <?PHP echo apply_filters('editor_pod_two', $xerte_toolkits_site->pod_two); ?>
                </div>
            </div>

            <div class="new_template_area">
                <div class="top_left sign_in_TL m_b_d_2_child new_template_mod">
                    <div class="top_right sign_in_TR m_b_d_2_child">
                        <?php
                        display_language_selectionform("general");
                        ?>

                        <p class="heading">
                            <?PHP echo INDEX_CREATE; ?>                                 </p>
                        <p class="general">
                            <?PHP echo INDEX_TEMPLATES; ?>                                      </p>
                    </div>
                </div>

                <div class="new_template_area_middle">

                    <!--

                            Top of the blank templates section

                    -->



                    <div id="new_template_area_middle_ajax" class="new_template_area_middle_scroll"><?PHP
                            list_blank_templates();
                            ?><!--

                            End of the blank templates section, through to end of page

                        -->
<?PHP echo "&nbsp;&nbsp;&nbsp;" . INDEX_LOGGED_IN_AS . " " . $_SESSION['toolkits_firstname'] ." " .$_SESSION['toolkits_surname'];?>
                    </div>
                </div>
                <div class="file_mgt_area_bottom" style="width:100%">
                    <div class="bottom_left sign_in_BL m_b_d_2_child">
                        <div class="bottom_right sign_in_BR m_b_d_2_child" style="height:10px;">                                        </div>
                    </div>
                </div>
            </div>
            <div class="border">    </div>
            <p class="copyright">
                <img src="website_code/images/lt_logo.gif" /><br/>
                <?PHP echo $xerte_toolkits_site->copyright; ?></p>
        </div>


    <?php body_end();?></body>
</html>
<?php shutdown();?>