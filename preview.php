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

        /*
         * Standard query
         */
        $query_for_preview_content = "select otd.template_name, ld.username, otd.template_framework, tr.user_id, tr.folder, tr.template_id, td.access_to_whom, td.extra_flags";
        $query_for_preview_content .= " from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails otd, " . $xerte_toolkits_site->database_table_prefix . "templaterights tr, " . $xerte_toolkits_site->database_table_prefix . "templatedetails td, " . $xerte_toolkits_site->database_table_prefix . "logindetails ld";
        $query_for_preview_content .= " where td.template_type_id = otd.template_type_id and td.creator_id = ld.login_id and tr.template_id = td.template_id and tr.template_id=" . $safe_template_id .  " and role='creator'";

		$row = db_query_one($query_for_preview_content);
        if(!empty($row)) {

            // get their username from the db which matches their login_id from the $_SESSION
            // ???? This is just the same user as in the previous query, NOT from the session. WHY?
            //$row_username = db_query_one("select username from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?", array($row['user_id']));

            require $xerte_toolkits_site->root_file_path . "modules/" . $row['template_framework'] . "/preview.php";

            // is there a matching template?
            // if they're an admin or have rights to see the template, then show it.
            if(is_user_admin() || has_rights_to_this_template($row['template_id'], $_SESSION['toolkits_logon_id'])){
                show_preview_code($row);
                exit(0);
            }
        }
		
    }else{
	
		echo PREVIEW_RESOURCE_FAIL;
			
	}
	
}else{

	echo PREVIEW_RESOURCE_FAIL;
	
}
