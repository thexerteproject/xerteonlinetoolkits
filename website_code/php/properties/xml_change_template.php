<?PHP     /**
* 
* xml changetemplate, changes the xml share for this template
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

	$database_id=database_connect("xml change template database connect success","xml change template database connect success");

	if(is_numeric($_POST['template_id'])){

		if(is_user_creator(mysql_real_escape_string($_POST['template_id']))||is_user_admin()){

			if($_POST['xml_status']=="off"){

				$query = "delete from " . $xerte_toolkits_site->database_table_prefix . "additional_sharing where template_id=\"" . mysql_real_escape_string($_POST['template_id']) . "\" AND sharing_type=\"xml\"";

				mysql_query($query);

			}else{

				$query = "select * from " . $xerte_toolkits_site->database_table_prefix . "additional_sharing where sharing_type=\"xml\" AND template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";

				$query_response = mysql_query($query);

				if(mysql_num_rows($query_response)==0){

					if($_POST['address']=="null"){

						$query = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "additional_sharing (template_id, sharing_type, extra) VALUES (" . mysql_real_escape_string($_POST['template_id']) . ", \"xml\",\"\")";

					}else{

						$query = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "additional_sharing (template_id, sharing_type, extra) VALUES (" . mysql_real_escape_string($_POST['template_id']) . ", \"xml\",\"" .  mysql_real_escape_string($_POST['address']) . "\")";

					}

					mysql_query($query);

				}else{

					if($_POST['address']=="null"){

						$query = "UPDATE " . $xerte_toolkits_site->database_table_prefix . "additional_sharing SET extra =\"\" where template_id = \"" . mysql_real_escape_string($_POST['template_id']) . "\"";

					}else{

						$query = "UPDATE " . $xerte_toolkits_site->database_table_prefix . "additional_sharing SET extra =\"" . mysql_real_escape_string($_POST['address']) . "\" where template_id = \"" . mysql_real_escape_string($_POST['template_id']) . "\"";

					}

					mysql_query($query);

				}

			}		

			//Update the screen

			xml_template_display($xerte_toolkits_site,true);
			
		}else{

			xml_template_display_fail();

		}

		mysql_close($database_id);
		
	}

?>