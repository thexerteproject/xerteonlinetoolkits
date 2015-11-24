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

$xerte_toolkits_site->authentication_method = 'Guest';
//$xerte_toolkits_site->authentication_method = 'Ldap';
//$xerte_toolkits_site->authentication_method = 'Db';
//$xerte_toolkits_site->authentication_method = 'Static';
//$xerte_toolkits_site->authentication_method = "Moodle";
/* 
* Note: see moodle_restrictions.php for additional Moodle specific options 
*/

if($xerte_toolkits_site->authentication_method == "Moodle") {
    // skip session_start() as we'll probably stomp on Moodle's session if we do. 
}
else {
    session_start();
}
