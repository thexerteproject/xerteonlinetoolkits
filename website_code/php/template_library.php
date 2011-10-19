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

    include_once "error_library.php";

    if($row == false) {
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get the maximum template number", "Failed to get the maximum template number");
    }
    else {
        return $row['count'];
    }

}

