<?php

require_once(dirname(__FILE__) . "/../../../config.php");

include "../template_status.php";
include "../user_library.php";

$id = $_POST["id"];
$properties = $_POST["properties"];
if(is_numeric($id))
{
    if(is_user_creator_or_coauthor($id) || is_user_admin()){
        db_query("update templatedetails set dashboard_display_options = ? where template_id = ?", array($properties, $id));
    }
}
?>