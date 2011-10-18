<?php
/**
 * 
 * general_templates, shows blank templates to a user
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
include "../display_library.php";

$database_connect_id = database_connect("general templates database connect success","general templates database connect failed");

list_blank_templates();

mysql_close($database_connect_id);

?>
