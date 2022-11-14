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
 * share this template, gives a new user rights to a template
 * modified for use on folders by Noud Liefrink
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/folderproperties/share_this_folder.inc");

if (!isset($_SESSION['toolkits_logon_id']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

$prefix = $xerte_toolkits_site->database_table_prefix;

$folder_id = explode('_', $_POST['folder_id']);
$folder_id = $folder_id[0];
if(is_numeric($_POST['id'])&&is_numeric($folder_id)){

    $id = $_POST['id'];

    //$folder_id = $_POST['folder_id'];

    $new_role = $_POST['role'];

    $groupbool = $_POST['group'] == "true";


    $database_id=database_connect("Share this folder database connect success","Share this folder database connect success");


    $query_to_find_out_root_folder = "select folder_id from {$prefix}folderdetails where login_id = ? and folder_parent=? and folder_name!=?";
    $params = array($id, '0', 'recyclebin');
    $root_folder = db_query_one($query_to_find_out_root_folder, $params);

    $result = false;
    if (!$groupbool){
        //See if folder is already shared with this user, update or insert:
        $query = "SELECT * from {$prefix}folderrights where folder_id=? and login_id=?";
        $params = array($folder_id, $id);

        if (db_query_one($query, $params)){
            $query = "UPDATE {$prefix}folderrights SET role = ? WHERE folder_id=? and login_id=?";
            $params = array($new_role, $folder_id, $id);
        }else{
            $query = "INSERT INTO {$prefix}folderrights (role, folder_id, folder_parent, login_id) VALUES (?,?,?,?)";
            $params = array($new_role, $folder_id, $root_folder['folder_id'], $id);
        }

        $result = db_query($query, $params);
    }else{
        //See if folder is already shared with this group, update or insert:
        $query = "SELECT * from {$prefix}folder_group_rights where folder_id=? and group_id=?";
        $params = array($folder_id, $id);

        if (db_query_one($query, $params)){
            $query = "UPDATE {$prefix}folder_group_rights SET role = ? WHERE folder_id=? and group_id=?";
        }else{
            $query = "INSERT INTO {$prefix}folder_group_rights (role, folder_id, group_id) VALUES (?,?,?)";
        }

        $params = array($new_role, $folder_id, $id);
        $result = db_query($query, $params);
    }

    if ($result === false){
        echo '<p>' . SHARING_THIS_FEEDBACK_FAIL . "</p>";
    }else{
        $query_for_name = "";
        if(!$groupbool){
            $query_for_name = "select firstname, surname, username from {$prefix}logindetails WHERE login_id=?";
            $params = array($id);
            $row = db_query_one($query_for_name, $params);
            echo "<p>" . SHARING_THIS_FEEDBACK_SUCCESS .
                $row['firstname'] . " " . $row['surname'] . " (". $row['username'] . ").</p>";
        }else{
            $query_for_name = "select group_name from {$prefix}user_groups WHERE group_id=?";
            $params = array($id);
            $group = db_query_one($query_for_name, $params);
            echo "<p>" . SHARING_THIS_FEEDBACK_SUCCESS . $group['group_name'] . ".</p>";
        }

    }


}