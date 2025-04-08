<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tom
 * Date: 23-3-13
 * Time: 11:25
 * To change this template use File | Settings | File Templates.
 */

require_once(dirname(__FILE__) . "/../../../../config.php");

_load_language_file("/library/Xerte/Authentication/Db/deluser.inc");

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
    if (!isset($_POST['username']) || strlen($_POST['username']) == 0)
    {
        $mesg .= "<li>" . AUTH_DB_DELUSER_INVALIDUSERNAME . "</li>";
    }
    if (strlen($mesg) == 0)
    {
        if ($authmech_can_manage_users) {
            $mesg = $authmech->delUser(urldecode(x_clean_input($_POST['username'])));
        }
        else if ($altauthmech_can_manage_users) {
            $mesg = $altauthmech->delUser(urldecode(x_clean_input($_POST['username'])));
        }

    }
    if (strlen($mesg) > 0)
    {
        $finalmesg = "<p>" . AUTH_DB_DELUSER_FAILED . "</p>";
        $finalmesg .= "<p style=\"color:  red\"><ul>" . $mesg . "</ul></p>";
    }
    else
    {
        $finalmesg = "<p style=\"color: green\">" . AUTH_DB_DELUSER_SUCCEEDED . "</p>";
    }
    if ($authmech_can_manage_users) {
        $authmech->getUserList(true, $finalmesg);
    }
    else if ($altauthmech_can_manage_users) {
        $altauthmech->getUserList(true, $finalmesg);
    }
}

?>
