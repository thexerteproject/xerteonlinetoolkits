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
require_once dirname(__FILE__) . "/website_code/php/user_library.php";

_load_language_file("/management.inc");

/**
 *
 * Login page, self posts to become management page
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
            <script type="text/javascript">
			 <?PHP
			 echo "var site_url = \"" . $xerte_toolkits_site->site_url . "\";\n";

			 echo "var site_apache = \"" . $xerte_toolkits_site->apache . "\";\n";

			 echo "var properties_ajax_php_path = \"website_code/php/properties/\";\n var management_ajax_php_path = \"website_code/php/management/\";\n var ajax_php_path = \"website_code/php/\";\n";
			 ?></script>



            <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
            <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
			<!--link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css" -->

            <!--

				 HTML to use to set up the login page
				 The {{}} pairs are replaced in the page formatting functions in display library

				 Version 1.0

            -->
            <style>
             body {
                 background:white;
             }
            </style>

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

        <body>

            <header class="topbar">
                <?php
                if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_right.png"))
                {
                ?>
                    <div
						style="width:50%; height:100%; float:right; position:relative; background-image:url(<?php echo "branding/logo_right.png";?>); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                    </div>
                <?php
                }
                else {
                ?>
                    <div
						style="width:50%; height:100%; float:right; position:relative; background-image:url(website_code/images/apereoLogo.png); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                    </div>
                <?php
                }
                if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_left.png"))
                {
                ?>
                    <img src="<?php echo "branding/logo_left.png";?>" style="margin-left:10px; float:left" alt="<?php echo MANAGEMENT_LOGO_ALT; ?>"/>
                <?php
                }
                else {
                ?>
                    <img src="website_code/images/logo.png" style="margin-left:10px; float:left" alt="<?php echo MANAGEMENT_LOGO_ALT; ?>"/>
                <?php
                }
                ?>
            </header>


			<main class="mainbody">
				<div class="title_holder">
					<h1 class="title_welcome">
						<?PHP echo $xerte_toolkits_site->welcome_message; ?>
					</h1>
					<div class="mainbody_holder">
						<div style="margin:0 7px 4px 0"><?PHP echo MANAGEMENT_LOGIN; ?></div>
						<form method="post" enctype="application/x-www-form-urlencoded" >
							<p style="margin:4px"><label for="login_box"><?PHP echo MANAGEMENT_USERNAME; ?>:</label>
								<input class="xerte_input_box" type="text" size="20" maxlength="100" name="login" id="login_box"/></p>
								<p style="margin:4px"><label for="password"><?PHP echo MANAGEMENT_PASSWORD; ?>:</label>
									<input class="xerte_input_box" type="password" size="20" maxlength="100" name="password" id="password"/></p>
									<button type="submit" class="xerte_button" style="margin:0 3px 0 0"><i class="fa fa-sign-in"></i> <?php echo MANAGEMENT_BUTTON_LOGIN; ?></button>
						</form>
						<script>document.getElementById("login_box").focus();</script>
						<!--<p><?PHP echo $extra; ?></p>-->
					</div>
				</div>
				<div style="clear:both;"></div>
			</main>

			<div class="bottompart">
				<div class="border"></div>
				<footer>
					<p class="copyright">
						<?php echo $xerte_toolkits_site->copyright; ?> <i class="fa fa-info-circle" aria-hidden="true" style="color:#f86718; cursor: help;" title="<?PHP $vtext = "version.txt";$lines = file($vtext);echo $lines[0];?>"></i>
					</p>
					<div class="footerlogos">
						<a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" title="Xerte accessibility statement https://xot.xerte.org.uk/play.php?template_id=214"><img src="website_code/images/wcag2.2AA-blue.png" border="0" alt="<?php echo MANAGEMENT_WCAG_LOGO_ALT; ?>"></a><a href="https://opensource.org/" target="_blank" title="Open Source Initiative: https://opensource.org/"><img src="website_code/images/osiFooterLogo.png" border="0" alt="<?php echo MANAGEMENT_OSI_LOGO_ALT; ?>"></a><a href="https://www.apereo.org" target="_blank" title="Apereo: https://www.apereo.org"><img src="website_code/images/apereoFooterLogo.png" border="0" alt="<?php echo MANAGEMENT_APEREO_LOGO_ALT; ?>"></a><a href="https://xerte.org.uk" target="_blank" title="Xerte: https://xerte.org.uk"><img src="website_code/images/xerteFooterLogo.png" border="0" alt="<?php echo MANAGEMENT_XERTE_LOGO_ALT; ?>"></a>
					</div>
				</footer>
			</div>
        </body>
    </html>


<?PHP
exit();
}
if(isset($_SESSION['toolkits_logon_id'])) {

    global $authmech;

    if (!isset($authmech))
    {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    if ($xerte_toolkits_site->altauthentication != "")
    {
        $altauthmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->altauthentication);
    }

    $regenerate_session_id = true;
    if ($xerte_toolkits_site->authentication_method == "Moodle")
    {
        $regenerate_session_id = false;
    }

    $msg = "Admin user: " . $_SESSION['toolkits_logon_username'] ." logged in successfully from " . $_SERVER['REMOTE_ADDR'];
    receive_message("", "SYSTEM", "MGMT", "Successful login", $msg);

    // $mysql_id = database_connect("management.php database connect success", "management.php database connect fail");

    /*
     * Password and username provided, so try to authenticate
     */
    // If user has admin rights, enable elevated
    if (userHasAdminRights())
    {
        $_SESSION['elevated'] = true;
        $xerte_toolkits_site->rights = 'elevated';
    }
    if (is_user_admin())
    {
        // Ensure user can open Tsugi Admin Panel
        $_SESSION['admin'] = true;
    }
    $version = getVersion();

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?PHP echo $xerte_toolkits_site->site_title; ?></title>

        <link href="website_code/styles/frontpage.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet" />
        <link href="website_code/styles/xerte_buttons.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet" />
        <link href="website_code/styles/management.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet" />
        <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/all.min.css">
        <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v4-shims.min.css">
        <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v5-font-face.min.css">

        <link rel="stylesheet" type="text/css" href="website_code/styles/selectize.css?version=<?php echo $version;?>">
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

        <script type="text/javascript">
         <?PHP
         echo "var site_url = \"" . $xerte_toolkits_site->site_url . "\";\n";

         echo "var site_apache = \"" . $xerte_toolkits_site->apache . "\";\n";
         echo "var properties_ajax_php_path = \"website_code/php/properties/\";\n var management_ajax_php_path = \"website_code/php/management/\";\n var ajax_php_path = \"website_code/php/\";\n";
         ?></script>

        <!--

             HTML to use to set up the login page
             The {{ }} pairs are replaced in the page formatting functions in display library

             Version 1.0

        -->
		<?php
        echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . "editor/js/vendor/jquery-1.9.1.min.js\"></script>";
        _include_javascript_file("editor/js/vendor/jquery-1.9.1.min.js");
        _include_javascript_file("website_code/scripts/file_system.js?version=" . $version);
        _include_javascript_file("website_code/scripts/screen_display.js?version=" . $version);
        _include_javascript_file("website_code/scripts/ajax_management.js?version=" . $version);
        _include_javascript_file("website_code/scripts/management.js?version=" . $version);
        _include_javascript_file("website_code/scripts/import.js?version=" . $version);
        _include_javascript_file("website_code/scripts/template_management.js?version=" . $version);
        _include_javascript_file("website_code/scripts/logout.js?version=" . $version);
        _include_javascript_file("website_code/scripts/functions.js?version=" . $version);
        echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . "website_code/scripts/selectize.js?version={$version}>\"></script>";

        if ($authmech->canManageUser($jsscript) || (isset($altauthmech) && $altauthmech->canManageUser($altjsscript)))
        {
            if ($authmech->canManageUser($jsscript))
            {
                _include_javascript_file($jsscript . "?version=" . $version);
            }
            if (isset($altauthmech) && $altauthmech->canManageUser($altjsscript) && $xerte_toolkits_site->authentication_method != $xerte_toolkits_site->altauthentication)
            {
                _include_javascript_file($altjsscript . "?version=" . $version);
            }
        }
        ?>
        <style>
         body {
             background:white;
         }
        </style>
    </head>

    <body onload="javascript:show_first_tab()">

        <iframe id="upload_iframe" name="upload_iframe" src="" style="width:0px;height:0px; display:none;"></iframe>

        <!--

             Folder popup is the div that appears when creating a new folder

        -->
        <div class="topbar">
            <?php
            if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_right.png"))
            {
            ?>
                <div
                    style="width:50%; height:100%; float:right; position:relative; background-image:url(<?php echo "branding/logo_right.png";?>); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                </div>
            <?php
            }
            else {
            ?>
                <div
                    style="width:50%; height:100%; float:right; position:relative; background-image:url(website_code/images/apereoLogo.png); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                </div>
            <?php
            }
            if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_left.png"))
            {
            ?>
                <img src="<?php echo "branding/logo_left.png";?>" style="margin-left:10px; float:left"/>
            <?php
            }
            else {
            ?>
                <img src="website_code/images/logo.png" style="margin-left:10px; float:left"/>
            <?php
            }
            ?>
        </div>

        <!--

             Main part of the page

        -->

        <div class="pagecontainer">

            <div class="buttonbar">

                <div class="userbar">
                    <?php // echo "&nbsp;&nbsp;&nbsp;" . INDEX_LOGGED_IN_AS . " ";
                    //echo isset($_SESSION['toolkits_logon_username'])? $_SESSION['toolkits_logon_username']: $xerte_toolkits_site->admin_username;
                    echo $_SESSION['toolkits_firstname'] . " " . $_SESSION['toolkits_surname'];
                    if ($_SESSION['toolkits_logon_id'] === 'site_administrator') {
                        // place logout button

                        ?>
                        <button title="<?php echo MANAGEMENT_LOGOUT; ?>"
                                type="button" class="xerte_button_c_no_width"
                                onclick="javascript:logout()" style="margin-bottom: 8px;">
                            <i class="fas fa-sign-out-alt"></i>&nbsp;<?php echo MANAGEMENT_LOGOUT; ?>
                        </button>
                    <?php
                    }
                    else
                    {
                        // Place a button to TSUGI (if you have the rights)
                        if (is_user_admin() && file_exists($xerte_toolkits_site->tsugi_dir)) {
                            ?>
                            <button title="<?php echo MANAGEMENT_TO_TSUGI_ADMIN; ?>"
                                    type="button" class="xerte_button_c_no_width"
                                    onclick="javascript:redirect('tsugi/admin', true)" style="margin-bottom: 8px;">
                                <i class="fa xerte-icon">次</i> <?php echo MANAGEMENT_TO_TSUGI_ADMIN; ?>
                            </button>
                           <?php
                        }
                        // Place button with link to index.php
                    ?>
                        <button title="<?php echo MANAGEMENT_TOWORKSPACE; ?>"
                                type="button" class="xerte_button_c_no_width"
                                onclick="javascript:redirect('index.php')" style="margin-bottom: 8px;">
                            <i class="fas fa-home"></i>&nbsp;<?php echo MANAGEMENT_TOWORKSPACE; ?>
                        </button>
                    <?php
                    }
                    ?>
                </div>
                <div style="clear:both;"></div>
                <div class="separator"></div>
            </div>

            <div class="admin_mgt_area">
                <div class="admin_mgt_area_top">
                    <div class="sign_in_TL m_b_d_2_child">
                        <div class="sign_in_TR m_b_d_2_child">
                            <h1 class="heading">
								<?PHP echo MANAGEMENT_TITLE; ?>
                            </h1>
                        </div>
                    </div>
                </div>

                <div class="admin_mgt_area_middle">
                    <div class="admin_mgt_area_middle_button">

                        <!--

                             admin area menu

                        -->

                        <div class="admin_mgt_area_middle_button_left">
                            <?php
                            $firsttab = null;
                            if (is_user_permitted("system")) { $firsttab = $firsttab != null ? $firsttab : 'site_list()'; ?>
                            <button type="button" class="xerte_button" onclick="javascript:site_list();"><i class="fa fa-sitemap"></i> <?PHP echo MANAGEMENT_MENUBAR_SITE; ?>	</button>
                            <?php
                            }
                            if (is_user_permitted("templateadmin")) { $firsttab = $firsttab != null ? $firsttab :  'templates_list()'?>
                            <button type="button" class="xerte_button" onclick="javascript:templates_list();"><i class="fa fa-file-code-o"></i> <?PHP echo MANAGEMENT_MENUBAR_CENTRAL; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("templateadmin")) { $firsttab = $firsttab != null ? $firsttab :  'themes_list()'?>
                                <button type="button" class="xerte_button" onclick="javascript:themes_list();"><i class="fa fa-file-code-o"></i> <?PHP echo MANAGEMENT_MENUBAR_THEMES; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("useradmin")) {  $firsttab = $firsttab != null ? $firsttab :  'users_list()' ?>
                            <button type="button" class="xerte_button" onclick="javascript:users_list();"><i class="fa fa-users-cog"></i> <?PHP echo MANAGEMENT_MENUBAR_USERS; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("useradmin")) { $firsttab = $firsttab != null ? $firsttab :  'user_groups_list()' ?>
                            <button type="button" class="xerte_button" onclick="javascript:user_groups_list();"><i class="fa fa-users"></i> <?PHP echo MANAGEMENT_MENUBAR_USER_GROUPS; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("projectadmin")) { $firsttab = $firsttab != null ? $firsttab :  'user_templates_list()' ?>
                            <button type="button" class="xerte_button" onclick="javascript:user_templates_list();"><i class="far fa-file-alt"></i> <?PHP echo MANAGEMENT_MENUBAR_TEMPLATES; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("system")) { $firsttab = $firsttab != null ? $firsttab :  'errors_list()' ?>
                            <button type="button" class="xerte_button" onclick="javascript:errors_list();"><i class="fa fa-exclamation-triangle"></i> <?PHP echo MANAGEMENT_MENUBAR_LOGS; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("system")) { $firsttab = $firsttab != null ? $firsttab :  'play_security_list()' ?>
                            <button type="button" class="xerte_button" onclick="javascript:play_security_list();"><i class="fa fa-key"></i> <?PHP echo MANAGEMENT_MENUBAR_PLAY; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("metaadmin")) { $firsttab = $firsttab != null ? $firsttab :  'categories_list()' ?>
                            <button type="button" class="xerte_button" onclick="javascript:categories_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_CATEGORIES; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("metaadmin")) { $firsttab = $firsttab != null ? $firsttab :  'educationlevel_list()' ?>
                            <button type="button" class="xerte_button" onclick="javascript:educationlevel_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_EDUCATION; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("metaadmin")) { $firsttab = $firsttab != null ? $firsttab :  'grouping_list()' ?>
                            <button type="button" class="xerte_button" onclick="javascript:grouping_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_GROUPINGS; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("metaadmin")) { $firsttab = $firsttab != null ? $firsttab :  'course_list()' ?>
                            <button type="button" class="xerte_button" onclick="javascript:course_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_COURSES; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("system")) { $firsttab = $firsttab != null ? $firsttab :  'licenses_list()' ?>
                            <button type="button" class="xerte_button" onclick="javascript:licenses_list();"><i class="fa fa-cc"></i> <?PHP echo MANAGEMENT_MENUBAR_LICENCES; ?>	</button>
                                <?php
                            }
                            if (is_user_permitted("system")) { $firsttab = $firsttab != null ? $firsttab :  'feeds_list()' ?>
                            <button type="button" class="xerte_button" onclick="javascript:feeds_list();"><i class="fa fa-rss"></i> <?PHP echo MANAGEMENT_MENUBAR_FEEDS; ?>	</button> <!--style="margin-right:10px;"-->
                            <?php
                            }
                            ?>
                        </div>
                        <div class="admin_mgt_area_middle_button_right">
                            <button type="button" class="xerte_button" onclick="javascript:save_changes()"><i class="fa fa-floppy-o"></i> <?PHP echo MANAGEMENT_MENUBAR_SAVE; ?></button>
                        </div>
                        <div id="admin_area">
                            <?php if (isset($_SESSION['toolkits_logon_id']) && $_SESSION['toolkits_logon_id'] !== 'site_administrator' && count(getRolesFromUser($_SESSION['toolkits_logon_id'])) == 0) {
                                echo MANAGEMENT_NEW_ROLES_ADDED_LOGIN_AS_ADMIN;
                            }
                            ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <?PHP
		}else{
			$_SESSION['toManagement'] = true;
			header("location: index.php");
			exit();
		}
		?>
        <script type="application/javascript">
            const firsttab = "<?php echo $firsttab; ?>";
        </script>
    </body>
</html>
