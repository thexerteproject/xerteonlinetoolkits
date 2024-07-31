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
    if ($xerte_toolkits_site->altauthentication != "" && isset($_SESSION['altauth']))
    {
        $xerte_toolkits_site->authentication_method = $xerte_toolkits_site->altauthentication;
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    // Easy checks first
    $mesg = "";
    $warn = "";
    if (isset($_POST['usernamefield']) && strlen($_POST['usernamefield']) > 0 && x_clean_input($_POST['usernamefield']) != x_clean_input($_POST['username']))
    {
        $warn .= "<li>" . AUTH_DB_MODUSER_USERNAMEIGNORED . "</li>";
    }
    if (isset($_POST['password']) && strlen(urldecode($_POST['password'])) != 0 && strlen(urldecode(x_clean_input($_POST['password']))) < 5 )
    {
        $mesg .= "<li>" . AUTH_DB_MODUSER_PASSWORDTOOSHORT . "</li>";
    }
    if (strlen($mesg) == 0)
    {
        $mesg .= $authmech->modUser(urldecode(x_clean_input($_POST['username'])), urldecode(x_clean_input($_POST['firstname'])), urldecode(x_clean_input($_POST['surname'])), urldecode(x_clean_input($_POST['password'])), urldecode(x_clean_input($_POST['email'])));
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
    $authmech->getUserList(true, $finalmesg);
}

?>
