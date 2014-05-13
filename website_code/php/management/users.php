<?php

require_once("../../../config.php");

_load_language_file("/website_code/php/management/users.inc");

require("../user_library.php");
require("management_library.php");

if(is_user_admin()){
    global $authmech;
    if (!isset($authmech))
    {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    if ($authmech->check() && $authmech->canManageUser($jsscript))
    {
        echo "<h2>" . USERS_MANAGE_AUTH . "</h2>";
        echo "<div id=\"manage_auth_users\">";
        $authmech->getUserList(false, "");
        echo "</div>";
        echo "<h2>" . USERS_MANAGE_ACTIVE . "</h2>";
    }

    $database_id = database_connect("templates list connected","template list failed");

    $query="select * from " . $xerte_toolkits_site->database_table_prefix . "logindetails";

    $query_response = db_query($query);

    foreach($query_response as $row) { 

        echo "<div class=\"template\" id=\"" . $row['username'] . "\" savevalue=\"" . $row['login_id'] .  "\"><p>" . $row['firstname'] . " " . $row['surname'] . " <button type=\"button\" class=\"xerte_button\" id=\"" . $row['username'] . "_btn\" onclick=\"javascript:templates_display('" . $row['username'] . "')\">" . USERS_TOGGLE . "</button></p></div><div class=\"template_details\" id=\"" . $row['username']  . "_child\">";

        echo "<p>" . USERS_ID . "<form><textarea id=\"user_id" . $row['login_id'] .  "\">" . $row['login_id'] . "</textarea></form></p>";
        echo "<p>" . USERS_FIRST . "<form><textarea id=\"firstname" . $row['login_id'] .  "\">" . $row['firstname'] . "</textarea></form></p>";
        echo "<p>" . USERS_KNOWN . "<form><textarea id=\"surname" . $row['login_id'] .  "\">" . $row['surname'] . "</textarea></form></p>";
        echo "<p>" . USERS_USERNAME . "<form><textarea id=\"username" . $row['login_id'] .  "\">" . $row['username'] . "</textarea></form></p>";
        echo "</div>";

    }

}else{

    management_fail();

}

?>
