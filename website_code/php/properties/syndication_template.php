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

//connect to the database

$database_connect_id = database_connect("notes template database connect success", "notes template database connect failed");

if(is_numeric($_POST['tutorial_id'])){

    if(is_user_creator(mysql_real_escape_string($_POST['tutorial_id']))||is_user_admin()){

        /**
         * Check template is public
         */

        if(template_access_settings(mysql_real_escape_string($_POST['tutorial_id']))=="Public"){

            syndication_display($xerte_toolkits_site,false);

        }else{

            syndication_not_public($xerte_toolkits_site);

        }

    }else{

        syndication_display_fail();

    }

}

?>
