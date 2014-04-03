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

if(is_numeric($_POST['template_id'])){
    if(is_user_creator($_POST['template_id'])||is_user_admin()){
        $query_for_template_notes = "select notes from {$xerte_toolkits_site->database_table_prefix}templaterights where template_id = ?";
       $row_notes = db_query_one($query_for_template_notes, array($_POST['template_id']));
       notes_display($row_notes['notes'],false);
       exit(0);
    }
}
notes_display_fail();
