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

_load_language_file("/user_settings.inc");
?><!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>

        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo USER_SETTINGS_PASSWORD_TITLE; ?></title>

        <!-- 
        
        Properties HTML page 
        Version 1.0
        
        -->

        <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
        <link href="website_code/styles/user_settings.css" media="screen" type="text/css" rel="stylesheet" />
        <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
        <script>window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script>
        <script type="text/javascript" src="editor/js/vendor/jquery.ui-1.10.4.js"></script>
        <script type="text/javascript" src="editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js"></script>
        <script type="text/javascript" src="editor/js/vendor/jquery.ui.touch-punch.min.js"></script>

        <script type="text/javascript" language="javascript" src="website_code/scripts/ajax_management.js"></script>

        <script type="text/javascript" language="javascript">

            var site_url = "<?php echo $xerte_toolkits_site->site_url; ?>";
            var ajax_php_path = "website_code/php/";

        </script>
        <script type="text/javascript" language="javascript" src="website_code/scripts/validation.js"></script>
        <?php
        _include_javascript_file("website_code/scripts/import.js");
        _include_javascript_file("website_code/scripts/screen_display.js");
        _include_javascript_file("website_code/scripts/user_settings.js");
        ?>
		<!-- link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome/css/font-awesome.min.css"-->
        <!-- link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css"-->
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


    <body>
        <div class="properties_main">
            <div class="main_area">
                <div>
                    <span id="title">
                        <img src="website_code/images/Icon_Page.gif" style="vertical-align:middle; padding-left:10px;" />
                        <?php echo USER_SETTINGS_PASSWORD_DISPLAY_TITLE; ?>
                    </span>
                </div>
                <div id="data_area">

                    <div id="dynamic_area">
                        <form id="passform">
                            <?php echo '<label for="oldpass">' . USER_SETTINGS_PASSWORD_OLD . '</label><br>'?>
                            <input type='password' id="oldpass"><br>
                            <?php echo '<label for="newpass">' . USER_SETTINGS_PASSWORD_NEW . '</label><br>'?>
                            <input type='password' id="newpass" ><br>
                            <?php echo '<label for="newpassrepeat">' . USER_SETTINGS_PASSWORD_NEW_REPEAT . '</label><br>'?>
                            <input type='password' id="newpassrepeat" ><br>
                            <?php echo "<button type='button' onclick='changePassword(\"". $_SESSION['toolkits_logon_username'] ."\")'>" . USER_SETTINGS_PASSWORD_SUBMIT . "</button>"?>
                        </form>
                        <div id="result"></div>
                    </div>
                    </div>
                </div>
                <div style="clear:both;"></div>
            </div>
            <div style="clear:both;"></div>
        </div>

    </body>
</html>
