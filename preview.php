<?PHP     /**
	 * 
	 * preview page, brings up a preview page for the editor to see their changes
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */

	require("config.php");
	require("session.php");

	require $xerte_toolkits_site->php_library_path  . "database_library.php";
	require $xerte_toolkits_site->php_library_path  . "screen_size_library.php";
	require $xerte_toolkits_site->php_library_path  . "template_status.php";
	require $xerte_toolkits_site->php_library_path  . "user_library.php";
    require $xerte_toolkits_site->php_library_path  . "display_library.php";
	
	/*
	* Check the ID is numeric
	*/
	
	if(is_numeric($_GET['template_id'])){
	
		$safe_template_id = mysql_real_escape_string($_GET['template_id']);

		$mysql_id=database_connect("Preview database connect successful","Preview database connect failed");
		
		/*
		* Standard query
		*/
		
		$query_for_preview_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

		$query_for_preview_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_preview_content_strip);	

		$query_for_preview_content_response = mysql_query($query_for_preview_content);

		if(mysql_num_rows($query_for_preview_content_response)!=0){

			$row = mysql_fetch_array($query_for_preview_content_response);

			/*
			* Check users has some rights to this template
			*/

			if(has_rights_to_this_template($row['template_id'], $_SESSION['toolkits_logon_id'])){

				$query_for_username = "select username from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id=\"" . $row['user_id'] . "\"";
	
				$query_for_username_response = mysql_query($query_for_username);
	
				$row_username = mysql_fetch_array($query_for_username_response);

				require $xerte_toolkits_site->root_file_path . "modules/" . $row['template_framework'] . "/preview.php";

				show_preview_code($row, $row_username);		
				
			/*
			* User might be admin so show code then
			*/	

			}else if(is_user_admin()){

				$mysql_id=database_connect("Preview database connect successful","Preview database connect failed");

				$query_for_username = "select username from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id=\"" . $row['user_id'] . "\"";
	
				$query_for_username_response = mysql_query($query_for_username);
	
				$row_username = mysql_fetch_array($query_for_username_response);

				require $xerte_toolkits_site->root_file_path . "modules/" . $row['template_framework'] . "/preview.php";

				show_preview_code($row, $row_username);	

			}		
	
		}else{

			/*
			* No rights, show error
			*/

			echo edit_xerte_page_format_top(file_get_contents($xerte_toolkits_site->website_code_path  . "error_top")) . "Sorry you cannot access this resource</div></div></body></html>";

			die();

		}

	}else{

		/*
		* No rights, show error
		*/

		echo edit_xerte_page_format_top(file_get_contents($xerte_toolkits_site->website_code_path  . "error_top")) . "Sorry you cannot access this resource</div></div></body></html>";

		die();

	}


?>