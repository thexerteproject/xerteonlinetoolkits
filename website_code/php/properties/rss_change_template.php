<?PHP     /**
* 
* rss change template, allows a user to rename a template
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

	include "../url_library.php";

	include "../user_library.php";
	
	include "properties_library.php";

	if(is_numeric($_POST['template_id'])){

		$database_connect_id = database_connect("rss template database connect success", "rss template database connect failed");

		if(is_user_creator(mysql_real_escape_string($_POST['template_id']))||is_user_admin()){

			$query_for_rss_status = "select rss from " . $xerte_toolkits_site->database_table_prefix . "templatesyndication where template_id=" . mysql_real_escape_string($_POST['template_id']);

			$query_for_rss_response = mysql_query($query_for_rss_status);

			if(mysql_num_rows($query_for_rss_response)==0){

				$query_to_change_rss_status = "Insert into " . $xerte_toolkits_site->database_table_prefix . "templatesyndication(template_id,rss,export,description) VALUES (" . mysql_real_escape_string($_POST['template_id']) . ",'" . mysql_real_escape_string($_POST['rss']) . "','" . mysql_real_escape_string($_POST['export']) . "','" . mysql_real_escape_string($_POST['desc']) . "')";

			}else{
			
				$query_to_change_rss_status = "update " . $xerte_toolkits_site->database_table_prefix . "templatesyndication set rss='" . mysql_real_escape_string($_POST['rss']) . "', export='" . mysql_real_escape_string($_POST['export']) . "', description='" . mysql_real_escape_string($_POST['desc']) . "' where template_id=" . mysql_real_escape_string($_POST['template_id']);

			}

			$query_to_change_rss_status = mysql_query($query_to_change_rss_status);

			if(template_access_settings($_POST['template_id'])=="Public"){

				$query_for_name = "select firstname,surname from " . $xerte_toolkits_site->database_table_prefix . "logindetails where login_id=" . $_SESSION['toolkits_logon_id'];

				$query_for_name_response = mysql_query($query_for_name);

				$row_name = mysql_fetch_array($query_for_name_response);

				rss_display($xerte_toolkits_site,mysql_real_escape_string($_POST['template_id']),true);
			
			}else{

				rss_display_public();

			}

		}else{

			rss_display_fail();

		}
		
	}

?>