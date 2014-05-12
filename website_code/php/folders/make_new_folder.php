<?php
/**
 * 
 * new folder page, the sites makes a new folder
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
include '../folder_library.php';

make_new_folder($_POST['folder_id'],$_POST['folder_name']);
