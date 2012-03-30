<?php

require_once(dirname(__FILE__) . "/config.php");

_load_language_file("/management.inc");

/**
 * 
 * Login page, self posts to become management page
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function mgt_page($xerte_toolkits_site, $extra){

?>
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
            <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
            <title><?PHP echo $xerte_toolkits_site->site_title; ?></title>

            <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />

            <!-- 

            University of Nottingham Xerte Online Toolkits

            HTML to use to set up the login page
            The {{}} pairs are replaced in the page formatting functions in display library

            Version 1.0

            -->

            </head>

            <body>

                <div class="topbar">
                    <img src="<?PHP echo $xerte_toolkits_site->site_logo; ?>" style="margin-left:10px; float:left" />
                    <img src="<?PHP echo $xerte_toolkits_site->organisational_logo; ?>" style="margin-right:10px; float:right" />
                </div>
                <div class="mainbody">
                    <div class="title">
                        <p>
                            <?PHP echo $xerte_toolkits_site->welcome_message; ?>
                        </p>
                    </div>		
                    <div class="mainbody_holder">
                        <div class="mainbody_div_2">
                            <div class="top_left sign_in_TL m_b_d_2_child" style="background-color:#f3eee2;">
                                <div class="top_right sign_in_TR m_b_d_2_child">
                                    <div class="bottom_left sign_in_BL m_b_d_2_child">
                                        <div class="bottom_right sign_in_BR m_b_d_2_child">
                                            <p>
                                                <?PHP echo MANAGEMENT_LOGIN; ?>
                                            </p>
                                            <div>
                                                <form method="post" enctype="application/x-www-form-urlencoded" action="management.php"><p>Username <input type="text" size="20" maxlength="100" name="login" /></p><p>Password <input type="password" size="20" maxlength="100" name="password" /></p><p style="clear:left; width:95%; padding-bottom:15px;"><input type="image" src="website_code/images/Bttn_LoginOff.gif" onmouseover="this.src='website_code/images/Bttn_LoginOn.gif'" onmousedown="this.src='website_code/images/Bttn_LoginClick.gif'" onmouseout="this.src='website_code/images/Bttn_LoginOff.gif'" style="float:right" /></p></form>


                                                <!-- 

                                                    After this, the login form is handled by the php

                                                -->

<?PHP

    echo $extra;

?>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="border"></div>
                        </div>
                        <div class="mainbody_left">
                            <div class="tutorials">								
                            </div>
                        </div>		
                        <div class="mainbody_div">	

                        </div>
                    </div>		
                </div>
                <div class="border">
                </div>
                <p class="copyright">
                <img src="website_code/images/lt_logo.gif" /><br>
                <?PHP echo $xerte_toolkits_site->copyright; ?>
                </p>
            </div>
            </body>
            </html>


<?PHP

}

require $xerte_toolkits_site->php_library_path . "login_library.php";

/*
 * As with index.php, check for posts and similar
 */ 

