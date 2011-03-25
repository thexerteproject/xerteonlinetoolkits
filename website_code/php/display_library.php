<?PHP     // level is a global variable used to stylise the folder nesting

$level=-1;

	/**
	 * 
	 * Function list folders in this folder event free
 	 * This function is used in the folder properties tab to display content
	 * @param string $folder_id = The id of the folder we are checking
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function list_folders_in_this_folder_event_free($folder_id){

	global $xerte_toolkits_site;
	
	$query="select folder_id, folder_name from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where login_id =\"" . $_SESSION['toolkits_logon_id'] . "\" and folder_parent=\"" . $folder_id . "\"";

	$query_response = mysql_query($query);

	while($row = mysql_fetch_array($query_response)){

		echo "<div id=\"dynamic_area_folder\"><p><img style=\"\" src=\"website_code/images/Icon_Folder.gif\" />" . str_replace("_", " ", $row['folder_name']) . "</p></div><div id=\"dynamic_area_folder_content\">"; 

		list_folder_contents_event_free($row['folder_id']);

		echo "</div>";
			
	}

}

	/**
	 * 
	 * Function list files in this folder event free
 	 * This function is used in the folder properties tab to display files
	 * @param string $folder_id = The id of the folder we are checking
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function list_files_in_this_folder_event_free($folder_id){

	global $xerte_toolkits_site;

	$query = "select template_name, template_id from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where template_id in ( select " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id from " . $xerte_toolkits_site->database_table_prefix . "templaterights where user_id =\"" . $_SESSION['toolkits_logon_id'] . "\" and folder=\"" . $folder_id . "\") order by " . $xerte_toolkits_site->database_table_prefix . "templatedetails.date_created ASC";

	$query_response = mysql_query($query);

	while($row = mysql_fetch_array($query_response)){

		echo "<div class=\"dynamic_area_file\"><p><img src=\"website_code/images/Icon_Page.gif\" />" . str_replace("_", " ", $row['template_name']) . "</p></div>";

	}

}

	/**
	 * 
	 * Function list folder contents event free
 	 * This function is used as part of the recursion with the above two functions
	 * @param string $folder_id = The id of the folder we are checking
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function list_folder_contents_event_free($folder_id){

	list_folders_in_this_folder_event_free($folder_id);
	list_files_in_this_folder_event_free($folder_id);

}

	/**
	 * 
	 * Function list folder in this folder
 	 * This function is used as part of the recursion to display the main file system
	 * @param string $folder_id = The id of the folder we are checking
 	 * @param string $sort_type = A variable which dictates how we are sorting this
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function list_folders_in_this_folder($folder_id, $sort_type){

	/*
	* use the global level for folder indenting
	*/

	global $level, $xerte_toolkits_site;

	/* 
	* select the folders in this folder
	*/

	$query="select folder_id, folder_name from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where login_id =\"" . $_SESSION['toolkits_logon_id'] . "\" and folder_parent=\"" . $folder_id . "\" ";

	/*
	* Add some more to the query to sort the files
	*/

	if($sort_type=="alpha_down"){

		$query.=" order by folder_name DESC";

	}else if($sort_type=="alpha_up"){

		$query.=" order by folder_name ASC";

	}else if($sort_type=="date_down"){

		$query.=" order by date_created DESC";

	}else if($sort_type=="date_up"){

		$query.=" order by date_created ASC";

	}

	$query_response = mysql_query($query);

	/*
	* recurse through the folders
	*/

	while($row = mysql_fetch_array($query_response)){

		$query_for_folder_content="select template_id from " . $xerte_toolkits_site->database_table_prefix . "templaterights where folder=\"" . $row['folder_id'] . "\" UNION SELECT folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where folder_parent=\"" . $row['folder_id'] . "\"";

		$query_response_for_folder_content = mysql_query($query_for_folder_content);
		
		/*
		* Use level to nest the folders
		*/

		echo "<div class=\"folder\" style=\"padding-left:" . ($level*15) . "px\" id=\"folder_" . $row['folder_id'] .  "\" onmousedown=\"single_click(this);file_folder_click_pause(event)\" ondblclick=\"folder_open_close(this)\" onmouseup=\"file_drag_stop(event,this)\"><p><img style=\"vertical-align:middle\"";
		
		if(mysql_num_rows($query_response_for_folder_content)==0){

			echo " src=\"website_code/images/Icon_Folder_Empty.gif\" />" . str_replace("_", " ", $row['folder_name']) . "</p></div><div id=\"folderchild_" . $row['folder_id'] . "\" class=\"folder_content\">";

		}else{

			echo " src=\"website_code/images/Icon_Folder.gif\" id=\"folder_" . $row['folder_id'] . "_image\" />" . str_replace("_", " ", $row['folder_name']) . "</p></div><div id=\"folderchild_" . $row['folder_id'] . "\" class=\"folder_content\">";

			list_folder_contents($row['folder_id'], $sort_type);

		}

		echo "</div>";

	}

}

	/**
	 * 
	 * Function list files in this folder
 	 * This function is used as part of the recursion to display the main file system
	 * @param string $folder_id = The id of the folder we are checking
 	 * @param string $sort_type = A variable which dictates how we are sorting this
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function list_files_in_this_folder($folder_id, $sort_type){

	global $level, $xerte_toolkits_site;

	$query = "select template_name, template_id from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where template_id in ( select " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id from " . $xerte_toolkits_site->database_table_prefix . "templaterights where user_id =\"" . $_SESSION['toolkits_logon_id'] . "\" and folder=\"" . $folder_id . "\") ";

	if($sort_type=="alpha_down"){

		$query.="order by " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_name DESC";

	}else if($sort_type=="alpha_up"){

		$query.="order by " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_name ASC";

	}else if($sort_type=="date_down"){

		$query.="order by " . $xerte_toolkits_site->database_table_prefix . "templatedetails.date_created DESC";

	}else if($sort_type=="date_up"){

		$query.="order by " . $xerte_toolkits_site->database_table_prefix . "templatedetails.date_created ASC";

	}

 	$query_response = mysql_query($query);

	while($row = mysql_fetch_array($query_response)){
		
		echo "<div id=\"file_" . $row['template_id'] .  "\" class=\"file\" style=\"padding-left:" . ($level*15) . "px\" onmousedown=\"single_click(this);file_folder_click_pause(event)\" onmouseup=\"file_drag_stop(event,this)\"><img src=\"website_code/images/Icon_Page.gif\" style=\"vertical-align:middle\" />" . str_replace("_", " ", $row['template_name']) . "</div>";

	}

}

	/**
	 * 
	 * Function list folder contents
 	 * This function is used as part of the recursion to display the main file system
	 * @param string $folder_id = The id of the folder we are checking
 	 * @param string $sort_type = A variable which dictates how we are sorting this
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function list_folder_contents($folder_id, $sort_type){

	global $level;

	$level++;	
	list_folders_in_this_folder($folder_id, $sort_type);
	list_files_in_this_folder($folder_id, $sort_type);
	$level--;

}

	/**
	 * 
	 * Function list users projects
 	 * This function is used as part of the recursion to display the main file system
 	 * @param string $sort_type = A variable which dictates how we are sorting this
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function list_users_projects($sort_type){

	/*
	* Called by index.php to start off the process
	*/

	global $level, $xerte_toolkits_site;

	$root_folder = get_user_root_folder();
	
	/*
	* Create the workspace folder
	*/

	echo "<div class=\"folder\" id=\"folder_workspace\" ondblclick=\"folder_open_close(this)\" onclick=\"highlight_main_toggle(this)\"><p><img style=\"vertical-align:middle\"";

	echo " src=\"website_code/images/folder_workspace.gif\""; 

	echo " />Workspace</p></div><div id=\"folderchild_workspace\" class=\"workspace\">";

	$level=1;

	list_folder_contents(get_user_root_folder(),$sort_type);

	$query = "select folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where folder_name=\"recyclebin\" and login_id =\"" . $_SESSION['toolkits_logon_id'] . "\"";

	$query_response = mysql_query($query);

	$row = mysql_fetch_array($query_response);

	$level=1;

	$query_for_folder_content="select template_id from " . $xerte_toolkits_site->database_table_prefix . "templaterights where folder=\"" . $row['folder_id'] . "\" UNION SELECT folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where folder_parent=\"" . $row['folder_id'] . "\"";

	$query_response_for_folder_content = mysql_query($query_for_folder_content);

	echo "</div>";
	
	/*
	* Display the recycle bin
	*/

	echo "<div class=\"folder\" id=\"recyclebin\" ondblclick=\"folder_open_close(this)\" onclick=\"highlight_main_toggle(this)\"><p><img id=\"folder_recyclebin\" style=\"vertical-align:middle\"";

	if(mysql_num_rows($query_response_for_folder_content)==0){

		 echo " src=\"website_code/images/rb_empty.gif\""; 

	}else{

		 echo " src=\"website_code/images/rb_full.gif\""; 
	}

	echo " />Recycle Bin</p></div><div id=\"folderchild_recyclebin\" class=\"folder_content\">";

	list_folder_contents($row['folder_id'],$sort_type);	

	echo "</div>";
	
}

