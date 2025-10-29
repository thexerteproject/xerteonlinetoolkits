<?php
require("../../../config.php");

_load_language_file("/website_code/php/management/users.inc");
_load_language_file("/management.inc");

require_once("../user_library.php");
require_once("management_library.php");

/**
 * prints the ui to screen wit the user with userid selected
 */
function changeuserselection_roles($userid){
	global $xerte_toolkits_site;

    $result = db_query("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}logindetails where disabled=0 order by surname,firstname,username");

	if($result === false){
		return;
	}

    // Only allow superadmin to assign roles
    if (is_user_admin()) {
        echo "<h3>" . USERS_MANAGE_ROLES_ASSIGN_ROLES . "</h3>";

        $roles_query = "select * from " . $xerte_toolkits_site->database_table_prefix . "role order by roleid";
        $user_roles_query =
            "select roleid from " . $xerte_toolkits_site->database_table_prefix . "logindetailsrole " .
            "where userid=?";

        $roles_query_result = db_query($roles_query);

        $user_roles_results = db_query($user_roles_query, array($userid));
        $user_roles = array();
        foreach ($user_roles_results as $user_role) {
            $user_roles[] = $user_role["roleid"];
        }
        echo "<div id=\"user_roles_container\" style=\"margin-left:20px\">";

        echo "<select onchange=\"changeUserSelection_user_roles()\" id=\"user_roles\" class=\"selectize\">";
        echo "<option value=\"\">" . USERS_MANAGE_ROLES_SELECT_USER . "</option>";

        foreach ($result as $row_users) {
            if ($row_users["login_id"] == $userid) {
                echo "<option selected=\"selected\" value=\"" . $row_users['login_id'] . "\">" . $row_users['surname'] . ", " . $row_users['firstname'] . " (" . $row_users['username'] . ")</option>";
            } else {
                echo "<option value=\"" . $row_users['login_id'] . "\">" . $row_users['surname'] . ", " . $row_users['firstname'] . " (" . $row_users['username'] . ")</option>";
            }
        }

        echo "</select>";

        echo "<form id=\"roles\"><div class=\"grid\">";
        $isSuper = is_user_permitted();
        foreach ($roles_query_result as $role) {
            $disabled = "";

            if (!$isSuper && in_array($role["roleid"], array(1, 2)))
                $disabled = "disabled";
            $input = "<input name=\"" . $role["name"] . "\" type=\"checkbox\" " . (in_array($role["roleid"], $user_roles) ? "checked" : "") . " " . $disabled . "/>";
            echo "<p title=\"" . constant("USERS_ROLE_" . strtoupper($role["name"]) . "_INFO") . "\">" . constant("USERS_ROLE_" . strtoupper($role["name"])) . "</p> <i class=\"fa fa-info-circle\" title=\"" . constant("USERS_ROLE_" . strtoupper($role["name"]) . "_INFO") . "\"></i> " . $input;
        }


        echo "</div></form>";
        echo "<button class=\"xerte_button\" onclick=\"javascript:update_roles(" . $userid . ")\">" . USERS_MODIFY_ROLES . "</button>";
        echo "</div>";
    }
}

/**
 * prints the ui to screen the user that is selected is the db order by surname, firstname and username
 */
function x_get_user_roles(){
	global $xerte_toolkits_site;

    $result = db_query("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}logindetails order by surname,firstname,username");
	
	if(!($result===false) && count($result) > 0){
		changeuserselection_roles("-1");
	}
}

if(is_user_permitted("useradmin")){
	if(isset($_POST["userid"])){
		changeuserselection_roles($_POST["userid"]);
	}
}
