<?php 
/**
 * 
 * notes change template, updates a users notes on a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../user_library.php";

include "properties_library.php";

if(is_numeric($_POST['template_id'])){

    $database_id = database_connect("notes change template database connect success","notes change template database connect failed");
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = "update {$prefix}templaterights SET notes = ?  WHERE template_id = ?";

    $params = array($_POST['notes'], $_POST['template_id']);
    
    
    if(db_query($query, $params)){

        notes_display($_POST['notes'],true, $_POST['template_id']);

    }else{
        die("db query didn't work?");
    }

}
