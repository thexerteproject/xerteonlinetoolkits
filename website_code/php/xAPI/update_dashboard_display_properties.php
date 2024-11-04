<?php

require_once(dirname(__FILE__) . "/../../../config.php");

include "../template_status.php";
include "../user_library.php";

$id = $_POST["id"];
$properties = $_POST["properties"];
if(is_numeric($id))
{
    if(has_rights_to_this_template($id, $_SESSION['toolkits_logon_id']) || is_user_admin()) {
        $prefix = $xerte_toolkits_site->database_table_prefix;
        db_query("update ${prefix}templatedetails set dashboard_display_options = ? where template_id = ?", array($properties, $id));
    }
}