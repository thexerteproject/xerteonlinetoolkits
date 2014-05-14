<?php
// Delete template code
//
// Version 1.0 University of Nottingham
// 
// Delete this template from the database and from the file system

require_once("../../../config.php");

_load_language_file("/website_code/php/management/delete.inc");

include "../user_library.php";
include "../deletion_library.php";

$database_id = database_connect("delete main template database connect success","delete main template database connect failed");

if(is_user_admin()){

    // work out the file path before we start deletion

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $query_to_get_template_type_id = " select template_type_id,template_framework,template_name from {$prefix}originaltemplatesdetails "
    . "where template_type_id = ?";
    $params = array($_POST['template_id']);

    $row_template_id = db_query_one($query_to_get_template_type_id, $params);
    
    $path = $xerte_toolkits_site->root_file_path  . $xerte_toolkits_site->module_path . $row_template_id['template_framework'] . "/parent_templates/" . $row_template_id['template_name'] . "/";

    $path2 = $xerte_toolkits_site->root_file_path  . $xerte_toolkits_site->module_path . $row_template_id['template_framework'] . "/templates/" . $row_template_id['template_name'] . "/";

    set_up_deletion($path);

    set_up_deletion($path2);

    $query_to_delete_template = "DELETE from {$prefix}originaltemplatesdetails where template_type_id= ?";
    $params = array($_POST['template_id']);
    
    $ok = db_query($query_to_delete_template, $params);
    if($ok) {
        echo MANAGEMENT_DELETE_SUCCESS;

    }else{
        echo MANAGEMENT_DELETE_FAIL;

    }


}
