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
 * remove sharing template, removes a group from the list of groups sharing the template
 *
 * @author Noud Liefrink
 * @version 1.0
 * @package
 */

require_once("../../../config.php");

if(is_numeric($_POST['template_id'])){

    $prefix = $xerte_toolkits_site->database_table_prefix;

    $group_id = $_POST['group_id'];

    $template_id = $_POST['template_id'];

    $database_id=database_connect("Template sharing database connect failed","Template sharing database connect failed");

    $query_to_delete_share = "delete from {$prefix}template_group_rights where template_id = ? AND group_id = ?";

    $params = array($template_id, $group_id);
    db_query($query_to_delete_share, $params);
    

}
