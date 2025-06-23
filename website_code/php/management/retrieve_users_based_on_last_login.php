<?php
require_once("../../../config.php");

_load_language_file("/website_code/php/management/users.inc");
_load_language_file("/management.inc");

require("../user_library.php");
require("management_library.php");

if(is_user_permitted("useradmin")){
    $date = isset($_POST['last_login_date']) ? x_clean_input($_POST['last_login_date']) : "";

    if(isset($date)){
        $sql = "select count(*) as nr from {$xerte_toolkits_site->database_table_prefix}logindetails WHERE lastlogin < ? and disabled = 0";
        $params = array($date);
        $result = db_query_one($sql, $params);
        $message = str_replace("{0}", $result['nr'], USERS_RETRIEVE_USERS_LASTLOGIN_SUCCESS);
        echo $message;
    } else {
        echo "<p>" . USERS_UPDATE_ACTIVE_FAILED . "</p>";
    }
} else {
	management_fail();
}
