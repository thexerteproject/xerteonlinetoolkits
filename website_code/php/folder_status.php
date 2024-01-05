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

    $shared = get_shared_groups_of_folder($folder_id);
    if (empty($shared)) {
        $query = db_query("select folder_id from {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id=?", array($folder_id));
        if (sizeof($query) > 0) {
            return true;
        }
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

    $result = get_implicit_folder_role($login_id, $folder_id);
    //$query = "select * from {$xerte_toolkits_site->database_table_prefix}folderrights where login_id=? AND folder_id = ?";
    //$result = db_query_one($query, array($login_id, $folder_id));

    //group rights:
    $query = "select role from {$xerte_toolkits_site->database_table_prefix}folder_group_rights where folder_id = ? AND " .
             "group_id IN (select group_id from {$xerte_toolkits_site->database_table_prefix}user_group_members where login_id=?)";
    $groupresult = db_query($query, array($folder_id, $login_id));
    $implicit_group = get_implicit_folder_group_role($login_id, $folder_id);

    if($result != "" || !empty($groupresult) || $implicit_group != "") {
        return true;
    }
    return false;
}

function get_user_access_rights_folder($folder_id){
    require_once("template_status.php");
    global $xerte_toolkits_site;
    $login_id = $_SESSION['toolkits_logon_id'];
    $role = get_implicit_folder_role($login_id, $folder_id);
    //$row = db_query_one("select role from {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id=? AND login_id=?", array($folder_id, $login_id));
    $groupresult = get_user_group_access_rights_folder($login_id, $folder_id);
    $implicit_group = get_implicit_folder_group_role($login_id, $folder_id);
    $roles = array($role, $groupresult, $implicit_group);
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
    //$query = "select role from {$prefix}folderrights where login_id= ? AND folder_id = ? ";
    //$params = array($login_id, $folder_id );

    //$row = db_query_one($query, $params);
    $role = get_implicit_folder_role($login_id, $folder_id);
    //check for group rights and use highest role
    $groupright = get_user_group_access_rights_folder($login_id, $folder_id);
    $roles = array($role, $groupright);
    usort($roles, "compare_roles");

    if(($roles[0]=="creator")||($roles[0]=="co-author")||($roles[0]=="editor")){

        return true;

    }else{
        $implicit_group = get_implicit_folder_group_role($login_id, $folder_id);
        if(($implicit_group=="creator")||($implicit_group=="co-author")||($implicit_group=="editor")){
            return true;
        }
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
    //$row = db_query_one("select role from {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id=? AND login_id=?", array($folder_id, $login_id));
    $role = get_implicit_folder_role($login_id, $folder_id);
    //check for group rights and use highest role
    $groupright = get_user_group_access_rights_folder($login_id, $folder_id);
    $roles = array($role, $groupright);
    usort($roles, "compare_roles");

    if($roles[0]=="creator" || $roles[0]=="co-author"){
        return true;
    }else{
        $implicit_group = get_implicit_folder_group_role($login_id, $folder_id);
        if(($implicit_group=="creator") || ($implicit_group=="co-author")){
            return true;
        }

        return false;
    }
}

function get_implicit_folder_role($login_id, $folder_id, $group_id=-1){
    require_once("template_status.php");
    global $xerte_toolkits_site;
    $role_known = false;
    $pre = $xerte_toolkits_site->database_table_prefix;
    $current_known_roles = array();

    $failsafe = 50; // Folders are probably never 50 deep, and this prevents an infinite loop
    while (!$role_known && $failsafe > 0){
        $result = null;
        if ($group_id == -1){
            //selects original parent and this user's role (if it exists) of this folder
            $query = "select fr.folder_parent, fr2.role from {$pre}folderrights fr " .
                "LEFT JOIN {$pre}folderrights fr2 ON fr2.folder_id=fr.folder_id and fr2.login_id = ? " .
                "where fr.folder_id=? and fr.role='creator'";
            $result = db_query_one($query, array($login_id, $folder_id));
        }else{ // check in group rights
            $query = "select fr.folder_parent, fgr.role from {$pre}folderrights fr ".
                "LEFT JOIN {$pre}folder_group_rights fgr ON fgr.folder_id=fr.folder_id and fgr.group_id = ?".
                "where fr.folder_id=? and fr.role='creator'";
            $result = db_query_one($query, array($group_id, $folder_id));
        }
        if (!is_null($result['role'])){
            array_push($current_known_roles, $result['role']);
            if ($result['role'] == 'creator' or $result['role'] == 'co-author'){
                $role_known = true;
            }
        }
        if ($result['folder_parent'] == 0){
            $role_known = true;
        }
        $folder_id = $result['folder_parent'];
        $failsafe--;
    }
    if (!empty($current_known_roles)){
        usort($current_known_roles, "compare_roles");
        return $current_known_roles[0];
    }
    return "";
}

function get_implicit_folder_group_role($login_id, $folder_id){
    global $xerte_toolkits_site;
    //Check to which groups the user belongs to
    $query = "SELECT group_id FROM {$xerte_toolkits_site->database_table_prefix}user_group_members where login_id=?";
    $groups = db_query($query, array($login_id));
    $results = array();
    foreach ($groups as $group) {
        $results[] = get_implicit_folder_role($login_id, $folder_id, $group_id=$group['group_id']);
    }
    if (!empty($results)){
        usort($results, "compare_roles");
        return $results[0];
    }
    return "";

}

function get_shared_users_of_folder($folder_id, $only_ids=false){
    global $xerte_toolkits_site;
    $query = "SELECT login_id, role FROM {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id=?";
    $results = db_query($query, array($folder_id));

    if ($only_ids){
        $ids = array();
        foreach ($results as $result){
            $ids[] = $result['login_id'];
        }
        return $ids;
    }
    return $results;
}

function get_shared_groups_of_folder($folder_id, $only_ids=false){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query = "select fgr.group_id, fgr.role from {$prefix}folder_group_rights fgr where fgr.folder_id=? ";
    $result = db_query($query, array($folder_id));

    if ($only_ids){
        $ids = array();
        foreach ($result as $row){
            $ids[] = $row['group_id'];
        }
        return $ids;
    }
    return $result;
}

function get_shared_ancestor($template_id)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    // Get the folder id of the template

    $query = "select folder from {$prefix}templaterights where template_id=? and role='creator'";
    $folder_id = db_query_one($query, array($template_id));

    return get_shared_folder_ancestor($folder_id['folder'], true);
}

