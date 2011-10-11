<?PHP /**
* 
* syndication change template, adds a template to the syndication RSS
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

	include "../user_library.php";
	include "../url_library.php";	
	include "properties_library.php";

	if(is_numeric($_POST['tutorial_id'])){

		$database_connect_id = database_connect("syndication change template database connect success", "syndication change template database connect failed");

		if(is_user_creator(mysql_real_escape_string($_POST['tutorial_id']))||is_user_admin()){
			
			$query_for_syndication_status = "select syndication from " . $xerte_toolkits_site->database_table_prefix . "templatesyndication where template_id=" . mysql_real_escape_string($_POST['tutorial_id']);

			$query_for_syndication_response = mysql_query($query_for_syndication_status);

			if(mysql_num_rows($query_for_syndication_response)==0){

				$query_to_change_syndication_status = "Insert into " . $xerte_toolkits_site->database_table_prefix . "templatesyndication(template_id,syndication,keywords,description,category,license) VALUES (" . mysql_real_escape_string($_POST['tutorial_id']) . ",'" . mysql_real_escape_string($_POST['synd']) . "','" . mysql_real_escape_string($_POST['keywords']) . "','" . mysql_real_escape_string($_POST['description']) . "','" . mysql_real_escape_string($_POST['category_value']) . "','" . mysql_real_escape_string($_POST['license_value']) . "')";

			}else{

				$query_to_change_syndication_status = "update " . $xerte_toolkits_site->database_table_prefix . "templatesyndication set syndication='" . mysql_real_escape_string($_POST['synd']) . "', keywords='" . mysql_real_escape_string($_POST['keywords']) . "', description='" . mysql_real_escape_string($_POST['description']) . "', category='" . mysql_real_escape_string($_POST['category_value']) . "', license='" . mysql_real_escape_string($_POST['license_value']) . "' where template_id=" . mysql_real_escape_string($_POST['tutorial_id']);

			}

			$query_to_change_syndication_status_response = mysql_query($query_to_change_syndication_status);

			/**
			* Check template is public
			*/

			if(template_access_settings(mysql_real_escape_string($_POST['tutorial_id']))=="Public"){
			
				syndication_display($xerte_toolkits_site,true);
			
			}else{

				syndication_not_public($xerte_toolkits_site);
				
			}
				

		}else{

			syndication_display_fail();

		}
		
	}

?>