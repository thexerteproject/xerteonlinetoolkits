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

_load_language_file("/library/Xerte/Authentication/Db/moduser.inc");

require(dirname(__FILE__) . "/../../../../website_code/php/user_library.php");

if(is_user_admin()){

    global $authmech, $xerte_toolkits_site;

    if (!isset($authmech))
    {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }

    // Easy checks first
    $mesg = "";
    $warn = "";
    if (isset($_POST['usernamefield']) && strlen($_POST['usernamefield']) > 0 && $_POST['usernamefield'] != $_POST['username'])
    {
        $warn .= "<li>" . AUTH_DB_MODUSER_USERNAMEIGNORED . "</li>";
    }
    if (isset($_POST['password']) && strlen(urldecode($_POST['password'])) != 0 && strlen(urldecode($_POST['password'])) < 5 )
    {
        $mesg .= "<li>" . AUTH_DB_MODUSER_PASSWORDTOOSHORT . "</li>";
    }
    if (strlen($mesg) == 0)
    {
        $mesg .= $authmech->modUser(urldecode($_POST['username']), urldecode($_POST['firstname']), urldecode($_POST['surname']), urldecode($_POST['password']), urldecode($_POST['email']));
    }
    if (strlen($mesg) > 0)
    {
        $finalmesg = "<p>" . AUTH_DB_MODUSER_FAILED . "</p>";
        $finalmesg .= "<p><font color = \"red\"><ul>" . $warn . $mesg . "</ul></font></p>";
    }
    else
    {
        $finalmesg = "";
        if (strlen($warn) > 0)
        {
            $finalmesg = "<p><font color = \"green\"><ul>" . $warn . "</ul></font></p>";
        }
        $finalmesg .= "<p><font color = \"green\">" . AUTH_DB_MODUSER_SUCCEEDED . "</font></p>";
    }
    $authmech->getUserList(true, $finalmesg);
}

?>