<?php

require_once("../../../config.php");

_load_language_file("/website_code/php/management/user_details_management.inc");

require("../user_library.php");

if(is_user_admin()){

    $database_id = database_connect("templates list connected","template list failed");

    $query="update {$xerte_toolkits_site->database_table_prefix}logindetails set firstname=?, surname=?, username=?, email=? WHERE login_id = ?";
    $params = array($_POST['firstname'], $_POST['surname'], $_POST['username'], $_POST['user_id'], $_POST['email']);

    $res =db_query($query, $params);
    if($res) {
        echo USERS_UPDATE_SUCCESS;
    }else{
        echo USERS_UPDATE_FAIL;
    }
}
