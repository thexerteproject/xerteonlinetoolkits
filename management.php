<?PHP     

	require("config.php");

	/**
	 * 
	 * Login page, self posts to become management page
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */

	
	require $xerte_toolkits_site->php_library_path . "login_library.php";

	require $xerte_toolkits_site->php_library_path . "display_library.php";

	/*
	* As with index.php, check for posts and similar
	*/ 
	
	if((!isset($_POST["login"]))&&(!isset($_POST["password"]))){

		$buffer = login_page_format_top(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "mgt_top"));

		$buffer .= "<p>This is the management panel. Only site administrators can access this resource.</p>";

		$buffer .= login_page_format_bottom(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_bottom"));

		echo $buffer;

	}

	/*
	* Some data has been posted, interpret as a log in attempt
	*/

	if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	
		/**
		* Username and password left empty
		*/

		if(($_POST["login"]=="")&&($_POST["password"]=="")){
			
			$buffer = login_page_format_top(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "mgt_top"));

			$buffer .= "<p>Please enter your username and password</p>";

			$buffer .= login_page_format_bottom(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_bottom"));	

			echo $buffer;

		/*
		* Username left empty
		*/
		
		}else if($_POST["login"]==""){

			$buffer = login_page_format_top(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "mgt_top"));

			$buffer .= "<p>Please enter your username</p>";

			$buffer .= login_page_format_bottom(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_bottom"));	

			echo $buffer;
			
		/*
		* Password left empty
		*/
	
		}else if($_POST["password"]==""){
	
			$buffer = login_page_format_top(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "mgt_top"));

			$buffer .= "<p>Please enter your password</p>";

			$buffer .= login_page_format_bottom(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_bottom"));

			echo $buffer;
	
		
		/*
		* Password and username provided, so try to authenticate
		*/
	
		}else{
		
			if(($_POST["login"]==$xerte_toolkits_site->admin_username)&&($_POST["password"]==$xerte_toolkits_site->admin_password)){
			
				$_SESSION['toolkits_logon_id'] = "site_administrator";	

				require $xerte_toolkits_site->php_library_path . "database_library.php";

				require $xerte_toolkits_site->php_library_path . "user_library.php";

				$_SESSION['toolkits_logon_username'] = "adminuser";				

				$mysql_id=database_connect("management.php database connect success","management.php database connect fail");			
				
				/*
				* Check the user is set as an admin in the usertype record in the logindetails table, and display the page
				*/
			
				echo file_get_contents($xerte_toolkits_site->website_code_path . "admin_headers");

				echo "<script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS\n";

				echo "var site_url = \"" . $xerte_toolkits_site->site_url .  "\";\n";

				echo "var site_apache = \"" . $xerte_toolkits_site->apache .  "\";\n";

				echo "var properties_ajax_php_path = \"website_code/php/properties/\";";

				echo "var management_ajax_php_path = \"website_code/php/management/\";";

				echo "var ajax_php_path = \"website_code/php/\";</script>";

				echo admin_page_format_top(file_get_contents($xerte_toolkits_site->website_code_path . "admin_top"));			

				echo file_get_contents($xerte_toolkits_site->website_code_path . "admin_middle");
				

			}else{
			
				/*
				* Wrong password message
				*/

				$buffer = login_page_format_top(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_top"));

				$buffer .= "<p>Sorry that password combination was not correct</p>";

				$buffer .= login_page_format_bottom(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_bottom"));	
				echo $buffer;	

			}

		}
	
	}

?>	
</body>
</html>
