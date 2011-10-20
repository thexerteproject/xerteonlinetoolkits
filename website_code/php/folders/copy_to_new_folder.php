<?php
/**
 * 
 * copy to new folder page, the sites moves some items from one folder to another
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once('../../../config.php');
include '../folder_library.php';

move_file(mysql_real_escape_string($_POST['files']),mysql_real_escape_string($_POST['destination']));

?>
