<?php
/**
 * 
 * publish template, shows the publish options
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/publish.inc");

include "../template_status.php";
include "../screen_size_library.php";
include "../url_library.php";
include "../user_library.php";
include "properties_library.php";

if(is_numeric($_POST['template_id'])){

    $tutorial_id = mysql_real_escape_string($_POST['template_id']);

    publish_display($tutorial_id);

}

?>
