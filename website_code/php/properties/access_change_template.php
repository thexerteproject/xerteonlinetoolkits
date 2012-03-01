<?php
/**
 * 
 * access change template, allows the site to set access properties for the template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../user_library.php";
include "../template_status.php";

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

    if($_POST['access']==$string){
        return true;
    }else{
        if(strpos($string,"other-"==0)){
            return true;
        }else{		
            return false;
        }
    }

}

$database_id = database_connect("Access change database connect success","Access change database connect failed");

/*
 * Update the database setting
 */

if(isset($_POST['server_string'])){

    $query = "update " . $xerte_toolkits_site->database_table_prefix . "templatedetails SET access_to_whom =\"" . mysql_real_escape_string($_POST['access']) . "-" . mysql_real_escape_string($_POST['server_string']) . "\" WHERE template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";

}else{

    $query = "update " . $xerte_toolkits_site->database_table_prefix . "templatedetails SET access_to_whom =\"" . mysql_real_escape_string($_POST['access']) . "\" WHERE template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";		

}

if(mysql_query($query)){

    access_display($xerte_toolkits_site);

}else{

    access_display_fail();

}

mysql_close($database_id);

?>
