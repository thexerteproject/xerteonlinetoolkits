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
/**
 *
 * login library, code for login
 *
 * @author Patrick Lockley code moved to this library & Simon Atack
 * @version 1.0
 * @package
 */
require_once(dirname(__FILE__) . "/language_library.php");
_load_language_file("/index.inc");

// this is now only used by LTI/index
function html_headers_lti() {
  global $xerte_toolkits_site;
?>
<!DOCTYPE html>
<html><head>

        <!--
        HTML to use to set up the template management page
        Version 1.0
    -->

  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>$xerte_toolkits_site->site_title</title>

  <link href="../website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
  <link href="../website_code/styles/folder_popup.css" media="screen" type="text/css" rel="stylesheet" />
  <?php
  if (file_exists($xerte_toolkits_site->root_file_path . "branding/branding.css"))
  {
     ?>
     <link href='branding/branding.css' rel='stylesheet' type='text/css'>
     <?php
  }

  _include_javascript_file("website_code/scripts/file_system.js");
  _include_javascript_file("website_code/scripts/screen_display.js");
  _include_javascript_file("website_code/scripts/ajax_management.js");
  _include_javascript_file("website_code/scripts/folders.js");
  _include_javascript_file("website_code/scripts/template_management.js");
  _include_javascript_file("website_code/scripts/import.js");
  _include_javascript_file("website_code/scripts/logout.js");

  print <<<END
  	<style type="text/css">
	body
	{
	font-family:verdana;
	font-size:12px;
	}
	#playitcontainer
	{
	width:900px;
	background-color:#e5eecc;
	border:1px solid #98bf21;
	margin:auto;
	display:none;
	}
	#enlargecssprop
	{
	font-weight:bold;
	font-size:14px;
	color:#000000;
	}
	#demoDIV
	{
	margin-left:10px;
	margin-top:3px;
	background-color:#ffffff;
	border:1px solid #c3c3c3;
	height:280px;
	width:430px;
	overflow:visible;
	}
	#styleDIV
	{
	font-family:courier new;
	margin-left:10px;
	width:424px;
	padding:3px;
	}
	div.demoHeader
	{
	font-size:14px;
	margin-top:5px;
	margin-left:5px;
	margin-bottom:2px;
	color:#617f10;
	}
	div.playitFooter
	{
	font-size:13px;
	color:#617f10;
	padding:10px;
	}
	#footer
	{
	margin:15px;
	}
	</style>
        </head>
        <body>
END;

    echo '<div class="topbar">';
    echo '<div style="width:50%; height:100%; float:right; position:relative; background-image:url("website_code/images/apereoLogo.png"); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">';
    echo '     <p style="float:right; margin:0px; color:#a01a13;"><a href="javascript:logout()" style="color:#a01a13">';
  //     echo INDEX_LOG_OUT;
    echo '      </a></p>';
    echo '  </div>';
    echo '  <img src="website_code/images/logo.png" style="margin-left:10px; float:left" />';
    echo '</div>';
  print <<<END
        <!--
            Main part of the page
        -->
               <div class="pagecontainer">
    	<div style="display: block;" id="playitcontainer">
END;
}

// this is now only used by LTI/index
function login_prompt_lti($messages, $extra_path = '') {
  ?>
            <div class="top_left sign_in_TL m_b_d_2_child" style="background-color:#f3eee2;">
                <div class="top_right sign_in_TR m_b_d_2_child">
                    <div class="bottom_left sign_in_BL m_b_d_2_child">
  <div class="bottom_right sign_in_BR m_b_d_2_child">
                            <p>
                              <?PHP echo INDEX_LOGIN; ?>
                            </p>
                            <div>

                                <form method="post" enctype="application/x-www-form-urlencoded" ><p><?php echo INDEX_USERNAME; ?> <input type="text" size="20" maxlength="100" name="login" id="login_box"/></p><p><?PHP echo INDEX_PASSWORD; ?> <input type="password" size="20" maxlength="100" name="password" /></p><p style="clear:left; width:95%; padding-bottom:15px;"><button type="submit" class="xerte_button"  style="float:right"><i class="fa fa-sign-in"></i> <?php echo INDEX_BUTTON_LOGIN; ?></button></p></form>
                                <script>   document.getElementById("login_box").focus();      </script>
                              <?php
                              if (!empty($messages)) {
                                echo "<ul class='error'>";

                                foreach ($messages as $message) {
                                  echo "<li class='error'>" . $message . "</li>";
                                }
                                echo "</ul>";
                              }
                              ?>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
                                <?php

}



