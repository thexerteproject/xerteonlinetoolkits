<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This file controls how authentication takes place within XOT.
 * The default setting (Guest) should be sufficient for demonstration purposes,
 * and will let anyone login as the same user, once they click 'Login'. 
 *
 * Possible values: Guest, Ldap, Db, Static or Moodle. Default is Guest
 * See code in library/Xerte/Authentication/*.php - where each file should match up to the value used below.
 */

// set authentication method to guest if not set in db via management area
if (!isset($xerte_toolkits_site->authentication_method)) {
    $xerte_toolkits_site->authentication_method = 'Guest';  
    $res = db_query_one("insert into {$xerte_toolkits_site->database_table_prefix}sitedetails (`site_id`, `authentication_method`) values (1,'Guest')");
}

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
