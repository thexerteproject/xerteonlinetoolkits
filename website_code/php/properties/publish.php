<?PHP     /**
* 
* publish template, shows the publish options
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/
	
	require("../../../config.php");
	require("../../../session.php");
	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/properties/publish.inc";
	
	include "../database_library.php";
	include "../template_status.php";
	include "../screen_size_library.php";
	include "../url_library.php";
	include "../user_library.php";
	
	if(is_numeric($_POST['template_id'])){

		$tutorial_id = mysql_real_escape_string($_POST['template_id']);

		$database_id=database_connect("Properties template database connect success","Properties template database connect failed");

		// User has to have some rights to do this

		if(has_rights_to_this_template(mysql_real_escape_string($_POST['template_id']), $_SESSION['toolkits_logon_id'])||is_user_admin()){

			echo "<p class=\"header\"><span>" . PUBLISH_TITLE . "</span></p>";

			$query_for_names = "select template_name, date_created, date_modified from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where template_id=\"". $tutorial_id . "\"";

			$query_names_response = mysql_query($query_for_names);

			$row = mysql_fetch_array($query_names_response);

			echo "<p>" . PUBLISH_DESCRIPTION . "</p>";

			$template_access = template_access_settings(mysql_real_escape_string($_POST['template_id']));

			echo "<p><b>" . PUBLISH_ACCESS . "</b><br>" . PUBLISH_ACCESS_DESCRIPTION . "</p>";

			if($template_access=="Private"){

				echo "<p><img src=\"website_code/images/bullet_error.gif\" align=\"absmiddle\" /><b>" . PUBLISH_ACCESS_STATUS . "</b></p>";

			}else{

				echo "<p>" . PUBLISH_ACCESS_IS . " " . $template_access . ".</p>";

			}

			echo "<p><b>" . PUBLISH_RSS . "</b><br>" . PUBLISH_RSS_DESCRIPTION . "</p>";

			if(!is_template_rss(mysql_real_escape_string($_POST['template_id']))){

				echo "<p><b>" . PUBLISH_RSS_NOT_INCLUDE . "</b></p>";

			}else{

				echo "<p>" . PUBLISH_RSS_INCLUDE . "</p>";

			}

			echo "<p><b>" . PUBLISH_SYNDICATION . "</b><br>" . PUBLISH_SYNDICATION_DESCRIPTION . "</p>";

			if(!is_template_syndicated(mysql_real_escape_string($_POST['template_id']))){

				echo "<p><b>" . PUBLISH_SYNDICATION_STATUS_OFF . "</b></p>";

			}else{

				echo "<p>" . PUBLISH_SYNDICATION_STATUS_ON . "</p>";

			}
		
			if($template_access=="Public"){

				/**
				* 
				* This section using $_SESSION['webct'] is for people using the integration option for webct. If you integration option has the ability to post back a URL then you would modify this code to allow for your systems working methods.		
				*
				**/

				if(isset($_SESSION['webct'])){

					if($_SESSION['webct']=="true"){	
		
						$url = urlencode($xerte_toolkits_site->site_url . url_return("play",$tutorial_id));
		
						echo "<p>" . str_replace("~~~URL~~~", $url,str_replace("~~~NAME~~~", str_replace("_", " " ,$row['template_name']),$_SESSION['toolkits_webct_url'])) . "</p>";
		
					}else{
		
						echo "<p><img src=\"website_code/images/Bttn_PublishOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_PublishOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_PublishOff.gif'\" onmousedown=\"this.src='website_code/images/Bttn_PublishClick.gif'\" onclick=\"publish_project(window.name);\" /></p>";
		
						echo "<p>" . PUBLISH_WEB_ADDRESS . " " . $xerte_toolkits_site->site_url . url_return("play",mysql_real_escape_string($_POST['template_id'])) . "</p>";
		
					}
				
				}

			}else{

				echo "<p><img src=\"website_code/images/Bttn_PublishDis.gif\" /></p>";

			}

		}else{

			echo "<p>" . PUBLISH_FAIL . "</p>";

		}
	
	}

?>