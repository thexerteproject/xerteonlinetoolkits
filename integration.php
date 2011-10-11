<?PHP     

	require("config.php");

	/**
	 * 
	 * Integration page, generic framework for integrating this service into other systems.
	 *
	 * Please look below at the INSERT strings and make sure you have these sorted
	 * If your system is providing it's own sessions then you also need to empty the code from session.php so it is just the PHP tags and possibly session_start().
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */

	/**
	 *  Create the basic session
	 */

	include $xerte_toolkits_site->php_library_path . "login_library.php";

	include $xerte_toolkits_site->php_library_path . "display_library.php";

	$_SESSION['toolkits_firstname'] = "INSERTFIRSTNAMEHERE";
			
	$_SESSION['toolkits_surname'] = "INSERTSURNAMEHERE";

	include $xerte_toolkits_site->php_library_path . "database_library.php";

	include $xerte_toolkits_site->php_library_path . "user_library.php";

	$mysql_id=database_connect("index.php database connect success","index.php database connect fail");			

	$_SESSION['toolkits_logon_username'] = "INSERTUSERNAMEHERE";

	/*
	* Check to see if this is a users' first time on the site
	*/

	if(check_if_first_time($_SESSION['toolkits_logon_username'])){

		/*
		*   create the user a new id			
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

?>	
</body>
</html>
