<?php
/**
 *
 * login library, code for login
 *
 * @author Patrick Lockley code moved to this library & Simon Atack
 * @version 1.0
 * @copyright Copyright (c) 2008,2009,2012 University of Nottingham
 * @package
 */

_load_language_file("/index.inc");

function html_headers() {
  global $xerte_toolkits_site;

  print <<<END
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html><head>

        <!--

    University of Nottingham Xerte Online Toolkits

        HTML to use to set up the template management page

        Version 1.0

    -->

        <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
        <title>$xerte_toolkits_site->site_title</title>

        <link href="../website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
        <link href="../website_code/styles/folder_popup.css" media="screen" type="text/css" rel="stylesheet" />
END;
  _include_javascript_file("../website_code/scripts/file_system.js");
  _include_javascript_file("../website_code/scripts/screen_display.js");
  _include_javascript_file("../website_code/scripts/ajax_management.js");
  _include_javascript_file("../website_code/scripts/folders.js");
  _include_javascript_file("../website_code/scripts/template_management.js");
  _include_javascript_file("../website_code/scripts/import.js");
  _include_javascript_file("../website_code/scripts/logout.js");

  print <<<END
  	<style type="text/css">
	body
	{
	font-family:verdana;
	font-size:12px;
	}

	#playitcontainer
	{
	wisdth:900px;
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

        <div class="topbar">
            <div style="width:50%; height:100%; float:right; position:relative; background-image:url(http://www.nottingham.ac.uk/toolkits/website_code/images/UofNLogo.jpg); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                <p style="float:right; margin:0px; color:#a01a13;"><a href="javascript:logout()" style="color:#a01a13">
END;
  //     echo INDEX_LOG_OUT;
  print <<<END
                </a></p>
            </div>
            <img src="../website_code/images/xerteLogo.jpg" style="margin-left:10px; float:left" />
        </div>

        <!--

            Main part of the page

        -->
               <div class="pagecontainer">
    	<div style="display: block;" id="playitcontainer">
END;
}



function login_prompt($messages, $extra_path = '') {
  ?>

            <div class="top_left sign_in_TL m_b_d_2_child" style="background-color:#f3eee2;">
                <div class="top_right sign_in_TR m_b_d_2_child">
                    <div class="bottom_left sign_in_BL m_b_d_2_child">
  <div class="bottom_right sign_in_BR m_b_d_2_child">
                            <p>
                              <?PHP echo INDEX_LOGIN; ?>
                            </p>
                            <div>

                                <form method="post" enctype="application/x-www-form-urlencoded" ><p><?php echo INDEX_USERNAME; ?> <input type="text" size="20" maxlength="100" name="login" id="login_box"/></p><p><?PHP echo INDEX_PASSWORD; ?><input type="password" size="20" maxlength="100" name="password" /></p><p style="clear:left; width:95%; padding-bottom:15px;"><input type="image" src="<?php echo $extra_path; ?>website_code/images/Bttn_LoginOff.gif" onmouseover="this.src='<?php echo $extra_path; ?>website_code/images/Bttn_LoginOn.gif'" onmousedown="this.src='<?php echo $extra_path; ?>website_code/images/Bttn_LoginClick.gif'" onmouseout="this.src='<?php echo $extra_path; ?>website_code/images/Bttn_LoginOff.gif'" style="float:right" /></p></form>
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

function login_form($messages, $xerte_toolkits_site)
{

  ?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
    <img src="<?php echo $xerte_toolkits_site->site_logo; ?>" style="margin-left:10px; float:left" />
    <img src="<?php echo $xerte_toolkits_site->organisational_logo; ?>" style="margin-right:10px; float:right" />

    <form action='' method='GET'>
        <label for="language-selector">Language:</label>
        <select name='language' id="language-selector">
          <?php
          /* I've just specified a random list of possible languages; "Nonsense" is minimal and just there so you can see the login page switch around */
          $languages = array('en-GB' => 'English', 'nl-NL' => 'Nederlands', 'en-XX' => 'Nonsense', 'fr-FR' => 'French', 'es-ES' => 'Spanish', 'it-IT' => 'Italian', 'ca-ES' => "Catalan");



          foreach ($languages as $key => $value) {
            $selected = '';
            if (isset($_SESSION['toolkits_language']) && $_SESSION['toolkits_language'] == $key) {
              $selected = " selected=selected ";
            }
            echo "<option value='{$key}' $selected>{$value}</option>\n";
          }
          ?>
        </select>
        <input type='submit' value='Set language' name='submit'/>
    </form>
</div>
<div class="mainbody">
    <div class="title">
        <p>
          <?PHP echo $xerte_toolkits_site->welcome_message; ?>
        </p>
    </div>
    <div class="mainbody_holder">
        <div class="mainbody_div_2">

<?php
  login_prompt($messages);
?>

            <div class="border"></div>
            <div class="news">
                <p class="news_title">
                  <?PHP echo INDEX_HELP_TITLE; ?>
                </p>
                <p class="news_story">
                  <?php echo INDEX_HELP_INTRODUCTION; ?>
                    <br/>
                    <br/><a href="<?php echo $xerte_toolkits_site->demonstration_page; ?>" target="new"><?php echo INDEX_HELP_INTRO_LINK_TEXT; ?></a>
                </p>
            </div>
            <div class="border"></div>
            <div class="news">
              <?PHP echo $xerte_toolkits_site->news_text; ?>
            </div>

        </div>
        <div class="mainbody_left">
            <div class="tutorials">      </div>
        </div>
        <div class="mainbody_div">
            <p class="intro">
              <?PHP echo $xerte_toolkits_site->site_text; ?>
            </p>
        </div>
    </div>
</div>
<div class="border">
</div>
<p class="copyright">
    <img src="website_code/images/lt_logo.gif" /><br/>
  <?php echo $xerte_toolkits_site->copyright; ?>
</p>
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

  $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);

  if ($_SERVER['REQUEST_METHOD'] !== "POST") {
    if ($authmech->needsLogin() && $exit) {
      login_form($errors, $xerte_toolkits_site);
      exit(0);
    }
  }
  if ($authmech->needsLogin()) {
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


    if (!empty($_POST['login']) && ($_POST["login"] == $xerte_toolkits_site->admin_username) && (!empty($_POST['password']) && $_POST["password"] == $xerte_toolkits_site->admin_password)) {
      $errors[] = INDEX_SITE_ADMIN;
    }

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
        }
        $errors = $authmech->getErrors();
      }
    }


    if ($exit === true) {
      if (!$success || !empty($errors)) {
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

  $_SESSION['toolkits_firstname'] = $firstname == false ? $authmech->getFirstname() : $firstname;
  $_SESSION['toolkits_surname'] = $surname == false ? $authmech->getSurname() : $surname;
  $_SESSION['toolkits_logon_username'] = $username == false ? $authmech->getUsername() : $username;

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