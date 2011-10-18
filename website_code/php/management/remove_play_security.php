<?php

require_once("../../../config.php");

require("../user_library.php");
require("management_library.php");

if(is_user_admin()){

    $query="delete from " . $xerte_toolkits_site->database_table_prefix . "play_security_details where security_id=?";
    db_query($query, array($_POST['play_id'] ));

    security_list();

}else{
    management_fail();
}
