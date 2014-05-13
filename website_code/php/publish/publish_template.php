<?php
/**
 * 
 * Edit page, brings up the xerte editor window
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

_load_language_file("/website_code/php/publish/publish_template.inc");

require "../screen_size_library.php";
require "../template_status.php";
require "../display_library.php";
require "../user_library.php";

/**
 * 
 * Function update_access_time
 * This function updates the time a template was last edited
 * @param array $row_edit = an array returned from a mysql query
 * @return bool True or False if two params match
 * @version 1.0
 * @author Patrick Lockley
 */


/*
 * Check the template ID is numeric
 */

if(is_numeric($_POST['template_id'])){

    /*
     * Find out if this user has rights to the template	
     */

    $safe_template_id = (int) $_POST['template_id'];

    $query_for_edit_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

    $query_for_edit_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_edit_content_strip);

    $row_publish = db_query_one($query_for_edit_content);


    if(is_user_an_editor($safe_template_id,$_SESSION['toolkits_logon_id'])){

        // XXX What is temp_array[2] here? Looks broken. TODO: Fix it.
        require("../../../modules/" . $temp_array[2] . "/publish.php");
			
		publish($row_publish, $_POST['template_id']);
			
		echo UPDATE_SUCCESS;
		
    }

}else{

    echo PUBLISH_FAIL;

}
