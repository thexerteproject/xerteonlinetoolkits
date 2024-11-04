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
    if ($xerte_toolkits_site->altauthentication != "" && isset($_SESSION['altauth']))
    {
        $xerte_toolkits_site->authentication_method = $xerte_toolkits_site->altauthentication;
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    // Easy checks first
    $mesg = "";
    if (!isset($_POST['username']) || strlen($_POST['username']) == 0)
    {
        $mesg .= "<li>" . AUTH_DB_DELUSER_INVALIDUSERNAME . "</li>";
    }
    if (strlen($mesg) == 0)
    {
        $mesg = $authmech->delUser(urldecode(x_clean_input($_POST['username'])));

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
    $authmech->getUserList(true, $finalmesg);
}

?>
