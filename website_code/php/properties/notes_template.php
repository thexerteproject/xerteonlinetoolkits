<?php
/**
 * 
 * notes template, displays notes on a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";

include "../user_library.php";

include "properties_library.php";

$database_connect_id = database_connect("notes template database connect success", "notes template database connect failed");

if(is_numeric($_POST['template_id'])){

    if(is_user_creator($_POST['template_id'])||is_user_admin()){

        $query_for_template_notes = "select notes from " . $xerte_toolkits_site->database_table_prefix . "templaterights where template_id=" . mysql_real_escape_string($_POST['template_id']);

        $query_notes_response = mysql_query($query_for_template_notes);

        $row_notes = mysql_fetch_array($query_notes_response);

        notes_display($row_notes['notes'],false);

    }else{

        notes_display_fail();

    }

}

?>
