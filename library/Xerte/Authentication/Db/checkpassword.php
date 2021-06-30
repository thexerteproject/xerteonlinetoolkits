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

    if (!isset($authmech)) {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    if ($xerte_toolkits_site->altauthentication != "" && isset($_SESSION['altauth'])) {
        $xerte_toolkits_site->authentication_method = $xerte_toolkits_site->altauthentication;
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }

    if ($authmech->canManageUser($jsscript)){
        return $authmech->login($_SESSION['toolkits_logon_username'], $_POST['oldpass']);
    }else{
        return false;
    }

}


?>