<?php

   /**
	*
	* upload page, used by xerte to upload a file
	*
	* @author Patrick Lockley, tweaked by John Smith, GCU
	* @version 1.1
	* @copyright Copyright (c) 2008,2009 University of Nottingham
	* @package
	*/



   /**
	*
	* Spoof the session in case we are using Firefox
	* Gets around the Flash Cookie Bug
	*
	*/
	if ($_GET['AUTH'] == 'moodle') {
		if (!isset($_COOKIE['MoodleSession']) || !isset($_COOKIE['MOODLEID1_'])) {
			$temp = split('; ', $_GET['COOKIE']);
			if (!empty($temp)) {
				$cookie = array();
				foreach($temp as $key => $value) {
					$pair = split('=', $value);
					$cookie[$pair[0]] = $pair[1];
				}
				$_COOKIE = $cookie; // We want to overwrite all
			}
		}
	}
	else {
		if (
			(!isset($_COOKIE['PHPSESSID']) && isset($_GET['PHPSESSID'])) ||
			( isset($_COOKIE['PHPSESSID']) && isset($_GET['PHPSESSID']) && ($_COOKIE['PHPSESSID'] != $_GET['PHPSESSID']))) {
			session_id($_GET['PHPSESSID']);
		}
	}



   /**
	*	Now bring in config.php
	*/
	require_once("../../../config.php");



   /**
	*	Now we check that the session has a valid, logged in user
	*/
	if(!isset($_SESSION['toolkits_logon_username'])) {
		print "You are not logged in";
		exit();
	}



   /**
	*  Next we will check our blacklist of extensions
	*  This is really not very effective - will be replaced by whitelist
	*    and mimetype detection - feel free to add to this list
	*/
	$blacklist = explode(',', 'php,php5,pl,cgi,exe,vbs,pif,application,gadget,msi,msp,com,scr,hta,htaccess,ini,cpl,msc,jar,bat,cmd,vb,vbe,js,jse,ws,wsf,wsc,wsh,ps1,ps1xml,ps2,ps2xml,psc1,psc2,msh,msh1,msh2,mshxml,msh1xml,msh2xml,scf,lnk,inf,reg,docm,dotm,xlsm,xltm,xlam,pptm,potm,ppam,ppsm,sldm');
	$extension = strtolower(pathinfo($_FILES['Filedata']['name'], PATHINFO_EXTENSION));
	if (in_array($extension, $blacklist)) {
		print "Invalid filetype";
		exit();
	}



   /**
	*  These checks remain from R708
	*/
	$pass = true;
	if (strpos($_FILES['Filedata']['name'], '../') !== false) $pass = false;
	if (strpos($_FILES['Filedata']['name'], '...') !== false) $pass = false;

	if ($pass === false){
	  print "Invalid filename";
	  exit();
	}



   /**
	*  Passed all the checks so lets try to write the file
	*/
	$new_file_name = $xerte_toolkits_site->root_file_path . $_GET['path'] . $_FILES['Filedata']['name'];
	if(move_uploaded_file($_FILES['Filedata']['tmp_name'], $new_file_name)){
		// OK!!
	}
	else {
		print "Save file failed";
		exit();
	}