if(empty($_POST["login"])&&empty($_POST["password"])){

    mgt_page($xerte_toolkits_site, MANAGEMENT_USERNAME_AND_PASSWORD_EMPTY);

    /*
     * Password left empty
     */

}else if(empty($_POST["password"])){

    mgt_page($xerte_toolkits_site, MANAGEMENT_PASSWORD_EMPTY);


    /*
     * Password and username provided, so try to authenticate
     */

}else{

    if(($_POST["login"]==$xerte_toolkits_site->admin_username)&&($_POST["password"]==$xerte_toolkits_site->admin_password)){

        $_SESSION['toolkits_logon_id'] = "site_administrator";	

        $mysql_id=database_connect("management.php database connect success","management.php database connect fail");			

        /*
         * Password and username provided, so try to authenticate
         */

?>
			<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
            <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
            <title><?PHP echo $xerte_toolkits_site->site_title; ?></title>

            <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
			<link href="website_code/styles/management.css" media="screen" type="text/css" rel="stylesheet" />

            <!-- 

            University of Nottingham Xerte Online Toolkits

            HTML to use to set up the login page
            The {{}} pairs are replaced in the page formatting functions in display library

            Version 1.0

            -->
                <script type="text/javascript" language="javascript" src="website_code/scripts/file_system.js"></script>
                <script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/file_system.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/screen_display.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/ajax_management.js"></script>
<script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/ajax_management.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/management.js"></script>
<script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/management.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/import.js"></script>
<script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/import.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/template_management.js"></script>
<script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/template_management.js"></script>
<script type="text/javascript" language="javascript" src="website_code/scripts/logout.js"></script>
<script type="text/javascript" language="javascript" src="languages/<?PHP echo $_SESSION['toolkits_language']; ?>/website_code/scripts/logout.js"></script>

</head>

<body onload="javascript:site_list()">

<iframe id="upload_iframe" name="upload_iframe" src="#" style="width:0px;height:0px; display:none;"></iframe>

<!-- 

Folder popup is the div that appears when creating a new folder

-->
    <div class="topbar">
        <div style="width:50%; height:100%; float:right; position:relative; background-image:url(http://www.nottingham.ac.uk/toolkits/website_code/images/UofNLogo.jpg); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
            <p style="float:right; margin:0px; color:#a01a13;"><a href="javascript:logout()" style="color:#a01a13"><?PHP echo MANAGEMENT_LOGOUT; ?></a></p>
        </div>
        <img src="website_code/images/xerteLogo.jpg" style="margin-left:10px; float:left" />
    </div>

    <!-- 

        Main part of the page

    -->

    <div class="pagecontainer">

        <div class="admin_mgt_area">
            <div class="admin_mgt_area_top">
                <div class="top_left sign_in_TL m_b_d_2_child">
                    <div class="top_right sign_in_TR m_b_d_2_child">
                        <p class="heading">			
                            <?PHP echo MANAGEMENT_TITLE; ?>					
                        </p>
                    </div>
                </div>
            </div>

            <div class="admin_mgt_area_middle">
                <div class="admin_mgt_area_middle_button">

                    <!-- 

                        admin area menu

                    -->

                    <div class="admin_mgt_area_middle_button_left">
                        <a href="javascript:site_list();"><?PHP echo MANAGEMENT_MENUBAR_SITE; ?>	</a>				
                        <a href="javascript:templates_list();"><?PHP echo MANAGEMENT_MENUBAR_CENTRAL; ?>	</a>
                        <a href="javascript:users_list();"><?PHP echo MANAGEMENT_MENUBAR_USERS; ?>	</a>
                        <a href="javascript:user_templates_list();"><?PHP echo MANAGEMENT_MENUBAR_TEMPLATES; ?>	</a>
                        <a href="javascript:errors_list();"><?PHP echo MANAGEMENT_MENUBAR_ERRORS; ?>	</a>
                        <a href="javascript:play_security_list();"><?PHP echo MANAGEMENT_MENUBAR_PLAY; ?>	</a>
                        <a href="javascript:categories_list();"><?PHP echo MANAGEMENT_MENUBAR_CATEGORIES; ?>	</a>
                        <a href="javascript:licenses_list();"><?PHP echo MANAGEMENT_MENUBAR_LICENCES; ?>	</a>
                        <a href="javascript:feeds_list();"><?PHP echo MANAGEMENT_MENUBAR_FEEDS; ?>	</a>
                    </div>
                    <div class="admin_mgt_area_middle_button_right">
                        <a href="javascript:save_changes()"><?PHP echo MANAGEMENT_MENUBAR_SAVE; ?>	</a>						
                    </div>					
                    <div id="admin_area">


<?PHP

    }else{

        /*
         * Wrong password message
         */

        mgt_page($xerte_toolkits_site, MANAGEMENT_LOGON_FAIL . " " . MANAGEMENT_NOT_ADMIN_USERNAME);

        /*
         * Check the user is set as an admin in the usertype record in the logindetails table, and display the page
         */

        echo file_get_contents($xerte_toolkits_site->website_code_path . "admin_headers");

        echo "<script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS\n";

        echo "var site_url = \"" . $xerte_toolkits_site->site_url .  "\";\n";

        echo "var site_apache = \"" . $xerte_toolkits_site->apache .  "\";\n";

        echo "var properties_ajax_php_path = \"website_code/php/properties/\";";

        echo "var management_ajax_php_path = \"website_code/php/management/\";";

        echo "var ajax_php_path = \"website_code/php/\";</script>";

        echo admin_page_format_top(file_get_contents($xerte_toolkits_site->website_code_path . "admin_top"));			

        echo file_get_contents($xerte_toolkits_site->website_code_path . "admin_middle");


    }


}

?>	
</body>
</html>
