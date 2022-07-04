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
include "../folder_status.php";
include "../user_library.php";

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

$id = $_POST['id'];
$folder_id = $_POST['folder_id'];
$group = $_POST['group'];

if(is_numeric($_POST['folder_id'])){

    if(is_user_creator_or_coauthor_folder($_POST['folder_id'])||is_user_admin()||$_POST['user_deleting_self']=="true"){
        $prefix = $xerte_toolkits_site->database_table_prefix;

        $database_id = database_connect("Folder sharing database connect failed", "Folder sharing database connect failed");

        if ($group=="false"){
            $query_to_delete_share = "delete from {$prefix}folderrights where folder_id = ? AND login_id = ?";
        }else{
            $query_to_delete_share = "delete from {$prefix}folder_group_rights where folder_id = ? and group_id = ?";
        }
        $params = array($folder_id, $id);
        db_query($query_to_delete_share, $params);
    }
}