function login_prompt($messages, $xerte_toolkits_site) {
  ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?PHP echo INDEX_PSWD_TITLE; ?></title>

    <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
    <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
    <!-- link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css" -->
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v4-shims.min.css">
    <?php
    if (file_exists($xerte_toolkits_site->root_file_path . "branding/branding.css"))
    {
    ?>
        <link href='branding/branding.css' rel='stylesheet' type='text/css'>
    <?php
    }
    ?>
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
            style="width:50%; height:100%; float:right; position:relative; background-image:url('website_code/images/apereoLogo.png'); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
        </div>
    <?php
    }
    if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_left.png"))
    {
        ?>
        <img src="branding/logo_left.png" style="margin-left:10px; float:left" alt="<?php echo INDEX_LOGO_ALT; ?>"/>
    <?php
    }
    else {
        ?>
        <img src="website_code/images/logo.png" style="margin-left:10px; float:left" alt="<?php echo INDEX_LOGO_ALT; ?>"/>
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
			<div style="margin:0 7px 4px 0"><?PHP echo INDEX_PSWD_LOGIN; ?>:</div>
            <form method="post" enctype="application/x-www-form-urlencoded" >
                <p style="margin:4px"><label for="login_box"><?php echo INDEX_USERNAME; ?>:</label>
                <input class="xerte_input_box" type="text" size="20" maxlength="100" name="login" id="login_box"/></p>
                <p style="margin:4px"><label for="password"><?PHP echo INDEX_PASSWORD; ?>:</label>
                <input class="xerte_input_box" type="password" size="20" maxlength="100" name="password" id="password" /></p>
                <button type="submit" class="xerte_button" style="margin:0 3px 0 0"><i class="fa fa-sign-in"></i> <?php echo INDEX_BUTTON_LOGIN; ?></button>
            </form>
            <script>document.getElementById("login_box").focus();      </script>
        </div>
    </div>
    <div style="clear:both;"></div>

</main>
<div class="bottompart">
	<div class="border">
	</div>
	<footer>
		<p class="copyright">
			<?php echo $xerte_toolkits_site->copyright; ?> <i class="fa fa-info-circle" aria-hidden="true" style="color:#f86718; cursor: help;" title="<?PHP $vtext = "version.txt";$lines = file($vtext);echo $lines[0];?>"></i>
		</p>
		<div class="footerlogos">
			<a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" title="Xerte accessibility statement https://xot.xerte.org.uk/play.php?template_id=214"><img src="website_code/images/wcag2.2AA-blue.png" border="0" alt="<?php echo INDEX_WCAG_LOGO_ALT; ?>"></a><a href="https://opensource.org/" target="_blank" title="Open Source Initiative: https://opensource.org/"><img src="website_code/images/osiFooterLogo.png" border="0" alt="<?php echo INDEX_OSI_LOGO_ALT; ?>"></a><a href="https://www.apereo.org" target="_blank" title="Apereo: https://www.apereo.org"><img src="website_code/images/apereoFooterLogo.png" border="0" alt="<?php echo INDEX_APEREO_LOGO_ALT; ?>"></a><a href="https://xerte.org.uk" target="_blank" title="Xerte: https://xerte.org.uk"><img src="website_code/images/xerteFooterLogo.png" border="0" alt="<?php echo INDEX_XERTE_LOGO_ALT; ?>"></a>
		</div>
	</footer>
</div>
</body>
</html>
                                <?php

}

