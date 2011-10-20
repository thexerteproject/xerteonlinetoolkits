<?php
/**
 * 
 * delete folder page, the site deletes a folder
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once('../../../config.php');
include "../folder_library.php";

delete_folder(mysql_real_escape_string($_POST['folder_id']));

?>
