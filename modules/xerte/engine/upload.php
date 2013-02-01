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

file_put_contents('test.txt',var_export($_SESSION,TRUE));

if(!isset($_SESSION['toolkits_logon_username'])) {
  print "You are not logged in.";
 // exit();
}

// SECURITY / TODO / XXX - someone can use this to upload an arbitrary file to a place of their choosing on the server 
$pass = true;
if (strpos($_FILES['Filedata']['name'], '../') !== false) $pass = false;
if (strpos($_FILES['Filedata']['name'], '.exe') !== false) $pass = false;
if (strpos($_FILES['Filedata']['name'], '...') !== false) $pass = false;

if ($pass === false){
  print "Invalid File Name";
  exit();
}

$new_file_name = $xerte_toolkits_site->root_file_path . $_GET['path'] . $_FILES['Filedata']['name'];

if(move_uploaded_file($_FILES['Filedata']['tmp_name'], $new_file_name)){
}else{
}