function login_form($messages, $xerte_toolkits_site)
{

  ?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?PHP echo $xerte_toolkits_site->site_title; ?></title>

    <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
    <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
    <!-- link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css" -->
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v4-shims.min.css">
    <?php
    if (file_exists($xerte_toolkits_site->root_file_path . "branding/branding.css"))
    {
    ?>
        <link href='branding/branding.css' rel='stylesheet' type='text/css'>
    <?php
    }
    ?>
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
            style="width:50%; height:100%; float:right; position:relative; background-image:url('website_code/images/apereoLogo.png'); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
        </div>
    <?php
    }
    if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_left.png"))
    {
        ?>
        <img src="branding/logo_left.png" style="margin-left:10px; float:left" alt="<?php echo INDEX_LOGO_ALT; ?>"/>
    <?php
    }
    else {
        ?>
        <img src="website_code/images/logo.png" style="margin-left:10px; float:left" alt="<?php echo INDEX_LOGO_ALT; ?>"/>
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
            <div style="margin:0 7px 4px 0"><?php display_language_selectionform("", true);?></div>
            <form method="post" enctype="application/x-www-form-urlencoded" >
                <p style="margin:4px"><label for="login_box"><?php echo INDEX_USERNAME; ?>:</label>
                <input class="xerte_input_box" type="text" size="20" maxlength="100" name="login" id="login_box"/></p>
                <p style="margin:4px"><label for="password"><?PHP echo INDEX_PASSWORD; ?>:</label>
                <input class="xerte_input_box" type="password" size="20" maxlength="100" name="password" id="password" /></p>
                <button type="submit" class="xerte_button" style="margin:0 3px 0 0"><i class="fa fa-sign-in"></i> <?php echo INDEX_BUTTON_LOGIN; ?></button>
            </form>
            <script>document.getElementById("login_box").focus();      </script>
        </div>
    </div>
    <div style="clear:both;"></div>
    <?php if (strlen($xerte_toolkits_site->tutorial_text) > 0) {
        echo "<div class=\"tutorials\">";
        echo  $xerte_toolkits_site->tutorial_text;
        echo "</div>";
    } ?>

</main>
<div class="bottompart">
<section>
	<h1 class="news_title">
		<?PHP echo INDEX_HELP_TITLE; ?>
	</h1>
	<p class="news_story">
		<?php echo INDEX_HELP_INTRODUCTION; ?><br/><br/>
		<button type="button" class="xerte_button" onClick="window.open('<?php echo $xerte_toolkits_site->demonstration_page; ?>','_blank');"><?php echo INDEX_HELP_INTRO_LINK_TEXT; ?></button>
	</p>
	</section>
	<div class="border">
	</div>
	<footer>
		<p class="copyright">
			<?php echo $xerte_toolkits_site->copyright; ?> <i class="fa fa-info-circle" aria-hidden="true" style="color:#f86718; cursor: help;" title="<?PHP $vtext = "version.txt";$lines = file($vtext);echo $lines[0];?>"></i>
		</p>
		<div class="footerlogos">
			<a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" title="Xerte accessibility statement https://xot.xerte.org.uk/play.php?template_id=214"><img src="website_code/images/wcag2.2AA-blue.png" border="0" alt="<?php echo INDEX_WCAG_LOGO_ALT; ?>"></a><a href="https://opensource.org/" target="_blank" title="Open Source Initiative: https://opensource.org/"><img src="website_code/images/osiFooterLogo.png" border="0" alt="<?php echo INDEX_OSI_LOGO_ALT; ?>"></a><a href="https://www.apereo.org" target="_blank" title="Apereo: https://www.apereo.org"><img src="website_code/images/apereoFooterLogo.png" border="0" alt="<?php echo INDEX_APEREO_LOGO_ALT; ?>"></a><a href="https://xerte.org.uk" target="_blank" title="Xerte: https://xerte.org.uk"><img src="website_code/images/xerteFooterLogo.png" border="0" alt="<?php echo INDEX_XERTE_LOGO_ALT; ?>"></a>
		</div>
	</footer>
</div>
</body>
</html>
<?php
}

