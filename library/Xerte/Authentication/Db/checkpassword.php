<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tom
 * Date: 23-3-13
 * Time: 11:25
 * To change this template use File | Settings | File Templates.
 */

require_once(dirname(__FILE__) . "/../../../../config.php");

require_once(dirname(__FILE__) . "/../../../../website_code/php/user_library.php");

function checkOldPassword(){
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

    if ($authmech->canManageUser($jsscript)){
        if ($authmech_can_manage_users) {
            return $authmech->login($_SESSION['toolkits_logon_username'], $_POST['oldpass']);
        }
        else if ($altauthmech_can_manage_users) {
            return $altauthmech->login($_SESSION['toolkits_logon_username'], $_POST['oldpass']);
        }
    }else{
        return false;
    }

}


