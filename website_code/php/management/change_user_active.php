<?php
require_once("../../../config.php");

_load_language_file("/website_code/php/management/users.inc");
_load_language_file("/management.inc");

require("../user_library.php");
require("management_library.php");

if(is_user_permitted("useradmin")){
    $user_id = isset($_POST['user_id']) ? x_clean_input($_POST['user_id'], 'numeric') : "";
    $disabled = isset($_POST['disabled']) ? x_clean_input($_POST['disabled']) : "";

    if (isset($disabled) && $disabled === "true") {
        $disabled = true;
    } elseif (isset($disabled) && $disabled === "false") {
        $disabled = false;
    } else {
        $disabled = null; // If not set or invalid, set to null
    }
    if(isset($user_id) && is_bool($disabled)){
        $sql = "UPDATE {$xerte_toolkits_site->database_table_prefix}logindetails SET disabled = ? WHERE login_id = ?";
        $params = array($disabled, $user_id);
        $result = db_query($sql, $params);
        echo "<p>" . USERS_UPDATE_ACTIVE_SUCCESS . "</p>";
    } else {
        echo "<p>" . USERS_UPDATE_ACTIVE_FAILED . "</p>";
    }
} else {
	management_fail();
}
