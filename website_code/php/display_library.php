<?php
if (file_exists('../../../config.php')) {

  require_once('../../../config.php');

} elseif (file_exists(dirname(__FILE__) . '/../../config.php')) {
  require_once(dirname(__FILE__) . '/../../config.php');
} else {

  require_once('config.php');

}

_load_language_file("/website_code/php/display_library.inc");

// level is a global variable used to stylise the folder nesting


$level = -1;

/**
 *
 * Function list folders in this folder event free
 * This function is used in the folder properties tab to display content
 * @param string $folder_id = The id of the folder we are checking
 * @version 1.0
 * @author Patrick Lockley
 */

function list_folders_in_this_folder_event_free($folder_id, $path = '', $item = false, $input_method = 'link') {


  global $xerte_toolkits_site,$level;

  $query = "select folder_id, folder_name from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where login_id =\"" . $_SESSION['toolkits_logon_id'] . "\" and folder_parent=\"" . $folder_id . "\"";

  $query_response = mysql_query($query);

  while ($row = mysql_fetch_array($query_response)) {
    $extra='<p>';
    $extra1='</p>';
$extra2='';
    if($item!==false) {
      $extra='';
      $extra1='';
      $extra2=" style=\"padding-left:" . ($level*10) . "px\" ";
    }

    echo "<div id=\"dynamic_area_folder\" $extra2>$extra<img style=\"\" src=\"{$path}website_code/images/Icon_Folder.gif\" />" . str_replace("_", " ", $row['folder_name']) . "$extra1</div><div id=\"dynamic_area_folder_content\">";


    $item = list_folder_contents_event_free($row['folder_id'], $path, $item, $input_method);


    echo "</div>";

  }

  return $item;
}

/**
 *
 * Function list files in this folder event free
 * This function is used in the folder properties tab to display files
 * @param string $folder_id = The id of the folder we are checking
 * @version 1.0
 * @author Patrick Lockley
 */

function list_files_in_this_folder_event_free($folder_id, $path = '', $item = false, $input_method = 'link') {

  global $xerte_toolkits_site,$level;

  $query = "select template_name, template_id from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where template_id in ( select " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id from " . $xerte_toolkits_site->database_table_prefix . "templaterights where user_id =\"" . $_SESSION['toolkits_logon_id'] . "\" and folder=\"" . $folder_id . "\") order by " . $xerte_toolkits_site->database_table_prefix . "templatedetails.date_created ASC";

  $query_response = mysql_query($query);

  while ($row = mysql_fetch_array($query_response)) {
    $extra='<p>';
    $extra1='</p>';
    $extra2='';
if($item!==false) {
if($input_method=='radio') {
$extra="<input type=\"radio\" name=\"xerteID\" id=\"xerteID-$item\" value=\"$item\"><label for=\"xerteID-$item\">";
  $extra1='</label>';
}else {
  $extra="<a href=\"?xerteID=$item\">";
  $extra1='</a>';
}
  $_SESSION['postlookup'][$item]=$row['template_id'];
  $item++;

    $extra2=" style=\"padding-left:" . ($level*10) . "px\" ";

}
    echo "<div class=\"dynamic_area_file\" $extra2 >$extra<img src=\"{$path}website_code/images/Icon_Page.gif\" />" . str_replace("_", " ", $row['template_name']) . "$extra1</div>\r\n";


  }

  return $item;
}

/**
 *
 * Function list folder contents event free
 * This function is used as part of the recursion with the above two functions
 * @param string $folder_id = The id of the folder we are checking
 * @version 1.0
 * @author Patrick Lockley
 */

