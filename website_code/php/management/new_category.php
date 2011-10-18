<?php

require_once("../../../config.php");

require("../user_library.php");
require("management_library.php");

if(is_user_admin()){

    $query = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}syndicationcategories (category_name) values  (?)";
    $res = mysql_query($query, array($_POST['newcategory']));

    if($res) {

        // change these

        //receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder creation succeeded for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);

    }else{

        // change these

        //receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder creation failed for " . $_SESSION['toolkits_logon_username'], "Folder creation failed for " . $_SESSION['toolkits_logon_username']);


    }

    category_list();

}else{

    management_fail();

}

