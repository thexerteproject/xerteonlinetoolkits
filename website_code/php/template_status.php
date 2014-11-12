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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
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

    $overall_rows = sizeof($query_response);

    if(sizeof($overall_rows)!=0){

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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function has_rights_to_this_template($template_id, $user_id){
    global $xerte_toolkits_site;
    $query = "select * from {$xerte_toolkits_site->database_table_prefix}templaterights where user_id=? AND template_id = ?";
    $result = db_query_one($query, array($user_id, $template_id));

    if(!empty($result)) {
        return true;
    }
    return false;
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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function is_user_an_editor($template_id, $user_id){

    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = "select role from {$prefix}templaterights where user_id= ? AND template_id = ? ";
    $params = array($user_id, $template_id );

    $row = db_query_one($query, $params);

    if(($row['role']=="creator")||($row['role']=="editor")){

        return true;

    }else{

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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
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
