<?php
/**
 *
 * upload page, used by xerte to upload a file
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

// Left in for now but restricted to only development mode
global $development;
if ($development == true) {
	file_put_contents('test.txt', var_export($_SESSION,TRUE));
}

if(!isset($_SESSION['toolkits_logon_username'])) {
  print "You are not logged in";
  exit(); // ?? Why was this commented out in the v1.9 release ??
}

// Perhaps this whitelist should be moved to management.php or config.php??
$media_whilelist = 'flv,mp4,mp3,jpg,jpeg,gif,png,swf'; // Pat's Wordpress list

// Make sure extension is in the whitelist
$pass = false;
$allowed = explode(',', $media_whilelist);
$extension = strtolower(pathinfo($_FILES['Filedata']['name'], PATHINFO_EXTENSION));
foreach($allowed as $ext) {
	if ($ext == $extension) {
		$pass = true;
		break;
	}
}

// Not sure if we still need these but left in for now
if (strpos($_FILES['Filedata']['name'], '../') !== false) $pass = false;
if (strpos($_FILES['Filedata']['name'], '.exe') !== false) $pass = false;
if (strpos($_FILES['Filedata']['name'], '...') !== false) $pass = false;

// Block all files that haven't met the criteria
if ($pass === false) {
  print "Invalid File Name";
  exit();
}

$new_file_name = $xerte_toolkits_site->root_file_path . $_GET['path'] . $_FILES['Filedata']['name'];

if(move_uploaded_file($_FILES['Filedata']['tmp_name'], $new_file_name)) {

}
else {

}
