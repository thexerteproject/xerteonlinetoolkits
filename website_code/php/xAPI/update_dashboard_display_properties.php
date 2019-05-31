<?php

require_once(dirname(__FILE__) . "/../../../config.php");

include "../template_status.php";
include "../user_library.php";

$id = $_POST["id"];
$properties = $_POST["properties"];
if(is_numeric($id))
{
    if(isset($_SESSION['toolkits_logon_id'])){
        db_query("update templatedetails set dashboard_display_options = ? where template_id = ?", array($properties, $id));
    }
}
?>