function list_folder_contents_event_free($folder_id, $path = '', $item = false, $input_method = 'link') {
  global $level;
  $level++;
    $item = list_folders_in_this_folder_event_free($folder_id, $path, $item, $input_method);
  $level++;
    $item = list_files_in_this_folder_event_free($folder_id, $path, $item, $input_method);
  $level--;
  $level--;
  return $item;
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

  $query = "select folder_id, folder_name from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where login_id =\"" . $_SESSION['toolkits_logon_id'] . "\" and folder_parent=\"" . $folder_id . "\" ";

  /*
  * Add some more to the query to sort the files
  */

  if ($sort_type == "alpha_down") {
    $query .= " order by folder_name DESC";
  } elseif ($sort_type == "alpha_up") {
    $query .= " order by folder_name ASC";
  } elseif ($sort_type == "date_down") {
    $query .= " order by date_created DESC";
  } elseif ($sort_type == "date_up") {
    $query .= " order by date_created ASC";
  }

  $query_response = mysql_query($query);

  /*
  * recurse through the folders
  */

  while ($row = mysql_fetch_array($query_response)) {

    $query_for_folder_content = "select template_id from " . $xerte_toolkits_site->database_table_prefix . "templaterights where folder=\"" . $row['folder_id'] . "\" UNION SELECT folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where folder_parent=\"" . $row['folder_id'] . "\"";

    $query_response_for_folder_content = mysql_query($query_for_folder_content);

    /*
    * Use level to nest the folders
    */

        echo "<div class=\"folder\" style=\"padding-left:" . ($level*10) . "px\" id=\"folder_" . $row['folder_id'] .  "\" onmousedown=\"single_click(this);file_folder_click_pause(event)\" ondblclick=\"folder_open_close(this)\" onmouseup=\"file_drag_stop(event,this)\"><p><img style=\"vertical-align:middle\"";

    if (mysql_num_rows($query_response_for_folder_content) == 0) {

            echo " src=\"website_code/images/Icon_Folder_Empty.gif\" />" . str_replace("_", " ", $row['folder_name']) . "</p></div><div id=\"folderchild_" . $row['folder_id'] . "\" class=\"folder_content\">";

    } else {

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

function list_files_in_this_folder($folder_id, $sort_type) {

  global $level, $xerte_toolkits_site;

  $query = "select td.template_name as project_name, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_name, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_framework, td.template_id from " . $xerte_toolkits_site->database_table_prefix . "templatedetails td, " . $xerte_toolkits_site->database_table_prefix  . "templaterights tr, " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where td.template_id = tr.template_id and tr.user_id =\"" . $_SESSION['toolkits_logon_id'] . "\" and tr.folder=\"" . $folder_id . "\" and  " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails.template_type_id = td.template_type_id ";

  if ($sort_type == "alpha_down") {
    $query .= "order by td.template_name DESC";
  } elseif ($sort_type == "alpha_up") {
    $query .= "order by td.template_name ASC";
  } elseif ($sort_type == "date_down") {
    $query .= "order by td.date_created DESC";
  } elseif ($sort_type == "date_up") {
    $query .= "order by td.date_created ASC";
  }

  $query_response = mysql_query($query);

  while ($row = mysql_fetch_array($query_response)) {

        echo "<div id=\"file_" . $row['template_id'] .  "\" class=\"file\" preview_size=\"" . $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->preview_size . "\" editor_size=\"" . $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->editor_size . "\" style=\"padding-left:" . ($level*10) . "px\" onmousedown=\"single_click(this);file_folder_click_pause(event)\" onmouseup=\"file_drag_stop(event,this)\"><img src=\"{$xerte_toolkits_site->site_url}/website_code/images/Icon_Page.gif\" style=\"vertical-align:middle\" />" . str_replace("_", " ", $row['project_name']) . "</div>";

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

function list_folder_contents($folder_id, $sort_type) {

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

function list_users_projects($sort_type) {

  /*
  * Called by index.php to start off the process
  */

  global $level, $xerte_toolkits_site;

  $root_folder = get_user_root_folder();

  /*
  * Create the workspace folder
  */

  echo "<div class=\"folder\" id=\"folder_workspace\" ondblclick=\"folder_open_close(this)\" onclick=\"highlight_main_toggle(this)\"><p><img style=\"vertical-align:middle\"";

  echo " src=\"{$xerte_toolkits_site->site_url}/website_code/images/folder_workspace.gif\"";

    echo " />" . DISPLAY_WORKSPACE . "</p></div><div id=\"folderchild_workspace\" class=\"workspace\">";

  $level = 1;

  list_folder_contents(get_user_root_folder(), $sort_type);

  $query = "select folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where folder_name=\"recyclebin\" and login_id =\"" . $_SESSION['toolkits_logon_id'] . "\"";

  $query_response = mysql_query($query);

  $row = mysql_fetch_array($query_response);

  $level = 1;

  $query_for_folder_content = "select template_id from " . $xerte_toolkits_site->database_table_prefix . "templaterights where folder=\"" . $row['folder_id'] . "\" UNION SELECT folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where folder_parent=\"" . $row['folder_id'] . "\"";

  $query_response_for_folder_content = mysql_query($query_for_folder_content);

  echo "</div>";

  /*
  * Display the recycle bin
  */

  echo "<div class=\"folder\" id=\"recyclebin\" ondblclick=\"folder_open_close(this)\" onclick=\"highlight_main_toggle(this)\"><p><img id=\"folder_recyclebin\" style=\"vertical-align:middle\"";

  if (mysql_num_rows($query_response_for_folder_content) == 0) {

    echo " src=\"{$xerte_toolkits_site->site_url}/website_code/images/rb_empty.gif\"";

  } else {

    echo " src=\"{$xerte_toolkits_site->site_url}/website_code/images/rb_full.gif\"";
  }

  echo " />" . DISPLAY_RECYCLE . "</p></div><div id=\"folderchild_recyclebin\" class=\"folder_content\">";

  list_folder_contents($row['folder_id'], $sort_type);

  echo "</div>";

}

/**
 *
 * Function list users projects
 * This function is used to display all the unrestricted templates (Access to whom = *)
 * @version 1.0
 * @author Patrick Lockley
 */

function list_blank_templates() {

  /*
  * note the access rights to discern what templates this user can see
  */

  global $xerte_toolkits_site;

  $query_for_blank_templates = "select * from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where access_rights=\"*\" and active=true order by date_uploaded DESC";

  $query_for_blank_templates_response = mysql_query($query_for_blank_templates);

  while ($row = mysql_fetch_array($query_for_blank_templates_response)) {
    echo "<div class=\"template\" onmouseover=\"this.style.backgroundColor='#ebedf3'\" onmouseout=\"this.style.backgroundColor='#fff'\"><div class=\"template_icon\"></div><div class=\"template_desc\"><p class=\"template_name\">";

    echo $row['display_name'];

    echo "</p><p class=\"template_desc_p\">";

    echo $row['description'];

    /*
    * If no example don't display the link
    */

    if ($row['display_id'] != 0) {

      echo "</p><a href=\"javascript:example_window('" . $row['display_id'] . "' )\">" . DISPLAY_EXAMPLE . "</a> | ";

    } else {

      echo "<br>";

    }

    echo "<button id=\"" . $row['template_name'] .  "_button\" type=\"button\" class=\"xerte_button_c\" onclick=\"javascript:template_toggle('" . $row['template_name'] . "')\">" . DISPLAY_CREATE . "</button></div><div id=\"" . $row['template_name'] . "\" class=\"rename\">";

    echo "<span>" . DISPLAY_NAME . "</span><form action=\"javascript:create_tutorial('" . $row['template_name'] . "')\" method=\"post\" enctype=\"text/plain\"><input type=\"text\" width=\"200\" id=\"filename\" name=\"filename\" /> <button type=\"submit\" class=\"xerte_button_c\" >" . DISPLAY_CREATE . "</button></form></div></div>";
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

function access_check($security_details) {

  $list = explode(",", $security_details);

  while ($dev_mask = array_pop($list)) {

    if (strpos($dev_mask, "*") != 0) {

      if (strcmp(substr($dev_mask, 0, strpos($dev_mask, "*")), substr($_SESSION['toolkits_logon_username'], 0, strpos($dev_mask, "*"))) == 0) {

        return true;

      }

    } else {

      if (strcmp($dev_mask, $_SESSION['toolkits_logon_username']) == 0) {

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

function list_specific_templates() {

  global $xerte_toolkits_site;

  $query_for_blank_templates = "select * from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where access_rights!=\"*\" order by date_uploaded DESC";

  $query_for_blank_templates_response = mysql_query($query_for_blank_templates);

  while ($row = mysql_fetch_array($query_for_blank_templates_response)) {

    if (access_check($row['access_rights'])) {

      echo "<div class=\"template\" onmouseover=\"this.style.backgroundColor='#ebedf3'\" onmouseout=\"this.style.backgroundColor='#fff'\"><div class=\"template_icon\"></div><div class=\"template_desc\"><p class=\"template_name\">";

        echo $row['display_name'];

        echo "</p><p class=\"template_desc_p\">";


        echo $row['description'];

      /*
      * If no example don't display the link
      */

      if ($row['display_id'] != 0) {

        echo "</p><a href=\"javascript:example_window('" . $row['display_id'] . "' )\">" . DISPLAY_EXAMPLE . "</a> | ";

      } else {

        echo "<br>";

      }

      echo "<button type=\"button\" class=\"xerte_button_c\" onclick=\"javascript:template_toggle('" . $row['template_name'] . "')\">" . DISPLAY_CREATE . "</button></div><div id=\"" . $row['template_name'] . "\" class=\"rename\">";

      echo "<span>" . DISPLAY_NAME . "</span><form action=\"javascript:create_tutorial('" . $row['template_name'] . "')\" method=\"post\" enctype=\"text/plain\"><input type=\"text\" width=\"200\" id=\"filename\" name=\"filename\" /><br /><button type=\"submit\" class=\"xerte_button\" >" . DISPLAY_BUTTON_PROJECT_CREATE . "</button></form></div></div>";

    }

  }

}

/**
 *
 * Function login page format middle
 * This function is used to display the index.php HTML
 * @param string $buffer = A HTML string to work on
 * @version 1.0
 * @author Patrick Lockley
 */

function logged_in_page_format_middle($buffer) {

  global $xerte_toolkits_site;

  $buffer = str_replace("{{pod_one}}", $xerte_toolkits_site->pod_one, $buffer);
  $buffer = str_replace("{{pod_two}}", $xerte_toolkits_site->pod_two, $buffer);

  return $buffer;

}


/**
 *
 * Function error show template
 * This function is used to display a respinse when the users accesses a resource they have no right to
 * @version 1.0
 * @author Patrick Lockley
 */

function error_show_template() {

  echo DISPLAY_ERROR;

}


/**
 *
 * Function output locked file code
 * This function is used to display a message when a lock file is found
 * @version 1.0
 * @author Patrick Lockley
 */

function output_locked_file_code($lock_file_creator) {

  echo "<p>" . DISPLAY_EDITED . $lock_file_creator . "</p><p>" . DISPLAY_LOCKFILE_MESSAGE . "</p>";

  echo "<form action=\"\" method=\"POST\"><input type=\"hidden\" value=\"delete_lockfile\" name=\"lockfile_clear\" /><input type=\"submit\" value=\"" . DISPLAY_LOCKFILE_DELETE . "\" /></form>";

}

?>