/**
	 * 
	 * Function list users projects
 	 * This function is used to display all the unrestricted templates (Access to whom = *)
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function list_blank_templates(){

	/*
	* note the access rights to discern what templates this user can see
	*/

	global $xerte_toolkits_site;

	$query_for_blank_templates = "select * from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where access_rights=\"*\" and active=true order by date_uploaded DESC";

	$query_for_blank_templates_response = mysql_query($query_for_blank_templates);

	while($row = mysql_fetch_array($query_for_blank_templates_response)){

		echo "<div class=\"template\" onmouseover=\"this.style.backgroundColor='#ebedf3'\" onmouseout=\"this.style.backgroundColor='#fff'\"><div class=\"template_icon\"></div><div class=\"template_desc\"><p class=\"template_name\">";

		echo $row['display_name']; 

		echo "</p><p class=\"template_desc_p\">";

		echo $row['description'];
		
		/*
		* If no example don't display the link
		*/

		if($row['display_id']!=0){

			echo "</p><a href=\"javascript:example_window('" . $row['display_id'] . "' )\">See example</a> | ";

		}else{

			echo "<br>";

		}

		echo "<a onclick=\"javascript:toggle('" . $row['template_name'] . "')\" href=\"javascript:template_toggle('" . $row['template_name'] . "')\">Create</a></div><div id=\"" . $row['template_name'] . "\" class=\"rename\">";

		echo "<span>Enter a name for this project</span><form action=\"javascript:create_tutorial('" . $row['template_name'] . "')\" method=\"post\" enctype=\"text/plain\"><input type=\"text\" width=\"200\" id=\"filename\" name=\"filename\" /><br /><input type=\"image\" src=\"website_code/images/Bttn_CreateProjectOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_CreateProjectOn.gif'\" onmousedown=\"this.src='website_code/images/Bttn_CreateProjectClick.gif'\" onmouseout=\"this.src='website_code/images/Bttn_CreateProjectOff.gif'\" class=\"form_button_pad\" /></form></div></div>";
				
	}

	/*
	* once done listing the blank templates, list if any the specific templates available for this user
	*/

	list_specific_templates();

}

	/**
	 * 
	 * Function access check
 	 * This function is used to assess which specific usernames match the access to whom value
 	 * @param string $security_details = the masks used for this template to limit its display
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function access_check($security_details){

	$list = explode(",",$security_details);

	while($dev_mask = array_pop($list)){

		if(strpos($dev_mask,"*")!=0){

			if(strcmp(substr($dev_mask,0,strpos($dev_mask,"*")),substr($_SESSION['toolkits_logon_username'],0,strpos($dev_mask,"*")))==0){

				return true;

			}
		
		}else{
	
			if(strcmp($dev_mask,$_SESSION['toolkits_logon_username'])==0){

				return true;

			}

		}

	}

	return false;

}

	/**
	 * 
	 * Function list specific templates
 	 * This function is used to display templates with access restrictions
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function list_specific_templates(){

	global $xerte_toolkits_site;

	$query_for_blank_templates = "select * from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where access_rights!=\"*\" order by date_uploaded DESC";

	$query_for_blank_templates_response = mysql_query($query_for_blank_templates);

	while($row = mysql_fetch_array($query_for_blank_templates_response)){

		if(access_check($row['access_rights'])){

			echo "<div class=\"template\" onmouseover=\"this.style.backgroundColor='#ebedf3'\" onmouseout=\"this.style.backgroundColor='#fff'\"><div class=\"template_icon\"></div><div class=\"template_desc\"><p class=\"template_name\">";

			echo $row['display_name']; 

			echo "</p><p class=\"template_desc_p\">";

			echo $row['description'];

			echo "</p><a href=\"javascript:example_window('" . $row['display_id'] . "' )\">See example</a> | <a onclick=\"javascript:toggle('" . $row['template_name'] . "')\" href=\"javascript:template_toggle('" . $row['template_name'] . "')\">Create</a></div><div id=\"" . $row['template_name'] . "\" class=\"rename\">";

			echo "<span>Enter a name for this project</span><form action=\"javascript:create_tutorial('" . $row['template_name'] . "')\" method=\"post\" enctype=\"text/plain\"><input type=\"text\" width=\"200\" id=\"filename\" name=\"filename\" /><br /><input type=\"image\" src=\"website_code/images/Bttn_CreateProjectOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_CreateProjectOn.gif'\" onmousedown=\"this.src='website_code/images/Bttn_CreateProjectClick.gif'\" onmouseout=\"this.src='website_code/images/Bttn_CreateProjectOff.gif'\" class=\"form_button_pad\" /></form></div></div>";

		}
				
	}

}

	/**
	 * 
	 * Function login page format top
 	 * This function is used as part of the display of Index.php
 	 * @param string $buffer = A HTML string to work on
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function login_page_format_top($buffer){

	global $xerte_toolkits_site;

	$buffer = str_replace("{{site_title}}", $xerte_toolkits_site->site_title , $buffer);
	$buffer = str_replace("{{site_logo}}", $xerte_toolkits_site->site_logo , $buffer);
	$buffer = str_replace("{{organisational_logo}}", $xerte_toolkits_site->organisational_logo , $buffer);
	$buffer = str_replace("{{welcome_message}}", $xerte_toolkits_site->welcome_message , $buffer);

	return $buffer;

}

	/**
	 * 
	 * Function login page format top
 	 * This function is used to display the index.php HTML
 	 * @param string $buffer = A HTML string to work on
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function login_page_format_bottom($buffer){

	global $xerte_toolkits_site;

	$buffer = str_replace("{{demonstration_page}}", $xerte_toolkits_site->demonstration_page , $buffer);
	$buffer = str_replace("{{site_text}}", $xerte_toolkits_site->site_text , $buffer);
	$buffer = str_replace("{{news}}", $xerte_toolkits_site->news_text , $buffer);
	$buffer = str_replace("{{copyright}}", $xerte_toolkits_site->copyright , $buffer);

	return $buffer;

}


	/**
	 * 
	 * Function login page format middle
 	 * This function is used to display the index.php HTML
 	 * @param string $buffer = A HTML string to work on
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function logged_in_page_format_middle($buffer){

	global $xerte_toolkits_site;

	$buffer = str_replace("{{pod_one}}", $xerte_toolkits_site->pod_one , $buffer);
	$buffer = str_replace("{{pod_two}}", $xerte_toolkits_site->pod_two , $buffer);

	return $buffer;

}


	/**
	 * 
	 * Function error show template
 	 * This function is used to display a respinse when the users accesses a resource they have no right to
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function error_show_template(){
		
	echo "An error has occured and as such you cannot edit at present";

}


	/**
	 * 
	 * Function output locked file code
 	 * This function is used to display a message when a lock file is found
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function output_locked_file_code($lock_file_creator){
		
	echo "<p>This file is currently being edited by $lock_file_creator.</p><p> If you are sure this is not the case, then you can edit the file by clicking the button below. If you continue and there are two people editing at once, there is a risk the file will become corrupted.</p><p> Otherwise, please wait until the current editor closes the file and it will be made available to you when the current editor closes it down.</p>";
		
	echo "<form action=\"\" method=\"POST\"><input type=\"hidden\" value=\"delete_lockfile\" name=\"lockfile_clear\" /><input type=\"submit\" value=\"Delete Lockfile\" /></form>";

}

?>