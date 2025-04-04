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
 * remove sharing template, removes some one from the list of users sharing the site
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
include "../template_status.php";
include "../user_library.php";

if (!isset($_SESSION['toolkits_logon_id']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

if(is_numeric($_POST['template_id'])){

    if(is_user_creator_or_coauthor($_POST['template_id'])||is_user_permitted("projectadmin")||$_POST['user_deleting_self']=="true") {
        $prefix = $xerte_toolkits_site->database_table_prefix;

        $id = $_POST['id'];
        $group = $_POST['group'] == "true";
        $template_id = $_POST['template_id'];

        $database_id = database_connect("Template sharing database connect failed", "Template sharing database connect failed");
        if (!$group){
            $query_to_delete_share = "delete from {$prefix}templaterights where template_id = ? AND user_id = ?";

        }else{
            $query_to_delete_share = "delete from {$prefix}template_group_rights where template_id=? and group_id = ?";
        }
        $params = array($template_id, $id);
        db_query($query_to_delete_share, $params);

    }
}
