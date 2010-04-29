<?PHP /**
	 * 
	 * peer page, allows for the peer review of a template
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */

	require("config.php");

	require $xerte_toolkits_site->php_library_path . "login_library.php";
	require $xerte_toolkits_site->php_library_path . "display_library.php";
	require $xerte_toolkits_site->php_library_path . "database_library.php";

	$mysql_id=database_connect("peer.php database connect success","peer.php database connect failure");

	$query_for_security_content = "select * from " . $xerte_toolkits_site->database_table_prefix . "play_security_details";

	$query_for_security_content_response = mysql_query($query_for_security_content);
	
	/**
	 *  Check the template ID is a number
	 */

	$safe_template_id = mysql_real_escape_string($_GET['template_id']);
	 
	if(is_numeric($safe_template_id)){

		$query_to_check_peer = "select * from " . $xerte_toolkits_site->database_table_prefix . "additional_sharing where sharing_type=\"peer\" and template_id=\"" . $safe_template_id . "\"";

		$query_for_peer_response = mysql_query($query_to_check_peer);

		/**
		 *  The number of rows being not equal to 0, indicates peer review has been set up.
		 */

		if(mysql_num_rows($query_for_peer_response)!=0){


			/**
			 *  Peer review needs a password, so check if anything has been posted
			 */

			if($_SERVER['REQUEST_METHOD'] == 'POST') {
						 
			 /**
			 *  Check the password againsr the value in the database
			 */

				$query_to_check_peer = "select * from " . $xerte_toolkits_site->database_table_prefix . "additional_sharing where sharing_type=\"peer\" and template_id=\"" . $safe_template_id . "\" and extra =\"" . $_POST['password'] . "\"";
				
				$query_for_peer_response = mysql_query($query_to_check_peer);

				if(mysql_num_rows($query_for_peer_response)!=0){
					
				/**
				 *  Output the code
				 */

					require $xerte_toolkits_site->php_library_path . "screen_size_library.php";

					$query_for_play_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

					$query_for_play_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_play_content_strip);

					$query_for_play_content_response = mysql_query($query_for_play_content);

					$row_play = mysql_fetch_array($query_for_play_content_response);

					require $xerte_toolkits_site->root_file_path . "modules/" . $row_play['template_framework'] . "/peer.php";

					show_template($row_play);				

				}else{
				
					$buffer = $xerte_toolkits_site->peer_form_string . $temp[1] . "<p>Sorry login has failed.</p></center></body></html>";

					echo $buffer;
	
				}		

			}else{
			
			/**
			 *  Nothing posted so output the password string
			 */

				echo $xerte_toolkits_site->peer_form_string;

			}
		}else{

			dont_show_template();

		}

	}		

?>