<?php
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

if(is_user_permitted("useradmin")){

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
    $warn = "";
    if (isset($_POST['usernamefield']) && strlen($_POST['usernamefield']) > 0 && x_clean_input($_POST['usernamefield']) != x_clean_input($_POST['username']))
    {
        $warn .= "<li>" . AUTH_DB_MODUSER_USERNAMEIGNORED . "</li>";
    }
    if (isset($_POST['password']) && strlen(urldecode($_POST['password'])) != 0 && strlen($_POST['password']) < 5 )
    {
        $mesg .= "<li>" . AUTH_DB_MODUSER_PASSWORDTOOSHORT . "</li>";
    }
    if (strlen($mesg) == 0)
    {
        if ($authmech_can_manage_users) {
            $mesg .= $authmech->modUser(urldecode(x_clean_input($_POST['username'])), urldecode(x_clean_input($_POST['firstname'])), urldecode(x_clean_input($_POST['surname'])), $_POST['password'], urldecode(x_clean_input($_POST['email'])));
        }
        else if ($altauthmech_can_manage_users) {
            $mesg .= $altauthmech->modUser(urldecode(x_clean_input($_POST['username'])), urldecode(x_clean_input($_POST['firstname'])), urldecode(x_clean_input($_POST['surname'])), $_POST['password'], urldecode(x_clean_input($_POST['email'])));
        }
    }
    if (strlen($mesg) > 0)
    {
        $finalmesg = "<p>" . AUTH_DB_MODUSER_FAILED . "</p>";
        $finalmesg .= "<p><style=\"color: red\"><ul>" . $warn . $mesg . "</ul></font></p>";
    }
    else
    {
        $finalmesg = "";
        if (strlen($warn) > 0)
        {
            $finalmesg = "<p><style=\"color: green\"><ul>" . $warn . "</ul></font></p>";
        }
        $finalmesg .= "<p><style=\"color: green\">" . AUTH_DB_MODUSER_SUCCEEDED . "</font></p>";
    }
    if ($authmech_can_manage_users) {
        $authmech->getUserList(true, $finalmesg);
    }
    else if ($altauthmech_can_manage_users) {
        $altauthmech->getUserList(true, $finalmesg);
    }
}
