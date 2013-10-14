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
function mgt_page($xerte_toolkits_site, $extra)
{
    ?>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title><?PHP echo $xerte_toolkits_site->site_title; ?></title>
            <link rel="icon" href="favicon.ico" type="image/x-icon" />
            <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <?PHP
    echo "<script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS\n";

    echo "var site_url = \"" . $xerte_toolkits_site->site_url . "\";\n";

    echo "var site_apache = \"" . $xerte_toolkits_site->apache . "\";\n";

    echo "var properties_ajax_php_path = \"website_code/php/properties/\";\n var management_ajax_php_path = \"website_code/php/management/\";\n var ajax_php_path = \"website_code/php/\";\n";
    ?></script>

            <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
            <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />

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
								<div class="title_holder">
									<div class="title_welcome">
										<?PHP echo $xerte_toolkits_site->welcome_message; ?>
									</div>
									<div class="mainbody_holder">
										<div style="margin:0 7px 4px 0"><?PHP echo MANAGEMENT_LOGIN; ?></div>
										<form method="post" enctype="application/x-www-form-urlencoded" >
										<p style="margin:4px">Username:
										<input class="xerte_input_box" type="text" size="20" maxlength="100" name="login" id="login_box"/></p>
										<p style="margin:4px">Password:
										<input class="xerte_input_box" type="password" size="20" maxlength="100" name="password" /></p>
										<button type="submit" class="xerte_button_c" style="margin:0 3px 0 0"><?php echo MANAGEMENT_BUTTON_LOGIN; ?></button>
										</form>
										<script>document.getElementById("login_box").focus();</script>
										<!--<p><?PHP echo $extra; ?></p>-->
									</div>		
								</div>
								<div style="clear:both;"></div>		
						</div>
						
						<div class="bottompart">
							<div class="border"></div>
							<p class="copyright">
								<?php echo $xerte_toolkits_site->copyright; ?>
							</p>
						</div>
        </body>
    </html>


    <?PHP
}

/*
 * As with index.php, check for posts and similar
 */

if (empty($_POST["login"]) && empty($_POST["password"])) {

    mgt_page($xerte_toolkits_site, MANAGEMENT_USERNAME_AND_PASSWORD_EMPTY);

    /*
     * Password left empty
     */
} else if (empty($_POST["password"])) {

    mgt_page($xerte_toolkits_site, MANAGEMENT_PASSWORD_EMPTY);


    /*
     * Password and username provided, so try to authenticate
     */
} else {

    global $authmech;

    if (!isset($authmech))
    {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    if (($_POST["login"] == $xerte_toolkits_site->admin_username) && ($_POST["password"] == $xerte_toolkits_site->admin_password)) {

        $_SESSION['toolkits_logon_id'] = "site_administrator";

        $mysql_id = database_connect("management.php database connect success", "management.php database connect fail");

        /*
         * Password and username provided, so try to authenticate
         */
        ?>
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <title><?PHP echo $xerte_toolkits_site->site_title; ?></title>

                <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
                <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
                <link href="website_code/styles/management.css" media="screen" type="text/css" rel="stylesheet" />
        <?PHP
        echo "<script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS\n";

        echo "var site_url = \"" . $xerte_toolkits_site->site_url . "\";\n";

        echo "var site_apache = \"" . $xerte_toolkits_site->apache . "\";\n";

        echo "var properties_ajax_php_path = \"website_code/php/properties/\";\n var management_ajax_php_path = \"website_code/php/management/\";\n var ajax_php_path = \"website_code/php/\";\n";
        ?></script>

                <!-- 

                University of Nottingham Xerte Online Toolkits

                HTML to use to set up the login page
                The {{}} pairs are replaced in the page formatting functions in display library

                Version 1.0

                -->
		<?php
                _include_javascript_file("website_code/scripts/file_system.js");
                _include_javascript_file("website_code/scripts/screen_display.js");
                _include_javascript_file("website_code/scripts/ajax_management.js");
                _include_javascript_file("website_code/scripts/management.js");
                _include_javascript_file("website_code/scripts/import.js");
                _include_javascript_file("website_code/scripts/template_management.js");
                _include_javascript_file("website_code/scripts/logout.js");

                if ($authmech->canManageUser($jsscript))
                {
                    _include_javascript_file($jsscript);
                }
                ?>

            </head>

            <body onload="javascript:site_list()">

                <iframe id="upload_iframe" name="upload_iframe" src="#" style="width:0px;height:0px; display:none;"></iframe>

                <!-- 
                
                Folder popup is the div that appears when creating a new folder
                
                -->
                <div class="topbar">
                    <div style="width:50%; height:100%; float:right; position:relative; background-image:url(<?php echo $xerte_toolkits_site->site_url . $xerte_toolkits_site->organisational_logo ?>); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                        <p style="float:right; margin:0px; color:#a01a13;"><button type="button" class="xerte_button" onclick="javascript:logout()" ><?PHP echo MANAGEMENT_LOGOUT; ?></button></p>
                    </div>
                    <img src="<?php echo $xerte_toolkits_site->site_logo;?>" style="margin-left:10px; float:left" />
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
                                    <button type="button" style="margin-left:10px;" class="xerte_button" onclick="javascript:site_list();"><?PHP echo MANAGEMENT_MENUBAR_SITE; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:templates_list();"><?PHP echo MANAGEMENT_MENUBAR_CENTRAL; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:users_list();"><?PHP echo MANAGEMENT_MENUBAR_USERS; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:user_templates_list();"><?PHP echo MANAGEMENT_MENUBAR_TEMPLATES; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:errors_list();"><?PHP echo MANAGEMENT_MENUBAR_ERRORS; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:play_security_list();"><?PHP echo MANAGEMENT_MENUBAR_PLAY; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:categories_list();"><?PHP echo MANAGEMENT_MENUBAR_CATEGORIES; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:licenses_list();"><?PHP echo MANAGEMENT_MENUBAR_LICENCES; ?>	</button>
                                    <button type="button" style="margin-right:10px;" class="xerte_button" onclick="javascript:feeds_list();"><?PHP echo MANAGEMENT_MENUBAR_FEEDS; ?>	</button>
                                </div>
                                <div class="admin_mgt_area_middle_button_right">
                                    <button type="button" class="xerte_button" onclick="javascript:save_changes()"><?PHP echo MANAGEMENT_MENUBAR_SAVE; ?>	</button>
                                </div>					
                                <div id="admin_area">


        <?PHP
    } else {

        /*
         * Wrong password message
         */

        mgt_page($xerte_toolkits_site, MANAGEMENT_LOGON_FAIL . " " . MANAGEMENT_NOT_ADMIN_USERNAME);

        /*
         * Check the user is set as an admin in the usertype record in the logindetails table, and display the page
         */

        echo file_get_contents($xerte_toolkits_site->website_code_path . "admin_headers");

        echo "<script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS\n";

        echo "var site_url = \"" . $xerte_toolkits_site->site_url . "\";\n";

        echo "var site_apache = \"" . $xerte_toolkits_site->apache . "\";\n";

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
