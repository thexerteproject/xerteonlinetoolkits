<?php
/**
 * 
 * syndication template, shows the syndication status for this template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */


require_once("../../../config.php");

include "../template_status.php";

include "../user_library.php";
include "../url_library.php";
include "properties_library.php";

if(!is_numeric($_POST['tutorial_id'])){
    syndication_display_fail();
    exit(0);
}
if(!is_user_creator((int) $_POST['tutorial_id']) && !is_user_admin()){
    syndication_display_fail();
    exit(0);
}

/**
 * Check template is public
 */
if(template_access_settings((int) $_POST['tutorial_id']) == "Public") {
    syndication_display($xerte_toolkits_site,false);
}
else{
    syndication_not_public($xerte_toolkits_site);
}
