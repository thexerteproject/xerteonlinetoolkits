<?php
/**
 * 
 * rename template, allows a user to rename a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";
include "../screen_size_library.php";
include "../url_library.php";
include "properties_library.php";

if(is_numeric($_POST['template_id'])){

    $tutorial_id = (int)$_POST['template_id'];

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $database_id = database_connect("Template rename database connect success","Template rename database connect failed");

    $query = "update {$prefix}templatedetails SET template_name = ? WHERE template_id = ?";
    $params = array(str_replace(" ", "_", $_POST['template_name']), $_POST['template_id']);

    if(db_query($query, $params)) {

        $query_for_names = "select template_name, date_created, date_modified from {$prefix}templatedetails where template_id=?"; 
        $params = array($tutorial_id);

        $row = db_query_one($query_for_names, $params); 

        echo "~~**~~" . $_POST['template_name'] . "~~**~~";	

        properties_display($xerte_toolkits_site,$tutorial_id,true,"name");

    }else{

    }

}
