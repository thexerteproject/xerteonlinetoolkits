<?php
/**
 * 
 * preview page, brings up a preview page for the editor to see their changes
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once(dirname(__FILE__) . "/config.php");

_load_language_file("/preview.inc");

require $xerte_toolkits_site->php_library_path  . "screen_size_library.php";
require $xerte_toolkits_site->php_library_path  . "template_status.php";
require $xerte_toolkits_site->php_library_path  . "user_library.php";

/*
 * Check the ID is numeric
 */
if(isset($_SESSION['toolkits_logon_id'])) {

    if(is_numeric($_GET['template_id'])) {

        $safe_template_id = (int) $_GET['template_id'];

         // Need to run a proper string replace on any embedded instances of '$xerte_toolkits_site->database_table_prefix' so it's actually expanded.
        $query_for_preview_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

        /*
         * Standard query
         */

        $query_for_preview_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_preview_content_strip);	

		$row = db_query_one($query_for_preview_content);

        // get their username from the db which matches their login_id from the $_SESSION
        $row_username = db_query_one("select username from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?", array($row['user_id']));
		
        
        // is there a matching template?
        if(!empty($row)) {
            // if they're an admin or have rights to see the template, then show it.
            if(is_user_admin() || has_rights_to_this_template($row['template_id'], $_SESSION['toolkits_logon_id'])){
                require $xerte_toolkits_site->root_file_path . "modules/" . $row['template_framework'] . "/preview_bootstrap.php";
                show_preview_code($row, $row_username);		
                exit(0);
            }
			
        }
		
    }else{
	
		echo PREVIEW_RESOURCE_FAIL;;
			
	}
	
}else{

	echo PREVIEW_RESOURCE_FAIL;
	
}
