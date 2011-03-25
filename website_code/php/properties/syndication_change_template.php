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

if(is_numeric($_POST['tutorial_id'])){

	$database_connect_id = database_connect("syndication change template database connect success", "syndication change template database connect failed");

	if(is_user_creator(mysql_real_escape_string($_POST['tutorial_id']))||is_user_admin()){
		
		$query_for_syndication_status = "select syndication from " . $xerte_toolkits_site->database_table_prefix . "templatesyndication where template_id=" . mysql_real_escape_string($_POST['tutorial_id']);

		$query_for_syndication_response = mysql_query($query_for_syndication_status);

		if(mysql_num_rows($query_for_syndication_response)==0){

			$query_to_change_syndication_status = "Insert into " . $xerte_toolkits_site->database_table_prefix . "templatesyndication(template_id,syndication,keywords,description,category,license) VALUES (" . mysql_real_escape_string($_POST['tutorial_id']) . ",'" . mysql_real_escape_string($_POST['synd']) . "','" . mysql_real_escape_string($_POST['keywords']) . "','" . mysql_real_escape_string($_POST['desc']) . "','" . mysql_real_escape_string($_POST['category_value']) . "','" . mysql_real_escape_string($_POST['license_value']) . "')";

		}else{

			$query_to_change_syndication_status = "update " . $xerte_toolkits_site->database_table_prefix . "templatesyndication set syndication='" . mysql_real_escape_string($_POST['synd']) . "', keywords='" . mysql_real_escape_string($_POST['keywords']) . "', description='" . mysql_real_escape_string($_POST['description']) . "', category='" . mysql_real_escape_string($_POST['category_value']) . "', license='" . mysql_real_escape_string($_POST['license_value']) . "' where template_id=" . mysql_real_escape_string($_POST['tutorial_id']);

		}

		$query_to_change_syndication_status_response = mysql_query($query_to_change_syndication_status);

		/**
		* Check template is public
		*/

		if(template_access_settings(mysql_real_escape_string($_POST['tutorial_id']))=="Public"){
		
			echo "<p class=\"header\"><span>Open Content</span></p>";

			echo "<p class=\"share_status_paragraph\">This tab allows you to include to project in the site's open courseware list. Open Courseware is a set of learning materials that institutions have made publically available for any one to use. The address for this site's syndicated content is <a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_syndicate",null) . "\">" . $xerte_toolkits_site->site_url . url_return("RSS_syndicate",null) . "</a></p>";

			$query_for_syndication = "select syndication,description,keywords,category,license from " . $xerte_toolkits_site->database_table_prefix . "templatesyndication where template_id=" . mysql_real_escape_string($_POST['tutorial_id']);

			$query_syndication_response = mysql_query($query_for_syndication);

			$row_syndication = mysql_fetch_array($query_syndication_response);

			echo "<p class=\"share_status_paragraph\">Include this project in the Open Courseware Feed ";

			if($_POST['synd']=="true"){

				echo "<img id=\"syndon\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:rss_tick_toggle('syndon')\" /> Yes  <img id=\"syndoff\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('syndoff')\" /> No </p>";

			}else{

				echo "<img id=\"syndon\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('syndon')\" /> Yes  <img id=\"syndoff\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:rss_tick_toggle('syndoff')\" /> No </p>";

			}

			echo "<p class=\"share_status_paragraph\">Please choose a category for your project<br><select SelectedIndex=\"6\" name=\"type\" id=\"category_list\" style=\"margin:5px 0 0 0; padding:0px;\">";

			$query_for_categories = "select category_name from " . $xerte_toolkits_site->database_table_prefix . "syndicationcategories";

			$query_categories_response = mysql_query($query_for_categories);

			while($row_categories = mysql_fetch_array($query_categories_response)){

				echo "<option value=\"" . $row_categories['category_name'] . "\"";

				if($row_categories['category_name']==$row_syndication['category']){

					echo " selected=\"selected\" ";

				}

				echo ">" . $row_categories['category_name'] . "</option>";

			}

			echo "</select></p>";

			echo "<p class=\"share_status_paragraph\">Please choose a license for your project<br><select ";
			
			if(isset($row_syndication['license_name'])){
			
				echo " SelectedItem=\"" . $row_syndication['license_name'] . "\"";
			 
			}
			  
			echo " name=\"type\" id=\"license_list\" style=\"margin:5px 0 0 0; padding:0px;\">";

			$query_for_licenses = "select license_name from " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses";

			$query_licenses_response = mysql_query($query_for_licenses);

			while($row_licenses = mysql_fetch_array($query_licenses_response)){

				echo "<option value=\"" . $row_licenses['license_name'] . "\"";

				if($row_licenses['license_name']==$row_syndication['license']){

					echo " selected=\"selected\" ";

				}

				echo ">" . $row_licenses['license_name'] . "</option>";

			}

			echo "</select></p>";

			echo "<p class=\"share_status_paragraph\">Please provide a description for your project<form action=\"javascript:syndication_change_template()\" name=\"syndshare\"><textarea id=\"description\" style=\"width:95%; height:100px\">" . $_POST['description'] . "</textarea>Please provide a list of comma separated keywords for this project<textarea id=\"keywords\" style=\"width:95%; height:40px\">" . $_POST['keywords'] . "</textarea><input type=\"image\" src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveClick.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" style=\"padding-top:5px\" /></p></form>";

		
		}else{

			echo "<p>Please set this project to the 'Public' on the access tab before using the RSS Feed features</p>";

		}
			

	}else{

		echo "<p>Sorry only the creator of the file can set notes for the project</p>";	

	}
	
}

?>