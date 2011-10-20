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

$page_sought = explode("=",$_SERVER['REQUEST_URI']);

$new_file_name = $xerte_toolkits_site->root_file_path . $page_sought[1] . $_FILES['Filedata']['name'];

// SECURITY / TODO / XXX - someone can use this to upload an arbitrary file to a place of their choosing on the server 
// (assuming it's writeable); $_FILES['x']['name'] can contain ../../ as it's user supplied.
if(move_uploaded_file($_FILES['Filedata']['tmp_name'], $new_file_name)){
}else{
}
