<?php

   /**
	*
	* upload page, used by xerte to upload a file
	*
	* @author Patrick Lockley, tweaked by John Smith, GCU
	* @version 1.2
	* @copyright Copyright (c) 2008,2009 University of Nottingham
	* @package
	*/



   /**
	*
	* Spoof the session if we are using Firefox
	* Gets around the Flash Cookie Bug
	*
	*/
	if ($_GET['BROWSER'] == 'firefox' || $_GET['BROWSER'] == 'safari') {
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
	}


   /**
	*	Now bring in config.php
	*/
	require_once("../../../config.php");



   /**
	*	Now we check that the session has a valid, logged in user
	*/
	if(!isset($_SESSION['toolkits_logon_username'])) {
		receive_message('admin', "ADMIN", "CRITICAL", "Session not found during file upload" , "Session not found during file upload");
		exit();
	}



   /**
	*  Next we will check our blacklist of extensions
	*  This is really not very effective - will be replaced by whitelist
	*    and mimetype detection - feel free to add to this list
	*/
	$blacklist = explode(',', 'php,php5,pl,cgi,exe,vbs,pif,application,gadget,msi,msp,com,scr,hta,htaccess,ini,cpl,msc,jar,bat,cmd,vb,vbe,jsp,jse,ws,wsf,wsc,wsh,ps1,ps1xml,ps2,ps2xml,psc1,psc2,msh,msh1,msh2,mshxml,msh1xml,msh2xml,scf,lnk,inf,reg,docm,dotm,xlsm,xltm,xlam,pptm,potm,ppam,ppsm,sldm');
	$extension = strtolower(pathinfo($_FILES['Filedata']['name'], PATHINFO_EXTENSION));
	if (in_array($extension, $blacklist)) {
		receive_message($_SESSION['toolkits_logon_username'], "UPLOAD", "CRITICAL", "Invalid filetype: " . $extension , "Invalid filetype: " . $extension);
		exit();
	}



   /**
	*  These checks remain from R708
	*/
	$pass = true;
	if (strpos($_FILES['Filedata']['name'], '../') !== false) $pass = false;
	if (strpos($_FILES['Filedata']['name'], '...') !== false) $pass = false;

	if ($pass === false){
		receive_message($_SESSION['toolkits_logon_username'], "UPLOAD", "CRITICAL", "Invalid filename: " . $_FILES['Filedata']['name'] , "Invalid filename: " . $_FILES['Filedata']['name']);
		exit();
	}


   /**
	*  Passed all the checks so lets try to write the file - to temp file if mp4 or m4v extension
	*/
	$moov_temp_file_name = $xerte_toolkits_site->root_file_path . $_GET['path'] . 'process_moov.temp';
	if ($extension == 'mp4' || $extension == 'm4v') {
		$new_file_name = $moov_temp_file_name;
	}
	else {
		$new_file_name = $xerte_toolkits_site->root_file_path . $_GET['path'] . $_FILES['Filedata']['name'];
	}
	if(!move_uploaded_file($_FILES['Filedata']['tmp_name'], $new_file_name)) {
		receive_message($_SESSION['toolkits_logon_username'], "UPLOAD", "CRITICAL", "Error saving file: " . $new_file_name , "Error saving file: " . error_get_last());
		exit();
	}



   /**
	*  Relocate moov atom if file is .mp4/m4v to support progressive download
	*/
	if ($extension == 'mp4' || $extension == 'm4v') {
		$error = true;
		require_once '../../../library/MoovRelocator/Moovrelocator.class.php';

		$moovrelocator = Moovrelocator::getInstance();

		$new_file_name = $xerte_toolkits_site->root_file_path . $_GET['path'] . $_FILES['Filedata']['name'];
		if ($moovrelocator->setInput($moov_temp_file_name) === true) {
			if ($moovrelocator->setOutput($new_file_name) === true) {
				if ((($result = $moovrelocator->fix()) === true)) {
					receive_message($_SESSION['toolkits_logon_username'], "MOOVRELOCATE", "SUCCESS", "Moov successfully rewritten" , "File: " . $new_file_name);
					$error = false;
				}
				else {
					receive_message($_SESSION['toolkits_logon_username'], "UPLOAD", "SUCCESS", "MP4 uploaded with moov in correct place" , "File: " . $new_file_name);
				}
			}
			else {
				receive_message($_SESSION['toolkits_logon_username'], "MOOVRELOCATE", "WARNING", "Couldn't open output file" , $new_file_name);
			}
		}
		else {
			receive_message($_SESSION['toolkits_logon_username'], "MOOVRELOCATE", "WARNING", "Couldn't open input file" , $moov_temp_file_name);
		}

		if ($error == true) {
			if(!copy($moov_temp_file_name, $new_file_name)) {
					receive_message($_SESSION['toolkits_logon_username'], "UPLOAD", "CRITICAL", "Copy temp file failed" . error_get_last() , "Copy temp file failed" . error_get_last());
					exit();
			}
		}
	}



   /**
	*  Tidy up temporary files - destroy file handle first to avoid 'Permission Denied' error
	*/
	$moovrelocator->__destruct();
	if (!@unlink($moov_temp_file_name)) {
		receive_message($_SESSION['toolkits_logon_username'], "UPLOAD", "CRITICAL", "Unable to delete temporary file: " . $moov_temp_file_name , error_get_last());
	}