<?PHP     /**
	 * 
	 * data page, allows other sites to consume the xml of a toolkit
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */
	 
	require("config.php");

	require $xerte_toolkits_site->php_library_path  . "database_library.php";
	require $xerte_toolkits_site->php_library_path  . "template_status.php";
	require $xerte_toolkits_site->php_library_path  . "display_library.php";
	
	/**
	 *  connect to the database
	 */

	$mysql_id=database_connect("data database connect successful","data database connect failed");

	/**
	 *  Check the template ID is a number
	 */

	if(is_numeric(mysql_real_escape_string($_GET['template_id']))){
		
	/**
	 *  Run the standard query from config.php, excessive in this case, but suitable
	 */ 

		$query_to_check_data = "select * from " . $xerte_toolkits_site->database_table_prefix . "additional_sharing where sharing_type=\"xml\" and template_id=\"" . mysql_real_escape_string($_GET['template_id']) . "\"";

		$query_for_data_response = mysql_query($query_to_check_data);

	/**
	 *  Check to see if for this ID a data value is set in additional sharing.
	 */

		if(mysql_num_rows($query_for_data_response)!=0){

			$row_data = mysql_fetch_array($query_for_data_response);

	/**
	 *  The extra value in this case is the hostname we have limited XML consumption too, and as such see it exists
	 */

			if($row_data['extra']!=""){
			
			/**
			 *  Compare to the host variables
			 */

				if(($row_data['extra']==$_SERVER['HTTP_REFERER'])||($row_data['extra']==$_SERVER['REMOTE_ADDR'])){
				
					/**
					 *  Fetch and return the XML
					 */

					$query_for_preview_content = $xerte_toolkits_site->play_edit_preview_query;
		
					$query_for_preview_content_response = mysql_query($query_for_preview_content);
		
					$row = mysql_fetch_array($query_for_preview_content_response);
		
					$query_for_username = "select username from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id=\"" . $row['user_id'] . "\"";
		
					$query_for_username_response = mysql_query($query_for_username);
		
					$row_username = mysql_fetch_array($query_for_username_response);
		
					$path = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/";
		
					echo str_replace("FileLocation + '", $xerte_toolkits_site->site_url . $path, file_get_contents($path . "data.xml"));	

				}else{

					dont_show_template();

				}


			}else{
			
				/**
				 *  Fetch and return the XML
				 */

				$query_for_play_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);
				
				$query_for_play_content = str_replace("TEMPLATE_ID_TO_REPLACE", mysql_real_escape_string($_GET['template_id']), $query_for_play_content_strip);

				$query_for_play_content_response = mysql_query($query_for_play_content);

				$row = mysql_fetch_array($query_for_play_content_response);
		
				$query_for_username = "select username from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id=\"" . $row['user_id'] . "\"";
		
				$query_for_username_response = mysql_query($query_for_username);
		
				$row_username = mysql_fetch_array($query_for_username_response);
		
				$path = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/";

				echo str_replace("FileLocation + '", $xerte_toolkits_site->site_url . $path, file_get_contents($path . "data.xml"));	


			}
			

		}else{

			/***  
				Display nothing
			*/

			echo "XML Sharing not set up";

			dont_show_template();

		}

	}else{

		/**
		 *  Display nothing
		 */

		dont_show_template();

	}



?>