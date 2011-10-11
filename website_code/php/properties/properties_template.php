<?PHP     /**
* 
* properties template, shows the basic page on the properties window
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/
	
	require("../../../config.php");
	require("../../../session.php");

	include "../database_library.php";
	include "../template_status.php";
	include "../screen_size_library.php";
	include "../url_library.php";
	include "../user_library.php";
	include "properties_library.php";
	
	if(is_numeric($_POST['template_id'])){

		$tutorial_id = mysql_real_escape_string($_POST['template_id']);

		$database_id=database_connect("Properties template database connect success","Properties template database connect failed");

		// User has to have some rights to do this

		if(has_rights_to_this_template(mysql_real_escape_string($_POST['template_id']), $_SESSION['toolkits_logon_id'])||is_user_admin()){

			properties_display($xerte_toolkits_site,$tutorial_id,false);

		}else{

			properties_display_fail();

		}
	
	}

?>