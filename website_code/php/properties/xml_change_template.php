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

		echo "<p class=\"header\"><span>XML Sharing</span></p>";			

		echo "<p class=\"share_status_paragraph\">In this section you can set up the XML Sharing for one of your projects. Your project must be published for this to work. This allows your work to be used in other systems</p>";
		$query = "select * from " . $xerte_toolkits_site->database_table_prefix . "additional_sharing where sharing_type=\"xml\" AND template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";

		$query_response = mysql_query($query);

		echo "<p class=\"share_status_paragraph\">XML Sharing is </p>";

		if(mysql_num_rows($query_response)==1){

			echo "<p class=\"share_status_paragraph\"><img id=\"xmlon\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:xml_tick_toggle('xmlon')\" /> on</p>";
			echo "<p class=\"share_status_paragraph\"><img id=\"xmloff\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:xml_tick_toggle('xmloff')\" /> off</p>";
			echo "<p class=\"share_status_paragraph\">The link for xml sharing is " . $xerte_toolkits_site->site_url . url_return("xml",$_POST['template_id']) . "</p>";

		}else{

			echo "<p class=\"share_status_paragraph\"><img id=\"xmlon\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:xml_tick_toggle('xmlon')\" /> on</p>";
			echo "<p class=\"share_status_paragraph\"><img id=\"xmloff\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:xml_tick_toggle('xmloff')\" /> off</p>";

		}
		
		$row = mysql_fetch_array($query_response);

		echo "<p class=\"share_status_paragraph\"><form action=\"javascript:xml_change_template()\" name=\"xmlshare\">You can restrict access to one site if you would like <br><br><input type=\"text\" size=\"15\" name=\"sitename\" style=\"margin:0px; padding:0px\" value=\"" . $row['extra'] . "\" /><br><br><input type=\"image\" src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveClick.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" /></p></form><p class=\"share_status_paragraph\">Your changes have been saved</p>";
		

		
	}else{

		echo "<p>Sorry, only creators of templates can set up XML Sharing</p>";

	}

	mysql_close($database_id);
	
}

?>