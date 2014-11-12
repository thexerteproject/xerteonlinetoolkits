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
 * Created by JetBrains PhpStorm.
 * User: tom
 * Date: 23-3-13
 * Time: 11:25
 * To change this template use File | Settings | File Templates.
 */

require_once(dirname(__FILE__) . "/../../../../config.php");

_load_language_file("/library/Xerte/Authentication/Db/adduser.inc");

require(dirname(__FILE__) . "/../../../../website_code/php/user_library.php");

if(is_user_admin()){

    global $authmech, $xerte_toolkits_site;

    if (!isset($authmech))
    {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }

    // Easy checks first
    $mesg = "";
    if (!isset($_POST['username']) || strlen($_POST['username']) == 0)
    {
        $mesg .= "<li>" . AUTH_DB_ADDUSER_INVALIDUSERNAME . "</li>";
    }
    if (!isset($_POST['firstname']) || strlen($_POST['firstname']) == 0)
    {
        $mesg .= "<li>" . AUTH_DB_ADDUSER_INVALIDFIRSTNAME . "</li>";
    }
    if (!isset($_POST['surname']) || strlen($_POST['surname']) == 0)
    {
        $mesg .= "<li>" . AUTH_DB_ADDUSER_INVALIDSURNAME . "</li>";
    }
    if (!isset($_POST['password']) || strlen($_POST['password']) == 0)
    {
        $mesg .= "<li>" . AUTH_DB_ADDUSER_INVALIDPASSWORD . "</li>";
    }
    else if (isset($_POST['password']) && strlen(urldecode($_POST['password'])) < 5)
    {
        $mesg .= "<li>" . AUTH_DB_ADDUSER_PASSWORDTOOSHORT . "</li>";
    }
    if (strlen($mesg) == 0)
    {
        $mesg = $authmech->addUser(urldecode($_POST['username']), urldecode($_POST['firstname']), urldecode($_POST['surname']), urldecode($_POST['password']), urldecode($_POST['email']));
    }
    if (strlen($mesg) > 0)
    {
        $finalmesg = "<p>" . AUTH_DB_ADDUSER_FAILED . "</p>";
        $finalmesg .= "<p><font color = \"red\"><ul>" . $mesg . "</ul></font></p>";
    }
    else
    {
        $finalmesg = "<p><font color = \"green\">" . AUTH_DB_ADDUSER_SUCCEEDED . "</font></p>";
    }
    $authmech->getUserList(true, $finalmesg);
}

?>