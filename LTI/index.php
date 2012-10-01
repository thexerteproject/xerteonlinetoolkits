<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Simon Atack
 * Date: 21/09/12
 * Time: 15:01
 * LTI Landing page.
 */


require_once(__DIR__ . "/../config.php");

_load_language_file("/index.inc");

require_once '../' . $xerte_toolkits_site->php_library_path . "display_library.php";
require_once '../' . $xerte_toolkits_site->php_library_path . "url_library.php";


$mysql_id = database_connect("LTI database connect success", "LTI database connect fail");


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


require_once('ims-lti/UoN_LTI.php');

function auth($update = false) {
  global $success, $errors, $authmech, $lti;

  $returnedproc = login_processing(false);
  list($success, $errors) = $returnedproc;
  if ($success && empty($errors)) {
    if ($update) {
      $lti->update_lti_user();
    } else {
      $lti->add_lti_user($authmech->getUsername());
    }
    login_processing2();
    //sucessfull authentication
  } else {
    html_headers();
    login_prompt($errors, '../');
  }
}

$mysqli = new mysqli($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password, $xerte_toolkits_site->database_name);
if ($mysqli->error) {
  try {
    throw new Exception("0MySQL error $mysqli->error <br> Query:<br> $query", $mysqli->errno);
  }
  catch (Exception $e) {
    echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
    echo nl2br($e->getTraceAsString());
  }
}

if (strlen($xerte_toolkits_site->database_table_prefix) > 0) {
  $lti = new UoN_LTI($mysqli, array('table_prefix' => $xerte_toolkits_site->database_table_prefix));
} else {
  $lti = new UoN_LTI($mysqli);
}

require_once '../' . $xerte_toolkits_site->php_library_path . "login_library.php";

$lti->init_lti();

$errors = array();

if (!$lti->valid) {
  echo 'ERROR INVALID LTI<br>';
  echo $lti->message;
  echo '<br>';
  exit();
}


//LTI launch valid


//lookup the lti user association
$returned = $lti->lookup_lti_user();


  if ($returned === false) {
//user hasnt authenticated before need authentication




      // post so check login
      $returnedproc = login_processing(false);
    list($success, $errors) = $returnedproc;
    if ($success && empty($errors)) {
      auth();
      login_processing2();
      //sucessfull authentication
    } else {
      html_headers();
      login_prompt($errors, '../');
      exit();
    }


  } else {
    $time1 = strtotime($returned[1]);
    $time2 = time();
    $timediff = $time2 - $time1;
    $needreauth = false;
    // reauthenticate after 15 weeks ( 60 seconds * 60 mins = 1 hour * 24 hours = 1 day * 7 days = 1 week * 15 = 15 weeks )
    if ($timediff > (60 * 60 * 24 * 7 * 15)) {
      //if ($timediff > (60 * 60 * 1)) {
      $needreauth = true;
    }

    //if needreauth then do authentication again else  $returned[0] has the user in it do appropriate things

    if ($needreauth) {
      auth(true);
    }
    require_once '../' . $xerte_toolkits_site->php_library_path . '/user_library.php';
    $data = get_user_info();

    login_processing2($data[0], $data[1], $data[2]);
    update_user_logon_time();
  }

// if xerteID set then store the associated data

  if (isset($_REQUEST['xerteID'])) {
    $retlookup = $_SESSION['postlookup'][$_REQUEST['xerteID']];
    unset($_SESSION['postlookup']);
    if ($retlookup > 0) {
      //$info = $lti->getResourceKey(1);
      $lti->add_lti_resource($retlookup, 'xerte');
    }
  }


  $returned = $lti->lookup_lti_resource();

if (!$lti->isInstructor()) {
  //student
  if ($returned === false) {
    //no link stored display error message
    echo "not setup";

    exit();
  }
  //display a redirect to appropriate page

  $returned=$lti->lookup_lti_resource();
  $template_id=$returned[0];
  $loc=$xerte_toolkits_site->site_url . url_return("play", $template_id);

  header("location: ". $loc);
  echo "Please click <a href=\"$loc\">here</a> to continue";
  exit();


} else {
  //staff
  if ($returned !== false) {

      //link exists
      //
      // do same as student

      //display a redirect to appropriate page

        $returned=$lti->lookup_lti_resource();
      $template_id=$returned[0];
      $loc=$xerte_toolkits_site->site_url . url_return("play", $template_id);

      header("location: ". $loc);
      echo "Please click <a href=\"$loc\">here</a> to continue";
      exit();

    }
  else {


    // display xerte object so a new one can be selected
    html_headers();

    print <<<END



		<div style="width: 450px; float: left;">
				<div class="demoHeader">Instructions</div>
				<div style="font-size:14px;margin:10px;font-weight:bold;"></div>
<div style="margin:10px;">
<p>Please click the Project you wish this link to be associated with, and then click the Select button.  It will then jump to this project, you may need to make sure the access property is changed to public.</p>  <p>If you wish to create a new Project then you will need to open a new window and goto <a href="{$xerte_toolkits_site->site_url}" target="_blank">{$xerte_toolkits_site->site_url}</a> and then after this is done you will need to reclick the link that sent you here.</p>
</div>
				<div id="footer"></div>
		</div>
		<div style="width: 450px; float: left;">
			<div class="demoHeader">
			<p><img style=vertical-align:middle"  src="{$xerte_toolkits_site->site_url}/website_code/images/folder_workspace.gif"/>Workspace</p>
			</div>

			<div id="demoParent">
				<div style="overflow: auto;" id="demoDIV"><div>






END;







    require_once '../' .  $xerte_toolkits_site->php_library_path . "display_library.php";

    echo "<form method=\"post\">";

    //echo "<div class=\"folder\" id=\"folder_workspace\" ondblclick=\"folder_open_close(this)\" onclick=\"highlight_main_toggle(this)\">";



   //echo "</div>\r\n<div id=\"folderchild_workspace\" class=\"workspace\">";


    $level = 1;
    $item=1;



    $item=list_folder_contents_event_free(get_user_root_folder(),'../',$item,'radio');

print <<<END
</div></div>
			</div>
			<div class="demoHeader"></div>

			<div id="styleDIV">
<input type="submit" name="submit" value="Select"></form>
			</div>
		</div>
		<div style="clear:both;"></div>



		<div style="clear:both;"></div>
	</div>

END;

  }
}



