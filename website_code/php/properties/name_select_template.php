<?PHP /**
* 
* name select template, displays usernames so people can choose to share a template
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

	require("../../../config.php");
	require("../../../session.php");
	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/properties/name_select_template.inc";

	include "../database_library.php";

	if(is_numeric($_POST['template_id'])){
	
		$search = mysql_real_escape_string($_POST['search_string']);
	
		$tutorial_id = mysql_real_escape_string($_POST['template_id']);
	
		$database_id=database_connect("Template name select share access database connect success","Template name select share database connect failed");
	
		/**
		* Search the list of user logins for user with that name
		*/
	
		if(strlen($search)!=0){
	
			$query_for_names = "select login_id, firstname, surname from " . $xerte_toolkits_site->database_table_prefix . "logindetails WHERE ((firstname like \"" . $search . "%\") or (surname like \"" . $search . "%\")) and login_id not in( SELECT user_id from " . $xerte_toolkits_site->database_table_prefix . "templaterights where template_id=\"" . $tutorial_id . "\" ) ORDER BY firstname ASC";

			$query_names_response = mysql_query($query_for_names);
	
			if(mysql_num_rows($query_names_response)!=0){			
	
				while($row = mysql_fetch_array($query_names_response)){
	
					echo "<p>" . $row['firstname'] . " " . $row['surname'] . " (" . $row['login_id'] . ") - <a href=\"javascript:share_this_template('" . $tutorial_id . "', '" . $row['login_id'] . "')\">" . NAME_SELECT_CLICK . "</a></p>";
	
				}
	
			}else{
	
					echo "<p>" . NAME_SELECT_DETAILS_FAIL . "</p>";			
	
			}
	
		}

	}

?>