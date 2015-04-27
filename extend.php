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

_load_language_file("/extend.inc");

/**
 *
 * Login page, self posts to become extend page
 *
 * @author Patrick Lockley
 * @version 1.0
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
    <?PHP echo EXTEND_LOGIN; ?>
                                        </p>
                                        <div>
                                            <form method="post" enctype="application/x-www-form-urlencoded" action="extend.php"><p>Username <input type="text" size="20" maxlength="100" name="login" /></p><p>Password <input type="password" size="20" maxlength="100" name="password" /></p><p style="clear:left; width:95%; padding-bottom:15px;"><button type="submit" class="xerte_button" style="float:right" ><?php echo EXTEND_BUTTON_LOGIN; ?></button></p></form>


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

/*
 * As with index.php, check for posts and similar
 */

if (empty($_POST["login"]) && empty($_POST["password"])) {

    mgt_page($xerte_toolkits_site, EXTEND_USERNAME_AND_PASSWORD_EMPTY);

    /*
     * Password left empty
     */
} else if (empty($_POST["password"])) {

    mgt_page($xerte_toolkits_site, EXTEND_PASSWORD_EMPTY);


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
                <link href="website_code/styles/extend.css" media="screen" type="text/css" rel="stylesheet" />
        <?PHP
        echo "<script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS\n";

        echo "var site_url = \"" . $xerte_toolkits_site->site_url . "\";\n";

        echo "var site_apache = \"" . $xerte_toolkits_site->apache . "\";\n";

        echo "var properties_ajax_php_path = \"website_code/php/properties/\";\n var management_ajax_php_path = \"website_code/php/management/\";\n var ajax_php_path = \"website_code/php/\";\n";
        ?></script>

                <!--

                HTML to use to set up the login page
                The {{}} pairs are replaced in the page formatting functions in display library

                Version 1.0

                -->
		<?php
                _include_javascript_file("website_code/scripts/file_system.js");
                _include_javascript_file("website_code/scripts/screen_display.js");
                _include_javascript_file("website_code/scripts/ajax_management.js");
                _include_javascript_file("website_code/scripts/extend.js");
                _include_javascript_file("website_code/scripts/import.js");
                _include_javascript_file("website_code/scripts/template_management.js");
                _include_javascript_file("website_code/scripts/logout.js");

                if ($authmech->canManageUser($jsscript))
                {
                    _include_javascript_file($jsscript);
                }
                ?>

            </head>

            <body class="extend" onload="list_modules()">

                <iframe id="upload_iframe" name="upload_iframe" src="#" style="width:0px;height:0px; display:none;"></iframe>

                <!--

                Folder popup is the div that appears when creating a new folder

                -->
                <div class="topbar">
                    <div style="width:50%; height:100%; float:right; position:relative; background-image:url(website_code/images/apereoLogo.png); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                        <p style="float:right; margin:0px; color:#a01a13;"><button type="button" class="xerte_button" onclick="javascript:logout()" ><?PHP echo EXTEND_LOGOUT; ?></button></p>
                    </div>
                    <img src="website_code/images/logo.png" style="margin-left:10px; float:left" />
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
        <?PHP echo EXTEND_TITLE; ?>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="admin_mgt_area_middle">
                            <div class="admin_mgt_area_middle_button">

                                <!--

                                    admin area menu

                                -->

                                <div id="admin_area">

        <?PHP
    } else {

        /*
         * Wrong password message
         */

        mgt_page($xerte_toolkits_site, EXTEND_LOGON_FAIL . " " . EXTEND_NOT_ADMIN_USERNAME);

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
