<?php
require_once("../../../config.php");

_load_language_file("/website_code/php/management/users.inc");
_load_language_file("/management.inc");

require("../user_library.php");
require("management_library.php");

if(is_user_permitted("useradmin")){
    $userids = isset($_POST['userids']) ? x_clean_input($_POST['userids'], 'numeric') : "";
    $state = isset($_POST['state']) ? x_clean_input($_POST['state']) : "";

    if (isset($state) && $state === "disable") {
        $disabled = true;
    } elseif (isset($state) && $state === "enable") {
        $disabled = false;
    } else {
        $disabled = null; // If not set or invalid, set to null
    }
    if(isset($userids) && is_bool($disabled)){
        $ids = implode(',', $userids);
        $sql = "UPDATE {$xerte_toolkits_site->database_table_prefix}logindetails SET disabled = ? WHERE login_id in ($ids)";
        $params = array($disabled);
        $result = db_query($sql, $params);
        echo "<p>" . USERS_UPDATE_ACTIVE_SUCCESS . "</p>";
    } else {
        echo "<p>" . USERS_UPDATE_ACTIVE_FAILED . "</p>";
    }
} else {
	management_fail();
}
