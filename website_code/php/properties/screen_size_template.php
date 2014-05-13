<?php
/**
 * 
 * screen size template, gets the xml and returns the size for the display of the template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../screen_size_library.php";

if(is_numeric($_POST['tutorial_id'])){

    $database_id = database_connect("screen size database connect success","screen size database connect failed");

    $prefix =  $xerte_toolkits_site->database_table_prefix ;
    $query_for_template_name = "select {$prefix}originaltemplatesdetails.template_name,"
    . "{$prefix}originaltemplatesdetails.template_framework from {$prefix}originaltemplatesdetails, {$prefix}templatedetails WHERE "
    . "{$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id AND template_id = ?";

    $params = array($_POST['tutorial_id']);
    
    $row_name = db_query_one($query_for_template_name, $params);

    echo get_template_screen_size($row_name['template_name'], $row_name['template_framework']) . "~" . $_POST['tutorial_id'];

}
