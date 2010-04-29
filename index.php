<?PHP require("config.php");

	/**
	 * 
	 * Login page, self posts to become management page
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */

	/**
	 *  Create the basic session
	 */

	if ($_SERVER['REQUEST_METHOD'] == 'POST') {

		//$session_id = $_POST['login']. time();

		//session_id($session_id);
		//session_name($xerte_toolkits_site->site_session_name);
		session_start();

	}

	include $xerte_toolkits_site->php_library_path . "login_library.php";

	include $xerte_toolkits_site->php_library_path . "display_library.php";

	/**
	 *  Check to see if anything has been posted to distinguish between log in attempts
	 */

	if((!isset($_POST["login"]))&&(!isset($_POST["password"]))){

		$buffer = login_page_format_top(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_top"));

		$buffer .= $form_string;

		$buffer .= login_page_format_bottom(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_bottom"));

		echo $buffer;

	}

	/*
	* Some data has bee posted, interpret as attempt to login
	*/

	if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	
		/**
		* Username and password left empty
		*/

		if(($_POST["login"]=="")&&($_POST["password"]=="")){
			
			$buffer = login_page_format_top(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_top"));

			$buffer .= "<p>Please enter your username and password</p>";

			$buffer .= login_page_format_bottom(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_bottom"));	

			echo $buffer;

		/*
		* Username left empty
		*/
	
		}else if($_POST["login"]==""){

			$buffer = login_page_format_top(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_top"));

			$buffer .= "<p>Please enter your username</p>";

			$buffer .= login_page_format_bottom(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_bottom"));	

			echo $buffer;
			
		/*
		* Password left empty
		*/
	
		}else if($_POST["password"]==""){
	
			$buffer = login_page_format_top(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_top"));

			$buffer .= "<p>Please enter your password</p>";

			$buffer .= login_page_format_bottom(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_bottom"));

			echo $buffer;
	
		/*
		* Password and username provided, so try to authenticate
		*/
	
		}else if(($_POST["login"]!="")&&($_POST["password"]!="")){
		
		/*
		* See if the submitted values are valid logins
		*/
		
			if(valid_login($_POST["login"],$_POST["password"])){
				
				/*
				* Give the session its own session id
				*/		

				$_SESSION['toolkits_sessionid'] = $session_id; 

				
				/*
				* Get some user details back from LDAP
				*/

				$entry = get_user_details($_POST["login"],$_POST["password"]);

				$_SESSION['toolkits_firstname'] = $entry[0][givenname][0];
				
				$_SESSION['toolkits_surname'] = $entry[0][sn][0];

				include $xerte_toolkits_site->php_library_path . "database_library.php";

				include $xerte_toolkits_site->php_library_path . "user_library.php";

				$mysql_id=database_connect("index.php database connect success","index.php database connect fail");			

				$_SESSION['toolkits_logon_username'] = $_POST["login"];

				/*
				* Check to see if this is a users' first time on the site
				*/

				if(check_if_first_time($_SESSION['toolkits_logon_username'])){

					/*
					*	create the user a new id			
					*/

					$_SESSION['toolkits_logon_id'] = create_user_id();

					/*
					*   create a virtual root folder for this user
					*/

					create_a_virtual_root_folder();			

				}else{
				
					/*
					* User exists so update the user settings
					*/

					$_SESSION['toolkits_logon_id'] = get_user_id();

					update_user_logon_time();
		
				}

				recycle_bin();		

				/*
				* Output the main page, including the user's and blank templates
				*/
				
				echo file_get_contents($xerte_toolkits_site->website_code_path . "management_headers");

				echo "<script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS\n";

				echo "var site_url = \"" . $xerte_toolkits_site->site_url .  "\";\n";

				echo "var site_apache = \"" . $xerte_toolkits_site->apache .  "\";\n";

				echo "var properties_ajax_php_path = \"website_code/php/properties/\";\n var management_ajax_php_path = \"website_code/php/management/\";\n var ajax_php_path = \"website_code/php/\";\n";

				echo file_get_contents($xerte_toolkits_site->website_code_path . "management_top");
			
				list_users_projects("data_down");

				echo logged_in_page_format_middle(file_get_contents($xerte_toolkits_site->website_code_path . "management_middle"));

				list_blank_templates();

				echo file_get_contents($xerte_toolkits_site->website_code_path . "management_bottom");

			}else{
			
				/*
				* login has failed
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
