<?php
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

    $query_for_read_only = "select " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id, role, " . $xerte_toolkits_site->database_table_prefix . "logindetails.username, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_name from " . $xerte_toolkits_site->database_table_prefix . "templaterights, " . $xerte_toolkits_site->database_table_prefix . "logindetails, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails, " . $xerte_toolkits_site->database_table_prefix . "templatedetails where " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_type_id = " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.creator_id = " . $xerte_toolkits_site->database_table_prefix . "logindetails.login_id and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id=\"" . $_GET['template_id'] . "\" AND role=\"read-only\"";

    $query_for_number_of_rows = "select " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id, role, " . $xerte_toolkits_site->database_table_prefix . "logindetails.username, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_name from " . $xerte_toolkits_site->database_table_prefix . "templaterights, " . $xerte_toolkits_site->database_table_prefix . "logindetails, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails, " . $xerte_toolkits_site->database_table_prefix . "templatedetails where " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_type_id = " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id = " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.creator_id = " . $xerte_toolkits_site->database_table_prefix . "logindetails.login_id and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id=\"" . $_GET['template_id'] . "\"";

    $query_response = mysql_query($query_for_read_only);

    $read_only_rows = mysql_num_rows($query_response);

    $query_response = mysql_query($query_for_number_of_rows);

    $overall_rows = mysql_num_rows($query_response);

    if(mysql_num_rows($query_response)!=0){

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

    $query = "select role from " . $xerte_toolkits_site->database_table_prefix . "templaterights where user_id=\"" .  $user_id  . "\" and template_id=\"" . $template_id . "\"";

    $query_response = mysql_query($query);

    $row = mysql_fetch_array($query_response);

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

    $query_for_template_status = "select " . $xerte_toolkits_site->database_table_prefix . "templatedetails.access_to_whom from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where template_id=\"" . $id . "\"";

    $query_response = mysql_query($query_for_template_status);

    $row = mysql_fetch_array($query_response);

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

    $query_for_template_status = "select " . $xerte_toolkits_site->database_table_prefix . "templatedetails.access_to_whom from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where template_id=\"" . $_GET['template_id'] . "\"";

    $query_response = mysql_query($query_for_template_status);

    $row = mysql_fetch_array($query_response);

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
