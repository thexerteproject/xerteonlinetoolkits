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
 
/*
 * 
 * Function is template rss
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $template_id - the template ID
 * @return bool - is template in the RSS
 * 
 * @package
 */

function is_template_rss($template_id){

    global $xerte_toolkits_site;

    $query_response = db_query("select template_id from {$xerte_toolkits_site->database_table_prefix}templatesyndication where template_id=? AND rss='true'", array($template_id));
    if(sizeof($query_response)>0) {
        return true;
    }
    return false;

}

/**
 * 
 * Function is template syndicated
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $template_id - the template ID
 * @return bool - is template syndicated
 * @package
 */

function is_template_syndicated($template_id){

    global $xerte_toolkits_site;

    $query_response = db_query("select template_id from {$xerte_toolkits_site->database_table_prefix}templatesyndication where template_id=? AND syndication='true'", array($template_id));
    if(sizeof($query_response)>0) {
        return true;
    }
    return false;

}

/**
 * 
 * Function is template exportable
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $template_id - the template ID
 * @return bool - is template syndicated
 * @package
 */

function is_template_exportable($template_id){

    global $xerte_toolkits_site;
    $query_response = db_query("select template_id from {$xerte_toolkits_site->database_table_prefix}templatesyndication where template_id=? AND export='true'", array($template_id));
    if(sizeof($query_response)>0) {
        return true;
    }
    return false;

}

/**
 * 
 * Function is template shared
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $template_id - the template ID
 * @return bool - is template shared
 * @package
 */

function is_template_shared($template_id){

    global $xerte_toolkits_site;

    $query = db_query("select template_id from {$xerte_toolkits_site->database_table_prefix}templaterights where template_id=?", array($template_id));
    if(sizeof($query)>0) {
        return true;
    }
    return false;

}

/**
 * 
 * Function has template multiple editors
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $template_id - the template ID
 * @return bool - has the template multiple editors
 * @package
 */

