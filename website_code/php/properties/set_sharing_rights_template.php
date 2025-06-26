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
/**
 * 
 * set sharing rights template, modifies rights to a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */


require_once("../../../config.php");
include "../template_status.php";
include "../user_library.php";

$prefix = $xerte_toolkits_site->database_table_prefix;
if(is_numeric($_POST['id'])&&is_numeric($_POST['template_id'])){

    if(is_user_creator_or_coauthor($_POST['template_id'])||is_user_permitted("projectadmin")) {
        $new_role = $_POST['role'];

        $id = $_POST['id'];

        $template_id = $_POST['template_id'];
        $group = $_POST['group'] == "true";
        $database_id = database_connect("Template sharing rights database connect success", "Template sharing rights database connect failed");
        if (!$group){
            $query_to_change_share_rights = "update {$prefix}templaterights set role = ? WHERE template_id = ? and user_id= ?";
        }else{
            $query_to_change_share_rights = "update {$prefix}template_group_rights set role = ? WHERE template_id = ? and group_id = ?";
        }
        $params = array($new_role, $template_id, $id);
        db_query($query_to_change_share_rights, $params);
    }
}
