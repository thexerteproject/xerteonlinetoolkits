<?php
/**
 * 
 * function get maximum template number, finds the highest template number
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function get_maximum_template_number(){

    global $xerte_toolkits_site;

    $row = db_query_one("SELECT max(template_id) as count FROM {$xerte_toolkits_site->database_table_prefix}templatedetails");

    if($row == false) {
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get the maximum template number", "Failed to get the maximum template number");
    }
    else {
        return $row['count'];
    }

}

function get_template_type($template_id){

    global $xerte_toolkits_site;

    $row = db_query_one("SELECT template_framework as frame, {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails.template_name as tname FROM {$xerte_toolkits_site->database_table_prefix}templatedetails, {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails WHERE {$xerte_toolkits_site->database_table_prefix}templatedetails.template_type_id =  {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails.template_type_id and template_id = ?", array($template_id));

    if($row == false) {
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get template type", "Failed to get the template type");
    }
    else {
        return $row['frame'] . "_" . $row['tname'];
    }

}

