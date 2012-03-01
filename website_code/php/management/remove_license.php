<?php

require_once("../../../config.php");

require("../user_library.php");
require("management_library.php");

if(is_user_admin()){

    $database_id = database_connect("templates list connected","template list failed");

    $query="delete from " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses where license_id=?";
    db_query($query, array($_POST['remove']));

    licence_list();

}else{
    management_fail();
}
