<?php

require_once("../../../config.php");

_load_language_file("/website_code/php/management/play_security_management.inc");

require("../user_library.php");

if(is_user_admin()){

    $database_id = database_connect("play_security_management.php connected","play_security_management.php list failed");

    $query="update {$xerte_toolkits_site->database_table_prefix}play_security_details set security_setting=?, security_data=?, security_info=? WHERE security_id=?";
    $res = db_query($query, array($_POST['security'], $_POST['data'], $_POST['info'] , $_POST['play_id'] ));

    if($res) {
        echo MANAGEMENT_PLAY_SUCCESS;
    }else{
        echo MANAGEMENT_PLAY_FAIL;
    }
}
