<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tom
 * Date: 23-3-13
 * Time: 11:25
 * To change this template use File | Settings | File Templates.
 */

require_once(dirname(__FILE__) . "/../../../../config.php");
require_once(dirname(__FILE__) . "/checkpassword.php");

_load_language_file("/library/Xerte/Authentication/Db/changepassword.inc");

require_once(dirname(__FILE__) . "/../../../../website_code/php/user_library.php");

//check to see if user is admin, or that the username provided in POST is the same as in the session
if (!isset($_POST['username']) || !isset($_POST['password']))
{
    die(AUTH_DB_CHANGEPASSWORD_INVALIDUSERNAME);
}
$supposed_user = x_clean_input($_POST['username']);
$password = $_POST['password'];
$real_user = "";
if (isset($_SESSION['toolkits_logon_username'])){
    $real_user = $_SESSION['toolkits_logon_username'];
}

if (!is_user_permitted("useradmin") && $real_user == ""){
    return;
}

if(is_user_permitted("useradmin") || $supposed_user == $real_user){

    global $authmech, $xerte_toolkits_site;

    if (!isset($authmech))
    {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    if ($authmech->check() && $authmech->canManageUser($jsscript))
    {
        $authmech_can_manage_users = true;
    }
    else
    {
        $authmech_can_manage_users = false;
    }
    if ($xerte_toolkits_site->altauthentication != "")
    {
        $altauthmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->altauthentication);
        if ($altauthmech->check() && $altauthmech->canManageUser($jsscript))
        {
            $altauthmech_can_manage_users = true;
        }
        else
        {
            $altauthmech_can_manage_users = false;
        }
    }
    // Easy checks first
    $mesg = "";

    $wrongPass = false;
    if (isset($_POST['oldpass'])) {
        if (!checkOldPassword()) {
            $mesg .= "<li>" . AUTH_DB_CHANGEPASSWORD_WRONGPASS . "</li>";
            $wrongPass = true;
        }
    }
    if (!isset($supposed_user) || strlen($supposed_user) == 0)
    {
        $mesg .= "<li>" . AUTH_DB_CHANGEPASSWORD_INVALIDUSERNAME . "</li>";
    }
    if (strlen($password) == 0)
    {
        $mesg .= "<li>" . AUTH_DB_CHANGEPASSWORD_INVALIDPASSWORD . "</li>";
    }
    else if (strlen(urldecode($password)) < 5)
    {
        $mesg .= "<li>" . AUTH_DB_CHANGEPASSWORD_PASSWORDTOOSHORT . "</li>";
    }

    if (strlen($mesg) == 0)
    {
        if ($authmech_can_manage_users) {
            $mesg = $authmech->changePassword(urldecode($supposed_user), $password);
        }
        else if ($altauthmech_can_manage_users) {
            $mesg = $altauthmech->changePassword(urldecode($supposed_user), $password);
        }
    }
    if (strlen($mesg) > 0)
    {
        $finalmesg = "<p>" . AUTH_DB_CHANGEPASSWORD_FAILED . "</p>";
        $finalmesg .= "<p><font color = \"red\"><ul>" . $mesg . "</ul></font></p>";
    }
    else
    {
        $finalmesg = "<p><font color = \"green\">" . AUTH_DB_CHANGEPASSWORD_SUCCEEDED . "</font></p>";
    }
    if (is_user_permitted("useradmin") && !isset($_POST['oldpass'])){
        if ($authmech_can_manage_users) {
            $authmech->getUserList(true, $finalmesg);
        }
        else if ($altauthmech_can_manage_users) {
            $altauthmech->getUserList(true, $finalmesg);
        }
    }else{
        echo $finalmesg;
    }
}

