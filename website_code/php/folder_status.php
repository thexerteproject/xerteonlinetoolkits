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
 * Function is folder shared
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $folder_id - the folder ID
 * @return bool - is folder shared
 * @package
 */

function is_folder_shared($folder_id){

    global $xerte_toolkits_site;

    $query = db_query("select folder_id from {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id=?", array($folder_id));
    if(sizeof($query)>0) {
        return true;
    }
    return false;

}

/**
 * 
 * Function has folder multiple editors
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $folder_id - the folder ID
 * @return bool - has the folder multiple editors
 * @package
 */

function has_folder_multiple_editors($folder_id){

    global $xerte_toolkits_site;

    $prefix =  $xerte_toolkits_site->database_table_prefix;
    
    $query_for_read_only = "select {$prefix}folderrights.folder_id, folder_name role, {$prefix}logindetails.username, "
    . "FROM {$prefix}folderrights, {$prefix}logindetails, "
    . "{$prefix}folderdetails where "
    . "{$prefix}folderrights.folder_id = {$prefix}folderdetails.folder_id and "
    . "{$prefix}folderdetails.login_id = {$prefix}logindetails.login_id and "
    . "{$prefix}folderrights.folder_id= ? AND role = ?";
    $params = array($_GET['folder_id'], "read-only");

    $query_response = db_query($query_for_read_only, $params);
    $read_only_rows = sizeof($query_response);
    
    $query_for_number_of_rows = "select {$prefix}folderrights.folder_id, role, "
    . "{$prefix}logindetails.username FROM "
    . "{$prefix}folderrights, {$prefix}logindetails, "
    . "{$prefix}folderdetails where "
    . "{$prefix}folderrights.folder_id = {$prefix}folderdetails.folder_id and "
    . "{$prefix}folderdetails.login_id = {$prefix}logindetails.login_id and "
    . "{$prefix}folderrights.folder_id = ?";

    $params = array($_GET['folder_id']);
    
    $query_response = db_query($query_for_number_of_rows, $params);

    $overall_rows = ($query_response === false ? 0 : sizeof($query_response));

    if($overall_rows!=0){

        if($read_only_rows==($overall_rows-1)){

            return false;

        }else{

            return true;

        }

    }

}

/**
 * 
 * Function has rights to this folder
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $folder_id - the folder ID
 * @params number $login_id - the current user ID
 * @return bool - does this ID have rights to this folder
 * @package
 */

function has_rights_to_this_folder($folder_id, $login_id){
    global $xerte_toolkits_site;
    //individual rights:
    $query = "select * from {$xerte_toolkits_site->database_table_prefix}folderrights where login_id=? AND folder_id = ?";
    $result = db_query_one($query, array($login_id, $folder_id));

    //group rights:
    $query = "select role from {$xerte_toolkits_site->database_table_prefix}folder_group_rights where folder_id = ? AND " .
             "group_id IN (select group_id from {$xerte_toolkits_site->database_table_prefix}user_group_members where login_id=?)";
    $groupresult = db_query($query, array($folder_id, $login_id));


    if(!empty($result) || !empty($groupresult)) {
        return true;
    }
    return false;
}

function get_user_access_rights_folder($folder_id){
    require_once("template_status.php");
    global $xerte_toolkits_site;
    $login_id = $_SESSION['toolkits_logon_id'];

    $row = db_query_one("select role from {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id=? AND login_id=?", array($folder_id, $login_id));
    $groupresult = get_user_group_access_rights_folder($login_id, $folder_id);

    $roles = array($row['role'], $groupresult);
    usort($roles, "compare_roles");
    return $roles[0];
}

function get_user_group_access_rights_folder($login_id, $folder_id){
    require_once("template_status.php");
    global $xerte_toolkits_site;
    $query = $query = "select role from {$xerte_toolkits_site->database_table_prefix}folder_group_rights where folder_id = ? AND " .
        "group_id IN (select group_id from {$xerte_toolkits_site->database_table_prefix}user_group_members where login_id=?)";
    $groupresult = db_query($query, array($folder_id, $login_id));
    $roles = array();
    foreach ($groupresult as $result){
        array_push($roles, $result['role']);
    }
    if (empty($roles)){
        return "";
    }
    usort($roles, "compare_roles");
    return $roles[0];
}

/**
 * 
 * Function is user an editor
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $folder_id - the folder ID
 * @params number $login_id - the current user ID
 * @return bool - is the user an editor of this file
 * @package
 */

function is_user_an_editor_folder($folder_id, $login_id){
    require_once("template_status.php");
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = "select role from {$prefix}folderrights where login_id= ? AND folder_id = ? ";
    $params = array($login_id, $folder_id );

    $row = db_query_one($query, $params);
    //check for group rights and use highest role
    $groupright = get_user_group_access_rights_folder($login_id, $folder_id);
    $roles = array($row['role'], $groupright);
    usort($roles, "compare_roles");

    if(($roles[0]=="creator")||($roles[0]=="co-author")||($roles[0]=="editor")){

        return true;

    }else{

        return false;

    }

}

/**
 * 
 * Function is user creator
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $folder_id - the folder ID
 * @return bool - Is this user the creator
 * @package
 */

function is_user_creator_folder($folder_id){

    global $xerte_toolkits_site;

    $row = db_query_one("select role from {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id=? AND login_id=?", array($folder_id, $_SESSION['toolkits_logon_id']));

    if($row['role']=="creator"){
        return true;
    }else{
        return false;
    }
}

function is_user_creator_or_coauthor_folder($folder_id){
    require_once("template_status.php");
    global $xerte_toolkits_site;

    $login_id = $_SESSION['toolkits_logon_id'];
    $row = db_query_one("select role from {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id=? AND login_id=?", array($folder_id, $login_id));
    //check for group rights and use highest role
    $groupright = get_user_group_access_rights_folder($login_id, $folder_id);
    $roles = array($row['role'], $groupright);
    usort($roles, "compare_roles");

    if($roles[0]=="creator" || $roles[0]=="co-author"){
        return true;
    }else{
        return false;
    }
}
