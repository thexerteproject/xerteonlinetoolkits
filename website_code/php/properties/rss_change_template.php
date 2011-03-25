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

			echo "<p class=\"header\"><span>RSS feeds</span></p>";			

			if($_POST['rss']=="true"){

				echo "<p class=\"share_status_paragraph\">Include this project in the RSS Feeds <img id=\"rsson\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:rss_tick_toggle('rsson')\" /> Yes  <img id=\"rssoff\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('rssoff')\" /> No </p>";

			}else{
				
				echo "<p class=\"share_status_paragraph\">Include this project in the RSS Feeds <img id=\"rsson\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('rsson')\" /> Yes  <img id=\"rssoff\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:rss_tick_toggle('rssoff')\" /> No </p>";

			}

			if($_POST['export']=="true"){

				echo "<p class=\"share_status_paragraph\">Include this project in the Export Feed <img id=\"exporton\" src=\"website_code/images/TickBoxOn.gif\"  onclick=\"javascript:rss_tick_toggle('exporton')\" /> Yes  <img id=\"exportoff\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('exportoff')\" /> No </p>";

			}else{
				
				echo "<p class=\"share_status_paragraph\">Include this project in the Export Feed <img id=\"exporton\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('exporton')\" /> Yes  <img id=\"exportoff\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:rss_tick_toggle('exportoff')\"  /> No </p>";

			}

			echo "<p class=\"share_status_paragraph\">You can also include a description for your project in the RSS Feed as well<form action=\"javascript:rss_change_template()\" name=\"xmlshare\" ><textarea id=\"desc\" style=\"width:90%; height:120px;\">" . $_POST['desc'] . "</textarea><br><br><input type=\"image\" src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveClick.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" /></form></p>";

			echo "<p class=\"share_status_paragraph\">You can include this content in the site's RSS feeds. People who subscribe to the feeds will see new content as it as added to the feeds. There are several feeds available:</p>";

			echo "<p class=\"share_status_paragraph\">The main feed is at <a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("RSS",null)  . "\">" . $xerte_toolkits_site->site_url . url_return("RSS",null) . "</a>. This includes all content marked for inclusion from the site's users. <Br><br> Your own RSS Feed is available at <a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_user", ($row_name['firstname'] . "_" . $row_name['surname'])) . "\">" . $xerte_toolkits_site->site_url . url_return("RSS_user", $row_name['firstname'] . "_" . $row_name['surname']) . "</a>. This only includes the content you have marked for inclusion.</p>";

			echo "<p class=\"share_status_paragraph\">As you organise content in folders, each folder has it's own RSS feed. This provides a convenient way to include only some of your content in a feed. See the folder properties for more details, and the link to that folder's feed.</p>";

			echo "<p class=\"share_status_paragraph\">Including content in the export feed allows other users to download your project and make changes to it themselves.</p>";

		
		}else{

			echo "<p>Please set this project to the 'Public' on the access tab before using the RSS Feed features</p>";

		}

	}else{

		echo "<p>Sorry only the creator of the file can set notes for the project</p>";	

	}
	
}

?>