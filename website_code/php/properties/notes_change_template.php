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

    $query = "update " . $xerte_toolkits_site->database_table_prefix . "templaterights SET notes =\"" . mysql_real_escape_string($_POST['notes']) . "\" WHERE template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";

    if(mysql_query($query)){

        notes_display($_POST['notes'],true);

    }else{

    }

    mysql_close($database_id);

}

?>
