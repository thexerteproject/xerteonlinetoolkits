<?php
require_once("../../../config.php");

_load_language_file("/website_code/php/management/users.inc");
_load_language_file("/management.inc");

require("../user_library.php");
require("management_library.php");

if(is_user_permitted("useradmin")){
    $date = isset($_POST['last_login_date']) ? x_clean_input($_POST['last_login_date']) : "";

    if(isset($date)){
        $sql = "update {$xerte_toolkits_site->database_table_prefix}logindetails set disabled=0 WHERE lastlogin < ? and disabled = 0";
        $params = array($date);
        $result = db_query($sql, $params);
        $message = str_replace("{0}", $result, USERS_DISABLE_USERS_LASTLOGIN_SUCCESS);
        echo $message;
    } else {
        echo "<p>" . USERS_UPDATE_ACTIVE_FAILED . "</p>";
    }
} else {
	management_fail();
}
