<?php

require_once("../../../config.php");

_load_language_file("/website_code/php/management/user_templates.inc");

require("../user_library.php");
require("../url_library.php");
require("management_library.php");

if(is_user_admin()){

    $database_id = database_connect("templates list connected","template list failed");

    $query="select * from " . $xerte_toolkits_site->database_table_prefix . "logindetails order by surname,firstname,username" ;

    $query_response = mysql_query($query);
    // Fetch users only once and put the results in a php array
    $logins = array();
    while ($login = mysql_fetch_array($query_response, MYSQL_ASSOC))
    {
        $logins[] = $login;
    }

    echo "<form name=\"user_templates\" action=\"javascript:list_templates_for_user('list_user')\"><select id=\"list_user\">";

    foreach($logins as $row_users){
        echo "<option value=\"" . $row_users['login_id'] . "\">" . $row_users['firstname'] . " " . $row_users['surname'] . " (" . $row_users['username'] . ")</option>";
    }

    echo "</select>";

    //}

    echo "<button type=\"submit\" class=\"xerte_button\">" . USERS_MANAGEMENT_TEMPLATE_VIEW . "</button></form></div><div id=\"usertemplatelist\"></div>";

    mysql_close($database_id);

}else{

    management_fail();

}

?>
