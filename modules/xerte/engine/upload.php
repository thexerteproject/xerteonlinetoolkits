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
	 *	Tell server to use session from the querystring, in case we are in Firefox
	 */
	if ( strpos($_SERVER['QUERY_STRING'], "&") != false ) {
		$parts = explode("&", $_SERVER['QUERY_STRING']);
		session_id($parts[1]);
		session_start();
	}



	/**
	 *	Now bring in config.php
	 */
	require_once("../../../config.php");



	/**
	 *	Now we check that the session has a valid, logged in user
	 */
	if(!isset($_SESSION['toolkits_logon_username'])) {
		exit();
	}



	/**
	 *  Next we will check our blacklist of extensions
	 *  This is really not very effective - will be replaced by whitelist
	 *    and mimetype detection - feel free to add to this list
	 */
	$blacklist = explode(',', 'php,php5,pl,cgi,exe,vbs,pif,application,gadget,msi,msp,com,scr,hta,htaccess,ini,cpl,msc,jar,bat,cmd,vb,vbe,js,jse,ws,wsf,wsc,wsh,ps1,ps1xml,ps2,ps2xml,psc1,psc2,msh,msh1,msh2,mshxml,msh1xml,msh2xml,scf,lnk,inf,reg,docm,dotm,xlsm,xltm,xlam,pptm,potm,ppam,ppsm,sldm');
	$ext = strtolower(pathinfo($_FILES['Filedata']['name'], PATHINFO_EXTENSION));
	if (in_array($ext, $blacklist)) {
		exit();
	}



	// Not sure if we still need these but left in for now
	if (strpos($_FILES['Filedata']['name'], '../') !== false) exit();
	if (strpos($_FILES['Filedata']['name'], '...') !== false) exit();



	/**
	 *	If we get here then we have passed all the tests, so try to save the file
	 */
	$new_file_name = $xerte_toolkits_site->root_file_path . $_GET['path'] . $_FILES['Filedata']['name'];
	move_uploaded_file($_FILES['Filedata']['tmp_name'], $new_file_name);
