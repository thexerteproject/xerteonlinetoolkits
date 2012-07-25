<?php
require_once("../../../config.php");

require("../user_library.php");

if(is_user_admin()){

    $database_id = database_connect("change_owner.php connected","change_owner.php failed");

    $safe_template_id = mysql_real_escape_string($_POST['template_id']);

    $query_for_play_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

    $query_for_play_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_play_content_strip);

    $query_for_play_content_response = mysql_query($query_for_play_content);

    $row_play = mysql_fetch_array($query_for_play_content_response);

    $query="update " . $xerte_toolkits_site->database_table_prefix . "templatedetails set creator_id=\"" . $_POST['new_user'] . "\" where template_id =\"" . $_POST['template_id'] . "\"";

    if(!mysql_query($query)){

        echo mysql_error();
		die();

    }
	
	$query = "select username from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id = " . $_POST['new_user'];
	
	$query_response = mysql_query($query);
	
	$row_username = mysql_fetch_array($query_response);
	
	$query = "select folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where login_id='" . $_POST['new_user'] . "' AND folder_name = '" . $row_username['username'] . "'";

    $query_for_username_response = mysql_query($query);

    $row_folder = mysql_fetch_array($query_for_username_response);

    $query="update " . $xerte_toolkits_site->database_table_prefix . "templaterights set user_id=\"" . $_POST['new_user'] . "\", folder=\"" . $row_folder['folder_id'] . "\" where template_id =\"" . $_POST['template_id'] . "\" and role=\"creator\"";

    if(mysql_query($query)){

        echo "Update successful";

    }else{

        echo mysql_error();
		die();

    }

    rename($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_play['username'] . "-" . $row_play['template_name'] . "/",$xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_username['username'] . "-" . $row_play['template_name'] . "/");

}

?>