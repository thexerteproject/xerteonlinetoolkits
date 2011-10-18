<?php

require_once("config.php");

_load_language_file("/index.inc");

include $xerte_toolkits_site->php_library_path . "login_library.php";

include $xerte_toolkits_site->php_library_path . "display_library.php";

$_SESSION['toolkits_firstname'] = "Guest";

$_SESSION['toolkits_surname'] = "User";

include $xerte_toolkits_site->php_library_path . "user_library.php";

$_SESSION['toolkits_logon_username'] = "guest";

$mysql_id=database_connect("index.php database connect success","index.php database connect fail");			

/*
 * Check to see if this is a users' first time on the site
 */

if(check_if_first_time($_SESSION['toolkits_logon_username'])){

    /*
     *	create the user a new id			
     */

    $_SESSION['toolkits_logon_id'] = create_user_id();

    /*
     *   create a virtual root folder for this user
     */

    create_a_virtual_root_folder();			

}else{

    /*
     * User exists so update the user settings
     */

    $_SESSION['toolkits_logon_id'] = get_user_id();

    update_user_logon_time();

}

recycle_bin();	

/*
 * Output the main page, including the user's and blank templates
 */
?>
                <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><head>

                <!-- 

                University of Nottingham Xerte Online Toolkits

                HTML to use to set up the template management page

                Version 1.0

                -->

                <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
                <title><?PHP echo $xerte_toolkits_site->site_title; ?></title>

                <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
                <link href="website_code/styles/folder_popup.css" media="screen" type="text/css" rel="stylesheet" /><?PHP

echo "<script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS\n";

echo "var site_url = \"" . $xerte_toolkits_site->site_url .  "\";\n";

echo "var site_apache = \"" . $xerte_toolkits_site->apache .  "\";\n";

echo "var properties_ajax_php_path = \"website_code/php/properties/\";\n var management_ajax_php_path = \"website_code/php/management/\";\n var ajax_php_path = \"website_code/php/\";\n";

?>
                </script>
<script type="text/javascript" language="javascript" src="website_code/scripts/validation.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/file_system.js"></script>
<script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/file_system.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/screen_display.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/ajax_management.js"></script>
<script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/ajax_management.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/folders.js"></script>
<script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/folders.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/template_management.js"></script>
<script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/template_management.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/logout.js"></script>
<script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/logout.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/import.js"></script>
<script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/import.js"></script>

</head>

<!-- 

code to sort out the javascript which prevents the text selection of the templates (allowing drag and drop to look nicer

body_scroll handles the calculation of the documents actual height in IE.

-->

<body onload="javascript:sort_display_settings()"  onselectstart="return false;" onscroll="body_scroll()">

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
                    <p><?PHP echo INDEX_FOLDER_PROMPT; ?></p><form id="foldernamepopup" action="javascript:create_folder()" method="post" enctype="text/plain"><input type="text" width="200" id="foldername" name="foldername" style="margin:0px; margin-right:5px; padding:3px" />   <input type="image" src="website_code/images/Bttn_NewFolderOff.gif" onmouseover="this.src='website_code/images/Bttn_NewFolderOn.gif'" onmousedown="this.src='website_code/images/Bttn_NewFolderClick.gif'" onmouseout="this.src='website_code/images/Bttn_NewFolderOff.gif'" style="vertical-align:middle; margin-left:5px; border:1px solid #0f0;" /></form><p><img src="website_code/images/Bttn_CancelOff.gif" onmouseover="this.src='website_code/images/Bttn_CancelOn.gif'" onmousedown="this.src='website_code/images/Bttn_CancelClick.gif'" onmouseout="this.src='website_code/images/Bttn_CancelOff.gif'" onclick="javascript:popup_close()" /></p>
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
        <div style="width:50%; height:100%; float:right; position:relative; background-image:url(http://www.nottingham.ac.uk/toolkits/website_code/images/UofNLogo.jpg); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
            <p style="float:right; margin:0px; color:#a01a13;"><a href="javascript:logout()" style="color:#a01a13"><?PHP echo INDEX_LOG_OUT; ?></a></p>
        </div>
        <img src="website_code/images/xerteLogo.jpg" style="margin-left:10px; float:left" />
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
                            <?PHP echo INDEX_WORKSPACE_TITLE; ?>						
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
                        <img src="website_code/images/Bttn_NewFolderOff.gif" onmousedown="this.src='website_code/images/Bttn_NewFolderClick.gif'" onmouseover="this.src='website_code/images/Bttn_NewFolderOn.gif'" onmouseout="this.src='website_code/images/Bttn_NewFolderOff.gif'" onclick="javascript:make_new_folder()" />
                    </div>	
                    <div class="file_mgt_area_middle_button_left">
                        <img id="properties" src="website_code/images/Bttn_PropertiesDis.gif" />
                        <img id="edit" src="website_code/images/Bttn_EditDis.gif" />
                        <img id="preview" src="website_code/images/Bttn_PreviewDis.gif" />							
                    </div>	
                    <div class="file_mgt_area_middle_button_right">				
                        <img id="delete" src="website_code/images/Bttn_DeleteDis.gif" />	
                        <img id="duplicate" src="website_code/images/Bttn_DuplicateDis.gif" />	
                        <img id="publish" src="website_code/images/Bttn_PublishDis.gif" />
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
                                            <a href="javascript:selection_changed()">Sort</a>
                                        </p>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="border" style="margin-top:10px"></div>
                    <div class="help" style="width:48%">
                        <?PHP echo $xerte_toolkits_site->pod_one; ?>	
                    </div>

                    <div class="help" style="width:48%; float:right;">
                        <?PHP echo $xerte_toolkits_site->pod_two; ?>	
                    </div>
                    </div>

                    <div class="new_template_area">
                        <div class="top_left sign_in_TL m_b_d_2_child new_template_mod">
                            <div class="top_right sign_in_TR m_b_d_2_child">
                                <p class="heading">	
                                    <?PHP echo INDEX_CREATE; ?>					</p>
                                <p class="general">
                                    <?PHP echo INDEX_TEMPLATES; ?>					</p>
                            </div>
                        </div>

                    <div class="new_template_area_middle">

                    <!-- 

                            Top of the blank templates section

                    -->



                    <div id="new_template_area_middle_ajax" class="new_template_area_middle_scroll"><?PHP			

list_blank_templates();

?>
                    <!-- 

                        End of the blank templates section, through to end of page

                    -->
                    </div>				
                </div>
                <div class="file_mgt_area_bottom" style="width:100%">	
                    <div class="bottom_left sign_in_BL m_b_d_2_child">
                        <div class="bottom_right sign_in_BR m_b_d_2_child" style="height:10px;">					</div>
                    </div>
                </div>
            </div>
        <div class="border">	</div>
        <p class="copyright">
            <img src="website_code/images/lt_logo.gif" /><br>
            <?PHP echo $xerte_toolkits_site->copyright; ?></p>	
        </div>


    </body>
</html>