function login_processing($exit = true) {
  global $errors, $authmech, $xerte_toolkits_site;

  /**
   *  Check to see if anything has been posted to distinguish between log in attempts
   */
  _debug("login_processing: " . $xerte_toolkits_site->authentication_method);
  $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
  // check if already logged in
  if (isset($_SESSION['toolkits_logon_id']) && $_SESSION['toolkits_logon_id'] !== "") {
    return array(true, array());
  }
  if ($authmech->needsLogin()) {
   /**
    *  Check if we are logged in
    */
    if (isset($_SESSION['toolkits_logon_username']) && !isset($_POST['login']))
    {
        return array(true, array());
    }

    /**
     *
     * Check if setting language
     */
    if(isset($_POST['language']))
    {
        login_form($errors, $xerte_toolkits_site);
        exit(0);
    }

    /**
     * Username and password left empty
     */
    if (empty($_POST["login"]) && empty($_POST["password"])) {
      $errors[] = INDEX_USERNAME_AND_PASSWORD_EMPTY;
      /*
      * Username left empty
      */
    } else if (empty($_POST["login"])) {
      $errors[] = INDEX_USERNAME_EMPTY;

      /*
      * Password left empty
      */
    } else if (empty($_POST["password"])) {
      $errors[] = INDEX_PASSWORD_EMPTY;
    }

    if (!empty($_POST['login']) && ($_POST["login"] == $xerte_toolkits_site->admin_username) && (!empty($_POST['password']) && hash('sha256', $_POST["password"]) == $xerte_toolkits_site->admin_password)) {
        $_SESSION['toolkits_logon_id'] = "site_administrator";
        $_SESSION['toolkits_logon_username'] = $xerte_toolkits_site->admin_username;
        $_SESSION['toolkits_firstname'] = "Admin";
        $_SESSION['toolkits_surname'] = "User";
        $success = true;
        session_regenerate_id(true);
    }
    else {
        $success = false;
        if (empty($errors)) {
            try {
                $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
            } catch (InvalidArgumentException $e) {
                $errors[] = "Invalid authentication choice; check config.php (authentication_method)";
            }
            if (empty($errors)) {
                if ($authmech->check()) {
                    $success = $authmech->login($_POST['login'], $_POST['password']);
                    if ($success && $xerte_toolkits_site->authentication_method != "Moodle") {
                        session_regenerate_id(true);
                    }
                }
                $errors = $authmech->getErrors();
            }
        }
    }

    if ($exit === true) {
      if (!$success || !empty($errors)) {
        if (in_array(INDEX_USERNAME_AND_PASSWORD_EMPTY, $errors) == false) {
          $msg = "User '" . $_POST['login'] . "' attempted to login from " . $_SERVER['REMOTE_ADDR'];
          receive_message("", "SYSTEM", "LOGINS", "Failed login", $msg);
        }

        login_form($errors, $xerte_toolkits_site);
        exit(0);
      }
    } else {
      //not exit
      return(array($success, $errors));
    }
  }


}

function login_processing2($firstname = false, $surname = false, $username = false) {
  global $authmech, $errors,$xerte_toolkits_site;

  if (!isset($_SESSION['toolkits_logon_id']) || $_SESSION['toolkits_logon_id'] !== "site_administrator") {
      if (!isset($_SESSION['toolkits_logon_username'])) {
          $_SESSION['toolkits_firstname'] = $firstname == false ? $authmech->getFirstname() : $firstname;
          $_SESSION['toolkits_surname'] = $surname == false ? $authmech->getSurname() : $surname;
          $_SESSION['toolkits_logon_username'] = $username == false ? $authmech->getUsername() : $username;
      }

      require_once dirname(__FILE__) . '/user_library.php';


      /*
      * Check to see if this is a users' first time on the site
      */

      if (check_if_first_time($_SESSION['toolkits_logon_username'])) {

          /*
           *      create the user a new id
           */

          $_SESSION['toolkits_logon_id'] = create_user_id($_SESSION['toolkits_logon_username'], $_SESSION['toolkits_firstname'], $_SESSION['toolkits_surname']);

          /*
           *   create a virtual root folder for this user
           */

          create_a_virtual_root_folder();
      } else {

          /*
           * User exists so update the user settings
           */

          $_SESSION['toolkits_logon_id'] = get_user_id();

          update_user_logon_time();
      }
  }
  $msg = "User " . $_SESSION['toolkits_logon_username'] . " logged in successfully from " . $_SERVER['REMOTE_ADDR'];
  receive_message($_SESSION['toolkits_logon_username'], "SYSTEM", "LOGINS", "Successful login", $msg);
}