function has_template_multiple_editors($template_id){

    global $xerte_toolkits_site;

    $prefix =  $xerte_toolkits_site->database_table_prefix;
    
    $query_for_read_only = "select {$prefix}templaterights.template_id, role, {$prefix}logindetails.username, "
    . "{$prefix}originaltemplatesdetails.template_name FROM {$prefix}templaterights, {$prefix}logindetails, "
    . "{$prefix}originaltemplatesdetails, {$prefix}templatedetails where "
    . "{$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id AND "
    . "{$prefix}templaterights.template_id = {$prefix}templatedetails.template_id and "
    . "{$prefix}templatedetails.creator_id = {$prefix}logindetails.login_id and "
    . "{$prefix}templaterights.template_id= ? AND role = ?";
    $params = array($_GET['template_id'], "read-only");

    $query_response = db_query($query_for_read_only, $params);
    $read_only_rows = sizeof($query_response);
    
    $query_for_number_of_rows = "select {$prefix}templaterights.template_id, role, "
    . "{$prefix}logindetails.username, {$prefix}originaltemplatesdetails.template_name from "
    . "{$prefix}templaterights, {$prefix}logindetails, {$prefix}originaltemplatesdetails, "
    . "{$prefix}templatedetails where "
    . "{$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id AND "
    . "{$prefix}templaterights.template_id = {$prefix}templatedetails.template_id and "
    . "{$prefix}templatedetails.creator_id = {$prefix}logindetails.login_id and "
    . "{$prefix}templaterights.template_id = ?";

    $params = array($_GET['template_id']);
    
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
 * Function has rights to this template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $template_id - the template ID
 * @params number $user_id - the current user ID
 * @return bool - does this ID have rights to this template
 * @package
 */

function has_rights_to_this_template($template_id, $user_id){
    global $xerte_toolkits_site;
    require_once('folder_status.php');
    $pre = $xerte_toolkits_site->database_table_prefix;
    //individual rights:
    $query = "select role, folder from {$pre}templaterights where user_id=? AND template_id = ?";
    $result = db_query_one($query, array($user_id, $template_id));

    //group rights:
    $query = "select role from {$xerte_toolkits_site->database_table_prefix}template_group_rights where template_id = ? AND " .
             "group_id IN (select group_id from {$xerte_toolkits_site->database_table_prefix}user_group_members where login_id=?)";
    $groupresult = db_query($query, array($template_id, $user_id));


    if(!empty($result) || !empty($groupresult)) {
        return true;
    }else{
        //implicit role:
        $implicit = get_implicit_role($template_id, $user_id);
        if ( $implicit != ""){
            return true;
        }else{
            //implicit group role
            $implicit_group = get_implicit_group_role($template_id, $user_id);
            if ( $implicit_group != ""){
                return true;
            }
        }
    }
    return false;
}

function get_user_access_rights($template_id){

    global $xerte_toolkits_site;
    $user_id = $_SESSION['toolkits_logon_id'];

    $row = db_query_one("select role from {$xerte_toolkits_site->database_table_prefix}templaterights where template_id=? AND user_id=?", array($template_id, $user_id));
    $groupresult = get_user_group_access_rights($user_id, $template_id);
    $implicit = get_implicit_role($template_id, $user_id);
    $implicit_group = get_implicit_group_role($template_id, $user_id);
    $roles = array($row['role'], $groupresult, $implicit, $implicit_group);
    usort($roles, "compare_roles");
    return $roles[0];
}

function get_user_group_access_rights($user_id, $template_id){
    global $xerte_toolkits_site;
    $query = $query = "select role from {$xerte_toolkits_site->database_table_prefix}template_group_rights where template_id = ? AND " .
        "group_id IN (select group_id from {$xerte_toolkits_site->database_table_prefix}user_group_members where login_id=?)";
    $groupresult = db_query($query, array($template_id, $user_id));
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

// custom comparator for roles (high to low = creator, co-author, editor, read-only)
function compare_roles($role1, $role2){
    $a = compare_roles_helper($role1);
    $b = compare_roles_helper($role2);
    if ($a == $b){
        return 0;
    }
    return ($a > $b) ? -1 : 1;
}

function compare_roles_helper($role){
    if ($role == "creator"){
        return 3;
    }elseif ($role == "co-author"){
        return 2;
    }elseif ($role == "editor"){
        return 1;
    }elseif ($role == "read-only"){
        return 0;
    }
    return -1;
}

/**
 * 
 * Function is user an editor
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $template_id - the template ID
 * @params number $user_id - the current user ID
 * @return bool - is the user an editor of this file
 * @package
 */

function is_user_an_editor($template_id, $user_id){

    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = "select role from {$prefix}templaterights where user_id= ? AND template_id = ? ";
    $params = array($user_id, $template_id );

    $row = db_query_one($query, $params);
    //check for group rights and use highest role
    $groupright = get_user_group_access_rights($user_id, $template_id);
    $roles = array($row['role'], $groupright);
    usort($roles, "compare_roles");

    if(($roles[0]=="creator")||($roles[0]=="co-author")||($roles[0]=="editor")){
        return true;
    }else{
        // Only check implicitly if no explicit >=editor role is found to limit queries
        $implicit = get_implicit_role($template_id, $user_id);
        if(($implicit=="creator")||($implicit=="co-author")||($implicit=="editor")){
            return true;
        }else{
            $implicit_group = get_implicit_group_role($template_id, $user_id);
            if(($implicit_group=="creator")||($implicit_group=="co-author")||($implicit_group=="editor")) {
                return true;
            }
        }
        return false;

    }

}

/**
 * 
 * Function template_access_settings
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $template_id - the template ID
 * @return string - the value in access to whom for this template
 * @package
 */

function template_access_settings($id){

    global $xerte_toolkits_site;
    $prefix =  $xerte_toolkits_site->database_table_prefix;
    
    $query_for_template_status = "select {$prefix}templatedetails.access_to_whom from {$prefix}templatedetails where template_id= ?";
    $params = array($id);
    
    $row = db_query_one($query_for_template_status, $params);
    
    return $row['access_to_whom'];

}

/**
 * 
 * Function template_access_settings ******* CHECK THIS ***************
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $template_id - the template ID
 * @params number $user_id - the current user ID
 * @return bool - does this ID have rights to this template
 * @package
 */

function template_access_settings_temp(){

    global $xerte_toolkits_site;
    $prefix =  $xerte_toolkits_site->database_table_prefix;
    
    $query_for_template_status = "select {$prefix}templatedetails.access_to_whom from "
    . "{$prefix}templatedetails where template_id= ?";
    $params = array($_GET['template_id']);

    $row = db_query_one($query_for_template_status, $params); 
    return $row['access_to_whom'];
}

/**
 * 
 * Function is user creator
 *
 * @author Patrick Lockley
 * @version 1.0
 * @params number $template_id - the template ID
 * @return bool - Is this user the creator
 * @package
 */

function is_user_creator($template_id){

    global $xerte_toolkits_site;

    $row = db_query_one("select role from {$xerte_toolkits_site->database_table_prefix}templaterights where template_id=? AND user_id=?", array($template_id, $_SESSION['toolkits_logon_id']));

    if($row['role']=="creator"){
        return true;
    }else{
        return false;
    }
}

function is_user_creator_or_coauthor($template_id){

    global $xerte_toolkits_site;

    $user_id = $_SESSION['toolkits_logon_id'];
    $row = db_query_one("select role from {$xerte_toolkits_site->database_table_prefix}templaterights where template_id=? AND user_id=?", array($template_id, $user_id));
    //check for group rights and use highest role
    $groupright = get_user_group_access_rights($user_id, $template_id);
    $roles = array($row['role'], $groupright);
    usort($roles, "compare_roles");

    if($roles[0]=="creator" || $roles[0]=="co-author"){
        return true;
    }else{
        //Only check implicit roles if no >=co-author already found, to limit queries
        $implicit = get_implicit_role($template_id, $user_id);
        if($implicit=="co-author" || $implicit=="creator") {
            return true;
        }else{
            $implicit_group = get_implicit_group_role($template_id, $user_id);
            if($implicit_group=="creator" || $implicit_group=="co-author") {
                return true;
            }
        }
        return false;
    }
}

function get_implicit_role($template_id, $login_id){
    global $xerte_toolkits_site;
    //find out in what folder this template is:
    $query = "SELECT folder FROM {$xerte_toolkits_site->database_table_prefix}templaterights where template_id =?";
    $rows = db_query($query, array($template_id));

    $current_known_roles = array();

    foreach($rows as $row) {
        if (!is_null($row['folder'])) {
            require_once("folder_status.php");

            $folder_id = $row['folder'];
            $role =  get_implicit_folder_role($login_id, $folder_id);
            array_push($current_known_roles, $role);
        }
    }
    if (!empty($current_known_roles)){
        usort($current_known_roles, "compare_roles");
        return $current_known_roles[0];
    }
    return "";
}

function get_implicit_group_role($template_id, $login_id)
{
    global $xerte_toolkits_site;
    //find out in what folder this template is:
    $query = "SELECT folder FROM {$xerte_toolkits_site->database_table_prefix}templaterights where template_id =? and role='creator'";
    $row = db_query_one($query, array($template_id));
    if (!is_null($row['folder'])) {
        return get_implicit_folder_group_role($login_id, $row['folder']);
    }
    return "";
}
