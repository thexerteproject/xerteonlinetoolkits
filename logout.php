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
require_once("config.php");

require $xerte_toolkits_site->php_library_path  . "user_library.php";

if (is_user_admin()) {
    $msg = "Admin user (from " . $_SERVER['REMOTE_ADDR'] . ") has logged out";
    receive_message("", "SYSTEM", "MGMT", "Logout", $msg);
}
else {
    if (isset($_SESSION['toolkits_logon_username'])) {
        $msg = "User " . $_SESSION['toolkits_logon_username'] . " (from " . $_SERVER['REMOTE_ADDR'] . ") has logged out";
    }
    else {
        $msg = "Unknown user (from " . $_SERVER['REMOTE_ADDR'] . ") has logged out";
    }

    receive_message("", "SYSTEM", "LOGINS", "Logout", $msg);
}

$authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);

if ($authmech->hasLogout())
{
    _debug("Single Logout");
    $authmech->logout();
}

session_destroy();
