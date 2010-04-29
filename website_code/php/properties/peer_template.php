<?PHP /**
* 
* peer template, allows the user to set up a peer review page for their template
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

	if(is_numeric($_POST['template_id'])){

		$database_id = database_connect("peer template database connect success","peer template change database connect failed");
	
		if(is_user_creator(mysql_real_escape_string($_POST['template_id']))||is_user_admin()){
	
			echo "<p class=\"header\"><span>Peer review</span></p>";			

			echo "<p class=\"share_status_paragraph\">In this section you can set up the peer review for one of your projects. This allows you to send a password protected link to staff, allowing them to access a project, and then giving them the facility to email you feedback</p>";
			
			$query = "select * from " . $xerte_toolkits_site->database_table_prefix . "additional_sharing where sharing_type=\"peer\" AND template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";
	
			$query_response = mysql_query($query);
	
			echo "<p class=\"share_status_paragraph\">Peer review is </p>";
	
			if(mysql_num_rows($query_response)==1){
	
				echo "<p class=\"share_status_paragraph\"><img id=\"peeron\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:peer_tick_toggle('peeron')\" /> on</p>";
				echo "<p class=\"share_status_paragraph\"><img id=\"peeroff\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:peer_tick_toggle('peeroff')\" /> off</p>";
				echo "<p class=\"share_status_paragraph\">The link for peer review is <a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("peerreview", $_POST['template_id']) . "\">" .  $xerte_toolkits_site->site_url . url_return("peerreview", $_POST['template_id'])  . "</a></p>";
	
			}else{
	
				echo "<p class=\"share_status_paragraph\"><img id=\"peeron\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:peer_tick_toggle('peeron')\" /> on</p>";
				echo "<p class=\"share_status_paragraph\"><img id=\"peeroff\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:peer_tick_toggle('peeroff')\" /> off</p>";
	
			}
			
			$row = mysql_fetch_array($query_response);
	
			echo "<p class=\"share_status_paragraph\"><form action=\"javascript:peer_change_template()\" name=\"peer\" >Password to give to reviewers <input type=\"text\" size=\"15\" name=\"password\" style=\"margin:0px; padding:0px\" value=\"" . $row['extra'] . "\" /><br><br><input type=\"image\" src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveClick.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" /></p></form>";
			
		}else{
	
			echo "<p>Sorry, only creators of templates can set up peer review</p>";
	
		}
	
		mysql_close($database_id);
	
	}

?>