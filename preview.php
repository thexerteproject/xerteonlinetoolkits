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

require_once("config.php");

_load_language_file("/preview.inc");

require $xerte_toolkits_site->php_library_path  . "screen_size_library.php";
require $xerte_toolkits_site->php_library_path  . "template_status.php";
require $xerte_toolkits_site->php_library_path  . "user_library.php";

/*
 * Check the ID is numeric
 */

if(isset($_SESSION['toolkits_logon_id'])){

	if(is_numeric($_GET['template_id'])){

		$safe_template_id = mysql_real_escape_string($_GET['template_id']);

		$mysql_id=database_connect("Preview database connect successful","Preview database connect failed");

		/*
		 * Standard query
		 */

		$query_for_preview_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

if(is_numeric($_GET['template_id'])){

    $safe_template_id = mysql_real_escape_string($_GET['template_id']);

    $mysql_id=database_connect("Preview database connect successful","Preview database connect failed");

    /*
     * Standard query
     */

			/*
			 * Check users has some rights to this template
			 */

    $query_for_preview_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_preview_content_strip);	

				$query_for_username = "select username from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id=\"" . $row['user_id'] . "\"";

				$query_for_username_response = mysql_query($query_for_username);

				$row_username = mysql_fetch_array($query_for_username_response);

    if(mysql_num_rows($query_for_preview_content_response)!=0){

				show_preview_code($row, $row_username);		

				/*
				 * User might be admin so show code then
				 */	

			}else if(is_user_admin()){

        if(has_rights_to_this_template($row['template_id'], $_SESSION['toolkits_logon_id'])){

				$query_for_username = "select username from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id=\"" . $row['user_id'] . "\"";

				$query_for_username_response = mysql_query($query_for_username);

				$row_username = mysql_fetch_array($query_for_username_response);

            $query_for_username_response = mysql_query($query_for_username);

            $row_username = mysql_fetch_array($query_for_username_response);

			}		

		}else{

			/*
			 * No rights, show error
			 */

			echo PREVIEW_RESOURCE_FAIL;

        }else if(is_user_admin()){

            $mysql_id=database_connect("Preview database connect successful","Preview database connect failed");
		
            $query_for_username = "select username from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id=\"" . $row['user_id'] . "\"";
	
		echo PREVIEW_RESOURCE_FAIL;

            require $xerte_toolkits_site->root_file_path . "modules/" . $row['template_framework'] . "/preview.php";

            show_preview_code($row, $row_username);	
	
}else{
	
	echo PREVIEW_RESOURCE_FAIL;

	die();

}


?>
