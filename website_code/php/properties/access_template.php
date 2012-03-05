<?php
/**
 * 
 * access change template, allows the site to see access properties for the template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once(dirname(__FILE__) . "/../../../config.php");

include "../template_status.php";
include "../user_library.php";
include "properties_library.php";

/**
 * 
 * Function template share status
 * This function checks the current access setting against a string
 * @param string $string - string to check against the database
 * @return bool True or False if two params match
 * @version 1.0
 * @author Patrick Lockley
 */

function template_share_status($string){

    global $row_access;

    if($row_access['access_to_whom']==$string){
        return true;
    }else{
        if(strcmp(substr($row_access['access_to_whom'],0,5),$string)==0){
            return true;
        }else{
            return false;
        }
    }
}

$database_connect_id = database_connect("Access template database connect success","Access template database connect failed");

/*
 * only creator can set access
 */

if(is_numeric($_POST['template_id'])){

    if(has_rights_to_this_template($_POST['template_id'],$_SESSION['toolkits_logon_id'])||is_user_admin()){

        access_display($xerte_toolkits_site);

    }else{

        access_display_fail();

    }

    mysql_close($database_connect_id);

    if(mysql_num_rows($query_for_security_content_response)!=0){

        while($row_security = mysql_fetch_array($query_for_security_content_response)){

            if(template_share_status($row_security['security_setting'])){

                echo "<p id=\"" . $row_security['security_setting'] . "\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";

            }else{

                echo "<p id=\"" . $row_security['security_setting'] . "\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";

            }

            echo " " . $row_security['security_setting'] . "</p><p class=\"share_explain_paragraph\">" . $row_security['security_info'] . "</p>";					

        }

    }		

    echo "</div>";	

    echo "<p><img src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveClick.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" onclick=\"javascript:access_change_template(" . $_POST['template_id'] . ")\" /> </p>";	

}else{
    echo "<p>Sorry only the creator can set the access settings</p>";
}
