<?php
require("../../../config.php");

_load_language_file("/website_code/php/management/users.inc");
_load_language_file("/management.inc");

require_once("../user_library.php");
require_once("management_library.php");

/**
 * prints the ui to screen wit the user with userid selected
 */
function x_change_user_selection($mode, $include_header, $userids){
	global $xerte_toolkits_site;

    if ($mode == 'active')
    {
        $result = db_query("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}logindetails where disabled=0 order by surname,firstname,username");
        $title = USERS_MANAGE_ACTIVE;
        $active_btn = false;
        $inactive_btn = true;
        $all_btn = true;
        $disable_btn = true;
        $enable_btn = false;
    }
    else if ($mode == 'inactive')
    {
        $result = db_query("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}logindetails where disabled=1 order by surname,firstname,username");
        $title = USERS_MANAGE_INACTIVE;
        $active_btn = true;
        $inactive_btn = false;
        $all_btn = true;
        $disable_btn = false;
        $enable_btn = true;
    }
    else
    {
        // All users
        $result = db_query("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}logindetails  order by surname,firstname,username");
        $title = USERS_MANAGE_ALL;
        $active_btn = true;
        $inactive_btn = true;
        $all_btn = false;
        $disable_btn = true;
        $enable_btn = false;
    }

	if($result === false){
		return;
	}

    if ($include_header) {
        echo "<h2>$title (" . count($result) . ")</h2>";

        echo "<select onchange=\"changeUserSelection_active_users()\" data-mode=\"" . $mode . "\" multiple id=\"users\" class=\"selectize selectize_multi\">";
        echo "<option value=\"\">" . USERS_MANAGE_SELECT_USER . "</option>";

        foreach ($result as $row_users) {
            if ($row_users["login_id"] == "*") {
                echo "<option selected=\"selected\" value=\"" . $row_users['login_id'] . "\">" . $row_users['surname'] . ", " . $row_users['firstname'] . " (" . $row_users['username'] . ")</option>";
            } else {
                echo "<option value=\"" . $row_users['login_id'] . "\">" . $row_users['surname'] . ", " . $row_users['firstname'] . " (" . $row_users['username'] . ")</option>";
            }
        }

        echo "</select>";

        if ($active_btn) {
            echo "&nbsp;<button type=\"button\" class=\"xerte_button\" id=\"user_show_active_btn\" onclick=\"change_user_active_mode('active')\">" . USERS_SHOW_ACTIVE . "</button>";
        }
        if ($inactive_btn) {
            echo "&nbsp;<button type=\"button\" class=\"xerte_button\" id=\"user_show_inactive_btn\" onclick=\"change_user_active_mode('inactive')\">" . USERS_SHOW_INACTIVE . "</button>";
        }
        if ($all_btn) {
            echo "&nbsp;<button type=\"button\" class=\"xerte_button\" id=\"user_show_all_btn\" onclick=\"change_user_active_mode('all')\">" . USERS_SHOW_ALL . "</button>";
        }
        if ($disable_btn) {
            echo "&nbsp;<button type=\"button\" class=\"xerte_button\" id=\"user_disable_selected_btn\" onclick=\"change_user_active_state('disable')\">" . USERS_DISABLE_SELECTED . "</button>";
        }
        if ($enable_btn) {
            echo "&nbsp;<button type=\"button\" class=\"xerte_button\" id=\"user_enable_selected_btn\" onclick=\"change_user_active_state('enable')\">" . USERS_ENABLE_SELECTED . "</button>";
        }
    }
    // List selected users
    echo "<div id=\"user_selection\" class=\"user_selection\">";
    foreach($result as $row) {
        if (isset($userids) && !in_array($row['login_id'], $userids)) {
            continue; // Skip users not in the provided userids array
        }
        echo "<div class=\"template\" id=\"details_" . $row['login_id'] . "\" savevalue=\"" . $row['login_id'] .  "\"><p>" . $row['surname'] . ", " . $row['firstname'] . " <button type=\"button\" class=\"xerte_button\" id=\"details_" . $row['login_id'] . "_btn\" onclick=\"javascript:templates_display('details_" . $row['login_id'] . "')\">" . USERS_TOGGLE . "</button></p></div>";
        echo "<div class=\"template_details\" id=\"details_" . $row['login_id']  . "_child\">";

        echo "<p>" . USERS_ID . "<form><textarea id=\"user_id" . $row['login_id'] .  "\">" . $row['login_id'] . "</textarea></form></p>";
        echo "<p>" . USERS_FIRST . "<form><textarea id=\"firstname" . $row['login_id'] .  "\">" . $row['firstname'] . "</textarea></form></p>";
        echo "<p>" . USERS_KNOWN . "<form><textarea id=\"surname" . $row['login_id'] .  "\">" . $row['surname'] . "</textarea></form></p>";
        echo "<p>" . USERS_USERNAME . "<form><textarea id=\"username" . $row['login_id'] .  "\">" . $row['username'] . "</textarea></form></p>";

        $disabled = "";
        if ($row['disabled'])
            $disabled = "disabled";
        $input = "<input name=\"user_disabled" . $row['login_id'] . "\" type=\"checkbox\"  id=\"user_disabled" . $row['login_id'] . "\" " . ($row["disabled"]==1 ? "checked" : "") . " " . $disabled . " />";
        echo "<p title=\"" . USER_DISABLED . "\">" . USER_DISABLED . "</p> " . $input . "<label for=\"user_disabled" . $row['login_id'] . "\">" . USER_DISABLED . "</label>";
        echo "&nbsp;<button type=\"button\" class=\"xerte_button\" id=\"user_update_active_btn" . $row['login_id'] . "\" onclick=\"change_user_active(" . $row['login_id'] . ")\">" . USERS_UPDATE_ACTIVE . "</button>";

        echo "</div>";

    }
    echo "</div>";

}


/**
 * prints the ui to screen the user that is selected is the db order by surname, firstname and username
 */
function x_get_users(){
    x_change_user_selection("active", true, array());
}

if(is_user_permitted("useradmin")){
    $mode = (isset($_POST["mode"]) ? x_clean_input($_POST["mode"]) : null);
    $include_header = isset($_POST["include_header"]) ? x_clean_input($_POST["include_header"]) : true;
    $userids = (isset($_POST["userids"]) ?  x_clean_input($_POST["userids"]) : null);

    if ($include_header == "true" || $include_header == "1") {
        $include_header = true;
    } else {
        $include_header = false;
    }
    if ($userids == "") {
        $userids = array();
    }
	if(isset($userids) && is_array($userids) && isset($mode) && in_array($mode, array('active', 'inactive', 'all'))){
		x_change_user_selection($mode, $include_header, $userids);
	}
}
