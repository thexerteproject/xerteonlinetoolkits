<?php

/**
 * This file controls how authentication takes place within XOT.
 * The default setting (Guest) should be sufficient for demonstration purposes,
 * and will let anyone login as the same user, once they click 'Login'. 
 *
 * Possible values: Guest, Ldap, Db, Static or Moodle. Default is Guest
 * See code in library/Xerte/Authentication/*.php - where each file should match up to the value used below.
 */

$xerte_toolkits_site->authentication_method = 'Guest';
//$xerte_toolkits_site->authentication_method = 'Ldap';
//$xerte_toolkits_site->authentication_method = 'Db';
//$xerte_toolkits_site->authentication_method = 'Static';
//$xerte_toolkits_site->authentication_method = "Moodle";

//restrict moodle guest access
//comment out the following if you want the Moodle guest account to have authoring access
if ( $xerte_toolkits_site->authentication_method=="Moodle"){
    if($USER->username=='guest'){
        echo '<p style="text-align:center; font-family:verdana;"><br></br></font>Sorry you do not currently have permission to author with Xerte.</p>';
        exit;
    }
}

//restrict moodle access via custom moodle profile field named xot
//in moodle set it to be a checkbox and either checked or unchecked by default
//then either check or uncheck for those who should have XOT authoring access
//change the require path below to point to your moodle directory/user/profile/lib.php
//require_once('/moodle/user/profile/lib.php'); 
//profile_load_data($USER);
//if ($USER->profile_field_xot!='1'){
//echo '<p style="text-align:center; font-family:verdana;"><br></br></font>Sorry you do not currently have permission to author with Xerte.</p>';
//exit;
//}else{
//echo 'yep you are ok';
//}


if($xerte_toolkits_site->authentication_method == "Moodle") {
    // skip session_start() as we'll probably stomp on Moodle's session if we do. 
}
else {
    session_start();
}
