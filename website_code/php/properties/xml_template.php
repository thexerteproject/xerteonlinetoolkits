<?php
/**
 * 
 * xml template, shows the xml sharing status for this template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";

include "../url_library.php";

include "../user_library.php";

include "properties_library.php";

$database_id = database_connect("peer template database connect success","peer template change database connect failed");

if(is_numeric($_POST['template_id'])){

    if(is_user_creator(mysql_real_escape_string($_POST['template_id']))||is_user_admin()){

        xml_template_display($xerte_toolkits_site,false);

    }else{

        xml_template_display_fail();

    }


}