function get_shared_folder_ancestor($folder_id, $is_parent_of_template = false)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $folder = $folder_id;
    $parent = -1;

    $i = 0;
    while ($parent != 0 && $i < 50) {   // $i s a failsafe, max 50 levels deep
        // Check if the folder is shared
        $shared = get_shared_groups_of_folder($folder);
        if (empty($shared)) {
            // Check if folder itself is shared
            $sql = "select fr.folder_parent, count(fr2.folder_id) as nrshared from {$prefix}folderrights fr, {$prefix}folderrights fr2 where fr.folder_id=? and fr.login_id=? and fr2.folder_id=fr.folder_id group by fr2.folder_id, fr.folder_parent";
            $result = db_query_one($sql, array($folder, $_SESSION['toolkits_logon_id']));
            if ($result != null && $result['nrshared'] > 1) {
                return $folder;
            }
            else{
                $sql = "select fr.folder_parent from {$prefix}folderrights fr where fr.folder_id=? and fr.role=?";
                $result = db_query_one($sql, array($folder, 'creator'));
                $parent = $result['folder_parent'];
                $folder = $parent;
            }
        }
        else
        {
            if ($folder != $folder_id || $is_parent_of_template) {
                return $folder;
            }
            else{
                $sql = "select fr.folder_parent from {$prefix}folderrights fr where fr.folder_id=? and fr.login_id=?";
                $result = db_query_one($sql, array($folder, $_SESSION['toolkits_logon_id']));

                if ($result == null)
                {
                    $sql = "select fr.folder_parent from {$prefix}folderrights fr where fr.folder_id=? and fr.role=?";
                    $result = db_query_one($sql, array($folder, 'creator'));
                }
                $parent = $result['folder_parent'];
                $folder = $parent;
            }
        }
        $i++;
    }
    return false;
}


function is_folder_shared_subfolder($folder_id)
{
    $ancestor = get_shared_folder_ancestor($folder_id);
    return ($ancestor !== false &&  $ancestor != $folder_id);
}
