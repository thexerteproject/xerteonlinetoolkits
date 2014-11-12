<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
