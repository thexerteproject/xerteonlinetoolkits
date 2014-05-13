<?php
require_once("../../../config.php");

require("../user_library.php");

if(is_user_admin()){

    $database_id = database_connect("change_owner.php connected","change_owner.php failed");

    $safe_template_id = (int) $_POST['template_id'];

    $query_for_play_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

    $query_for_play_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_play_content_strip);

    $row_play = db_query_one($query_for_play_content);

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $query= "UPDATE {$prefix}templatedetails set creator_id= ? WHERE template_id = ?";
    $params = array($_POST['new_user'], $_POST['template_id'] );
    
    $ok = db_query($query, $params);
    if(!$ok) {
        die("Failed to update");
    }
	
        $query = "SELECT username FROM {$prefix}logindetails where login_id = ?";
        $params = array($_POST['new_user']);
	
        $row_username = db_query_one($query, $params);
	
        
        $query = "select folder_id from {$prefix}folderdetails where login_id= ? AND folder_name = ?";
        $params = array($_POST['new_user'], $row_username['username'] );
        $row_folder = db_query_one($query, $params);
        
        $query = "UPDATE {$prefix}templaterights SET user_id = ?, folder = ? WHERE template_id = ? AND role = ?";
        $params = array($_POST['new_user'], $row_folder['folder_id'], $_POST['template_id'], 'creator'); 

        $ok = db_query($query, $params);
        if($ok) {

        echo "Update successful";

    }else{
	die('database error');

    }

    rename($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_play['username'] . "-" . $row_play['template_name'] . "/",$xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_username['username'] . "-" . $row_play['template_name'] . "/");

}
