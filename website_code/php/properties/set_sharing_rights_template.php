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

$prefix = $xerte_toolkits_site->database_table_prefix;
if(is_numeric($_POST['user_id'])&&is_numeric($_POST['template_id'])){

    $new_rights = $_POST['rights'];

    $user_id = $_POST['user_id'];

    $tutorial_id = $_POST['template_id'];

    $database_id=database_connect("Template sharing rights database connect success","Template sharing rights database connect failed");

    $query_to_change_share_rights = "update {$prefix}templaterights set role = ? WHERE template_id = ? and user_id= ?";
    $params = array($new_rights, $tutorial_id, $user_id);
    db_query($query_to_change_share_rights, $params);
}
