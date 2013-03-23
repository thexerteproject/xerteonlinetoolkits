<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tom
 * Date: 23-3-13
 * Time: 11:25
 * To change this template use File | Settings | File Templates.
 */

require_once(dirname(__FILE__) . "/../../../../config.php");

_load_language_file("/library/Xerte/Authentication/Db/changepassword.inc");

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
        $mesg .= "<li>" . AUTH_DB_CHANGEPASSWORD_INVALIDUSERNAME . "</li>";
    }
    if (!isset($_POST['password']) || strlen($_POST['password']) == 0)
    {
        $mesg .= "<li>" . AUTH_DB_CHANGEPASSWORD_INVALIDPASSWORD . "</li>";
    }
    else if (isset($_POST['password']) && strlen(urldecode($_POST['password'])) < 5)
    {
        $mesg .= "<li>" . AUTH_DB_CHANGEPASSWORD_PASSWORDTOOSHORT . "</li>";
    }

    if (strlen($mesg) == 0)
    {
        $mesg = $authmech->changePassword(urldecode($_POST['username']), urldecode($_POST['password']));
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
    $authmech->getUserList(true, $finalmesg);
}

?>