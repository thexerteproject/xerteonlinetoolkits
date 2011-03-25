<?PHP /**
	 * 
	 * access change template, allows the site to set access properties for the template
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */

	require("../../../config.php");
	require("../../../session.php");

	include "../database_library.php";

	include "../user_library.php";

	/**
	 * 
	 * Function template share status
 	 * This function checks the current access setting against a string
	 * @param string $string - string to check against the database
	 * @return bool True or False if two params match
	 * @version 1.0
	 * @author Patrick Lockley
	 */

	function template_share_status($string){

		if($_POST['access']==$string){
			return true;
		}else{
			if(strpos($string,"other-"==0)){
				return true;
			}else{		
				return false;
			}
		}

	}
		
	$database_id = database_connect("Access change database connect success","Access change database connect failed");

	/*
	* Update the database setting
	*/

	if(isset($_POST['server_string'])){

		$query = "update " . $xerte_toolkits_site->database_table_prefix . "templatedetails SET access_to_whom =\"" . mysql_real_escape_string($_POST['access']) . "-" . mysql_real_escape_string($_POST['server_string']) . "\" WHERE template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";

	}else{

		$query = "update " . $xerte_toolkits_site->database_table_prefix . "templatedetails SET access_to_whom =\"" . mysql_real_escape_string($_POST['access']) . "\" WHERE template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";		

	}

	if(mysql_query($query)){
	
	/*
	* Set the header paragraph to reflect the change
	*/
	
		if(isset($_POST['server_string'])){

			echo "<p class=\"header\"><span>This file is currently set as " . $_POST['access'] . "-" . $_POST['server_string']  . "</span></p>";
		
		}else{

			echo "<p class=\"header\"><span>This file is currently set as " . $_POST['access'] . "</span></p>";

		}

		echo "<div id=\"security_list\">";
	
		if(template_share_status("Public")){
		
			echo "<p id=\"Public\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:access_tick_toggle(this)\" />";
	
		}else{
		
			echo "<p id=\"Public\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";

		}
		
		echo " Public</p><p class=\"share_explain_paragraph\">The template will be visible to anyone on the internet</p>";
	

		if(template_share_status("Password")){
			
			echo "<p id=\"Password\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOn.gif\"  onclick=\"javascript:access_tick_toggle(this)\" />";
		
		}else{
		
			echo "<p id=\"Password\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";
		
		}

		echo " Password protected</p><p class=\"share_explain_paragraph\">The template will be visible to people with University account</p>";


		if(template_share_status("Other")){
		
			echo "<p id=\"Other\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";
	
		}else{
		
			echo "<p id=\"Other\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";
		
		}

		echo " Other</p><p class=\"share_explain_paragraph\">Using this setting restricts access to your content. Your content will only be visible to people following links to your content from the site you provide. Enter the site URL below.<form id=\"other_site_address\"><textarea id=\"url\" style=\"width:90%; height:20px;\">";
		
		if(isset($_POST['server_string'])){
		
			echo $_POST['server_string'];
		
		}
		 
		echo "</textarea></form></p>";

		if(template_share_status("Private")){
		
			echo "<p id=\"Private\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";
	
		}else{
		
			echo "<p id=\"Private\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";
	
		}

		echo " Private</p><p class=\"share_explain_paragraph\">This makes your template visible to editors only.</p>";
	
	/*
	* Display extra settings
	*/
	
		$query_for_security_content = "select * from " . $xerte_toolkits_site->database_table_prefix . "play_security_details";

		$query_for_security_content_response = mysql_query($query_for_security_content);

		if(mysql_num_rows($query_for_security_content_response)!=0){

			while($row_security = mysql_fetch_array($query_for_security_content_response)){

				if(template_share_status($row_security['security_setting'])){

					echo "<p id=\"" . $row_security['security_setting'] . "\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";
	
					}else{
			
					echo "<p id=\"" . $row_security['security_setting'] . "\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";

				}

				echo " " . $row_security['security_setting'] . "</p><p class=\"share_explain_paragraph\">" . $row_security['security_info'] . "</p>";					

			}

		}		

		echo "</div>";

		echo "<p><img src=\"website_code/images/Bttn_SaveOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_SaveClick.gif'\" onmousedown=\"this.src='website_code/images/Bttn_SaveOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_SaveOff.gif'\" onclick=\"javascript:access_change_template(" . $_POST['template_id'] . ")\" /> </p>";

	}else{
		
	}

	mysql_close($database_id);

?>