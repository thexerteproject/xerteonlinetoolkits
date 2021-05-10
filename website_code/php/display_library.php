<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

  $prefix = $xerte_toolkits_site->database_table_prefix;
  $query = "SELECT folder_id, folder_name FROM {$prefix}folderdetails WHERE login_id = ? AND folder_parent = ?";
  $rows = db_query($query, array($_SESSION['toolkits_logon_id'], $folder_id));
  
  foreach($rows as $row) { 
    $extra='<p>';
    $extra1='</p>';
$extra2='';
    if($item!==false) {
      $extra='';
      $extra1='';
      $extra2=" style=\"padding-left:" . ($level*10) . "px\" ";
    }

    echo "<div id=\"dynamic_area_folder\" $extra2>$extra<img style=\"\" src=\"{$path}website_code/images/Icon_Folder.gif\" />" . 
            str_replace("_", " ", $row['folder_name']) . "$extra1</div><div id=\"dynamic_area_folder_content\">";


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
  $prefix = $xerte_toolkits_site->database_table_prefix;

  $query = "SELECT template_name, template_id FROM {$prefix}templatedetails WHERE template_id IN (
      SELECT {$prefix}templaterights.template_id FROM {$prefix}templaterights WHERE user_id = ? AND folder = ?)
          ORDER BY {$prefix}templatedetails.date_created ASC";

  $rows = db_query($query, array($_SESSION['toolkits_logon_id'], $folder_id));
  foreach($rows as $row) {
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
// TODO depracate!!
function list_folders_in_this_folder($folder_id, $sort_type){

  /*
  * use the global level for folder indenting
  */

  global $level, $xerte_toolkits_site;

  /*
  * select the folders in this folder
  */

  $prefix = $xerte_toolkits_site->database_table_prefix;

  $query = "select folder_id, folder_name from {$prefix}folderdetails where login_id = ? AND folder_parent = ?";
  $params = array($_SESSION['toolkits_logon_id'], $folder_id);
  
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

  $query_response = db_query($query, $params);
  
  /*
  * recurse through the folders
  */

  foreach($query_response as $row) { 

    $query_for_folder_content = "select template_id from {$prefix}templaterights where folder=? " .
        " UNION SELECT folder_id FROM {$prefix}folderdetails where folder_parent=?";

    $params = array($row['folder_id'], $row['folder_id']);
    
    $query_response_for_folder_content = db_query($query_for_folder_content, $params); 

    /*
    * Use level to nest the folders
    */

        echo "<div class=\"folder\" style=\"padding-left:" . ($level*10) . "px\" id=\"folder_" . $row['folder_id'] .  "\" onmousedown=\"single_click(this);file_folder_click_pause(event)\" ondblclick=\"folder_open_close(this)\" onmouseup=\"file_drag_stop(event,this)\"><p><img style=\"vertical-align:middle\"";

    if (sizeof($query_response_for_folder_content) == 0) {

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
// TODO depracate!!
function list_files_in_this_folder($folder_id, $sort_type) {

  global $level, $xerte_toolkits_site;

  $prefix = $xerte_toolkits_site->database_table_prefix;

  $query = "select td.template_name as project_name, {$prefix}originaltemplatesdetails.template_name,"
  . " {$prefix}originaltemplatesdetails.template_framework, td.template_id from {$prefix}templatedetails td, "
  . " {$prefix}templaterights tr, {$prefix}originaltemplatesdetails where td.template_id = tr.template_id and tr.user_id = ? "
  . " and tr.folder= ? and  {$prefix}originaltemplatesdetails.template_type_id = td.template_type_id ";

  $params = array($_SESSION['toolkits_logon_id'], $folder_id);
  
  if ($sort_type == "alpha_down") {
    $query .= "order by td.template_name DESC";
  } elseif ($sort_type == "alpha_up") {
    $query .= "order by td.template_name ASC";
  } elseif ($sort_type == "date_down") {
    $query .= "order by td.date_created DESC";
  } elseif ($sort_type == "date_up") {
    $query .= "order by td.date_created ASC";
  }

  $query_response = db_query($query, $params);

  foreach($query_response as $row) {

        echo "<div id=\"file_" . $row['template_id'] .  "\" class=\"file\" preview_size=\"" . $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->preview_size . "\" editor_size=\"" . $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->editor_size . "\" style=\"padding-left:" . ($level*10) . "px\" onmousedown=\"single_click(this);file_folder_click_pause(event)\" onmouseup=\"file_drag_stop(event,this)\"><img src=\"{$xerte_toolkits_site->site_url}/website_code/images/Icon_Page_".strtolower($row['template_name']).".gif\" style=\"vertical-align:middle;padding-right:5px\" />" . str_replace("_", " ", $row['project_name']) . "</div>";

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
// TODO depracate!!
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
// TODO depracate!!
function list_users_projects($sort_type) {

  /*
  * Called by index.php to start off the process
  */

  global $level, $xerte_toolkits_site;

  $root_folder = get_user_root_folder();

  /*
  * Create the workspace folder
  */

  echo "<div class=\"folder\" id=\"folder_workspace\" ondblclick=\"folder_open_close(this)\" onclick=\"highlight_main_toggle(this)\"><p><img style=\"vertical-align:middle;padding-right:5px\"";

  echo " src=\"{$xerte_toolkits_site->site_url}/website_code/images/folder_workspace.gif\"";

    echo " />" . DISPLAY_WORKSPACE . "</p></div><div id=\"folderchild_workspace\" class=\"workspace\">";

  $level = 1;

  list_folder_contents(get_user_root_folder(), $sort_type);

  $prefix = $xerte_toolkits_site->database_table_prefix;
  
  $query = "select folder_id from {$prefix}folderdetails where folder_name=? AND login_id = ?";
  $params = array("recyclebin", $_SESSION['toolkits_logon_id']);

  $row = db_query_one($query, $params);

  $level = 1;

  $query_for_folder_content = "select template_id from {$prefix}templaterights where folder= ? "
  . " UNION SELECT folder_id from {$prefix}folderdetails where folder_parent= ?";
  
  $params2 = array($row['folder_id'], $row['folder_id']);
  
  $query_response_for_folder_content = db_query($query_for_folder_content, $params2);

  echo "</div>";

  /*
  * Display the recycle bin
  */

  echo "<div class=\"folder\" id=\"recyclebin\" ondblclick=\"folder_open_close(this)\" onclick=\"highlight_main_toggle(this)\"><p><img id=\"folder_recyclebin\" style=\"vertical-align:middle;padding-right:5px\"";

  if (sizeof($query_response_for_folder_content) == 0) {

    echo " src=\"{$xerte_toolkits_site->site_url}/website_code/images/rb_empty.gif\"";

  } else {

    echo " src=\"{$xerte_toolkits_site->site_url}/website_code/images/rb_full.gif\"";
  }

  echo " />" . DISPLAY_RECYCLE . "</p></div><div id=\"folderchild_recyclebin\" class=\"folder_content\">";

  list_folder_contents($row['folder_id'], $sort_type);

  echo "</div>";

}

/**
 * Builds an array with the folders only of the folder suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 * @param $folder_id
 * @param $sort_type
 * @param int $group_id if we are looking a group not a folder
 */
function get_folders_in_this_folder($folder_id, $tree_id, $sort_type, $copy_only=false, $group_id = -1){

    /*
    * use the global level for folder indenting
    */
    global $xerte_toolkits_site;

    $items = array();
    /*
    * select the folders in this folder
    */

    $prefix = $xerte_toolkits_site->database_table_prefix;

    if ($group_id == -1){
        $query = "select folder_id, folder_name from {$prefix}folderdetails where login_id = ? AND folder_parent = ?";
        $params = array($_SESSION['toolkits_logon_id'], $folder_id);
    }else{
        $query = "select fd.folder_id, fd.folder_name from {$prefix}folderdetails fd, {$prefix}folder_group_rights fgr "
        . " where fd.folder_id = fgr.folder_id AND fgr.group_id = ?";
        $params = array($group_id);
    }

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

    $query_response = db_query($query, $params);

    /*
    * recurse through the folders
    */

    foreach($query_response as $row) {

        $item = new stdClass();
        $item->id = $tree_id . "_F" . $row['folder_id'];
        $item->xot_id = $row['folder_id'];
        $item->parent = $tree_id;
        $item->text = $row['folder_name'];
        $item->type = "folder";
        $item->xot_type = "folder";
        $item->published = false;
        $item->shared = false;

        $items[] = $item;

        $files = get_folder_contents($item->xot_id, $item->id,  $sort_type, $copy_only);
        if ($files) {
            $items = array_merge($items, $files);
        }

    }
    return $items;

}

/**
 * Builds an array with the files only of the folder suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 * @param $folder_id
 * @param $sort_type
 * @param int $group_id if we are looking for files in a group not folder.
 */

function get_files_in_this_folder($folder_id, $tree_id, $sort_type, $copy_only, $group_id = -1)
{

    global $xerte_toolkits_site;

    $items = array();

    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = NULL;
    $params = NULL;
    if ($group_id == -1) {
        $query = "select td.template_name as project_name, otd.template_name,td.access_to_whom, td.tsugi_published, "
            . " otd.parent_template, otd.template_framework, td.template_id, tr.role, count(tr2.template_id) as nrshared from {$prefix}templatedetails td, "
            . " {$prefix}templaterights tr, {$prefix}originaltemplatesdetails otd left join {$prefix}templaterights tr2 on tr.template_id=tr2.template_id "
            . " where td.template_id = tr.template_id and tr.user_id = ? "
            . " and tr.folder= ? and  otd.template_type_id = td.template_type_id ";
        $query  = "select td.template_name as project_name, otd.template_name,td.access_to_whom, td.tsugi_published, "
            . " otd.parent_template, otd.template_framework, td.template_id, tr.role, count(tr2.template_id) as nrshared from {$prefix}templatedetails td "
            . " join {$prefix}templaterights tr on td.template_id=tr.template_id and tr.user_id=? and tr.folder=? "
            . " join {$prefix}originaltemplatesdetails otd on otd.template_type_id = td.template_type_id "
            . " left join templaterights tr2 on td.template_id=tr2.template_id ";
        $params = array($_SESSION['toolkits_logon_id'], $folder_id);
    } else {
        //select templates the same way as regularly, however, now check for group_id in template_group_rights
        $query = "select td.template_name as project_name, otd.template_name,td.access_to_whom, td.tsugi_published, "
            . " otd.parent_template, otd.template_framework, td.template_id, tgr.role, 2 as nrshared from {$prefix}templatedetails td, "
            . " {$prefix}template_group_rights tgr, {$prefix}originaltemplatesdetails otd where td.template_id = tgr.template_id and tgr.group_id = ? "
            . " and otd.template_type_id = td.template_type_id ";
        $params = array($group_id);
    }

    if ($copy_only) {
        $query .= " and (tr.role = 'creator' or tr.role ='co-author') ";
    }

    if ($group_id == -1) {
        $query .= " group by td.template_id, tr.role ";
    }

    if ($sort_type == "alpha_down") {
        $query .= "order by td.template_name DESC";
    } elseif ($sort_type == "alpha_up") {
        $query .= "order by td.template_name ASC";
    } elseif ($sort_type == "date_down") {
        $query .= "order by td.date_created DESC";
    } elseif ($sort_type == "date_up") {
        $query .= "order by td.date_created ASC";
    }


    $query_response = db_query($query, $params);

    foreach ($query_response as $row) {

        // Check whether shared LO is in recyclebin
        if ($row['role'] != 'creator') {
            $sql = "select * from {$prefix}templaterights tr, {$prefix}folderdetails fd where tr.role='creator' and tr.folder=fd.folder_id and tr.template_id=?";
            $params = array($row['template_id']);
            $res = db_query_one($sql, $params);

            if ($res !== false && $res['folder_name'] == 'recyclebin') {
                continue;
            }
        }
        // Check if template is shared
        //$sql = "select count(tr.template_id) as nr_shared from {$prefix}templaterights tr where tr.template_id=?";
        //$params = array($row['template_id']);
        //$shared = db_query_one($sql, $params);

        //echo "<div id=\"file_" . $row['template_id'] .  "\" class=\"file\" preview_size=\"" . $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->preview_size . "\" editor_size=\"" . $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->editor_size . "\" style=\"padding-left:" . ($level*10) . "px\" onmousedown=\"single_click(this);file_folder_click_pause(event)\" onmouseup=\"file_drag_stop(event,this)\"><img src=\"{$xerte_toolkits_site->site_url}/website_code/images/Icon_Page_".strtolower($row['template_name']).".gif\" style=\"vertical-align:middle;padding-right:5px\" />" . str_replace("_", " ", $row['project_name']) . "</div>";
        $item = new stdClass();
        $item->id = $tree_id . "_" . $row['template_id'];
        $item->xot_id = $row['template_id'];
        $item->parent = $tree_id;
        $item->text = $row['project_name'];
        if ($group_id == -1)
            $item->type = strtolower($row['parent_template']);
        else
            $item->type = strtolower($row['parent_template'] . "_group");
        $item->xot_type = "file";
        $item->published = $row['access_to_whom'] != 'Private' || $row['tsugi_published'] == 1;
        $item->shared = $row['nrshared'] > 1;
        $item->editor_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->editor_size;
        $item->preview_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->preview_size;

        $items[] = $item;
    }
    return $items;
}


/**
 * Builds an array with the files only of the group suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 * @param $group_id
 * @param $sort_type
 */

function get_files_in_this_group($group_id, $tree_id, $sort_type, $copy_only) {

    global $xerte_toolkits_site;

    $items = array();

    $prefix = $xerte_toolkits_site->database_table_prefix;

    //select templates the same way as in regular get_files_in_this_folder, however, now check for group_id in template_group_rights
    $query = "select td.template_name as project_name, otd.template_name,"
        . " otd.parent_template, otd.template_framework, td.template_id, tgr.role from {$prefix}templatedetails td, "
        . " {$prefix}template_group_rights tgr, {$prefix}originaltemplatesdetails otd where td.template_id = tgr.template_id and tgr.group_id = ? "
        . " and otd.template_type_id = td.template_type_id ";

    if ($copy_only)
    {
        $query .= " and (tgr.role = 'creator' or tgr.role ='co-author') ";
    }

    if ($sort_type == "alpha_down") {
        $query .= "order by td.template_name DESC";
    } elseif ($sort_type == "alpha_up") {
        $query .= "order by td.template_name ASC";
    } elseif ($sort_type == "date_down") {
        $query .= "order by td.date_created DESC";
    } elseif ($sort_type == "date_up") {
        $query .= "order by td.date_created ASC";
    }

    $params = array($group_id);

    $query_response = db_query($query, $params);

    foreach($query_response as $row) {

        // Check whether shared LO is in recyclebin
        /*
        if ($row['role'] != 'creator' && $row['role'] != 'co-author')
        {
            $sql = "select * from {$prefix}templaterights tr, {$prefix}folderdetails fd where tr.role='creator' and tr.folder=fd.folder_id and tr.template_id=?";
            $params = array($row['template_id']);
            $res = db_query_one($sql, $params);

            if ($res !== false && $res['folder_name'] == 'recyclebin')
            {
                continue;
            }
        }
        */

        $item = new stdClass();
        $item->id = $tree_id . "_" . $row['template_id'];
        $item->xot_id = $row['template_id'];
        $item->parent = $tree_id;
        $item->text = $row['project_name'];
        $item->type = strtolower($row['parent_template']) . "_group";
        $item->xot_type = "file";
        $item->published = $row['access_to_whom'] != 'Private' || $row['tsugi_published'] == 1;
        $item->shared = $shared['nr_shared'] > 1;
        $item->editor_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->editor_size;
        $item->preview_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->preview_size;

        $items[] = $item;
    }
    return $items;

}



/**
 * Builds an array with the whole structure of the folder suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 * @param $folder_id
 * @param $sort_type
 * @param int $group_id if we are looking for files in a group not folder.
 */
function get_folder_contents($folder_id, $tree_id, $sort_type, $copy_only, $group_id = -1) {

    if ($group_id == -1){
        $folders = get_folders_in_this_folder($folder_id, $tree_id, $sort_type, $copy_only);
        $files = get_files_in_this_folder($folder_id, $tree_id, $sort_type, $copy_only);
    }else{
        $folders = get_folders_in_this_folder(-1, $tree_id, $sort_type, $copy_only, $group_id);
        $files = get_files_in_this_folder(-1, $tree_id, $sort_type, $copy_only, $group_id);
    }
    if ($folders && $files) {
        return array_merge($folders, $files);
    }
    elseif ($folders)
    {
        return $folders;
    }
    else {
        return $files;
    }
}


/**
 * Builds an array with the whole structure of the group folder suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 * @param $group_id
 * @param $sort_type
 */
function get_group_contents($group_id, $tree_id, $sort_type, $copy_only) {

    //$folders = get_folders_in_this_folder($folder_id, $tree_id, $sort_type, $copy_only);
    $files = get_files_in_this_group($group_id, $tree_id, $sort_type, $copy_only);
    /*if ($folders && $files) {
        return array_merge($folders, $files);
    }
    elseif ($folders)
    {
        return $folders;
    }
    else {
        return $files;
    }*/
    return $files;
}


/**
 * Builds an array with the whole structure of the workspace suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 *
 * @param $sort_type the way the workspace is to be sorte
 */
function get_users_projects($sort_type, $copy_only=false)
{

    global $xerte_toolkits_site;

    $root_folder = get_user_root_folder();

    $workspace = new stdClass();
    $workspace->user = $_SESSION['toolkits_logon_id'];
    $workspace->items = array();

    /**
     * We've two toplevel icons
     * - Workspace
     * - Recyclebin
     *
     * Groups are toplevel now too
     */

    $workspace->workspace_id = "ID_" . $_SESSION['toolkits_logon_id'] . "_F" . get_user_root_folder();
    $item = new stdClass();
    $item->id = $workspace->workspace_id;
    $item->xot_id = get_user_root_folder();
    $item->parent = "#";
    $item->text = DISPLAY_WORKSPACE;
    $item->type = "workspace";
    $item->xot_type = "workspace";
    $item->published = false;
    $item->shared = false;
    $state = new stdClass();
    $state->opened = true;
    $state->disabled = false;
    $state->selected = true;
    $item->state = $state;

    //workspace content
    $workspace->items[] = $item;
    $workspace->nodes[$item->id] = $item;
    $items = get_folder_contents($item->xot_id, $item->id, $sort_type, $copy_only);
    if ($items) {
        $workspace->items = array_merge($workspace->items, $items);
        foreach($items as $item)
        {
            $workspace->nodes[$item->id] = $item;
        }
    }

    //group shared content
    //check to which groups the user belongs
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = "SELECT * FROM {$prefix}user_group_members, {$prefix}user_groups WHERE user_group_members.login_id = ?".
        " AND user_group_members.group_id = user_groups.group_id ORDER BY user_groups.group_name";
    $groups = db_query($query, array($_SESSION['toolkits_logon_id']));
    $workspace->groups = array();
    $counter = 0;
    foreach ($groups as $group){
        $workspace->groups[$counter] = "ID_" . $_SESSION['toolkits_logon_id'] . "_G" . $group['group_id'];
        $item = new stdClass();
        $item->id = $workspace->groups[$counter];
        $item->xot_id = $group['group_id'];
        $item->parent = "#";
        $item->text = $group['group_name'];
        $item->type = "group";
        $item->xot_type = "group";

        $workspace->items[] = $item;
        $workspace->nodes[$item->id] = $item;
        $items = get_folder_contents($item->xot_id, $item->id, $sort_type, $copy_only, $item->xot_id);
        if ($items) {
            $workspace->items = array_merge($workspace->items, $items);
            foreach($items as $item)
            {
                $workspace->nodes[$item->id] = $item;
            }
        }

        $counter++;
    }

    //recycle bin content
    $query = "select folder_id from {$prefix}folderdetails where folder_name=? AND login_id = ?";
    $params = array("recyclebin", $_SESSION['toolkits_logon_id']);

    $row = db_query_one($query, $params);

    $workspace->recyclebin_id = "ID_" . $_SESSION['toolkits_logon_id'] . "_F" . $row['folder_id'];
    if (!$copy_only) {
        $item = new stdClass();
        $item->id = $workspace->recyclebin_id;
        $item->xot_id = $row['folder_id'];
        $item->parent = "#";
        $item->text = DISPLAY_RECYCLE;
        $item->type = "recyclebin";
        $item->xot_type = "recyclebin";
        $item->published = false;

        $workspace->items[] = $item;
        $workspace->nodes[$item->id] = $item;
        $items = get_folder_contents($item->xot_id, $item->id, $sort_type, $copy_only);
        if ($items) {
            $workspace->items = array_merge($workspace->items, $items);
            foreach ($items as $item) {
                $workspace->nodes[$item->id] = $item;
            }
        }
    }

    // setup the templates available in the installation , to determine the node types
    $query_for_blank_templates = "select * from {$prefix}originaltemplatesdetails where template_name=parent_template order by date_uploaded DESC";

    $templates = array();
    $grouptemplates = array();
    $rows = db_query($query_for_blank_templates, array());
    foreach($rows as $row)
    {
        $templates[] = strtolower($row['parent_template']);
        $grouptemplates[] = strtolower($row['parent_template']) . "_group";
    }
    $workspace->templates = $templates;
    $workspace->grouptemplates = $grouptemplates;

    return json_encode($workspace);
}

function get_project_info($template_id)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = "select * from {$prefix}templatedetails where template_id=?";
    $params = array($template_id);

    $rows = db_query($query, $params);
    $html = '<table class="projectInfo">';
    foreach ($rows as $row)
    {

        foreach($row as $col)
        {
            $html .= "<tr>";
            $html .= "<td>" . $col . "</td>";
            $html .= "</tr>";
        }

    }
    $html .= "</table>";


    return $html;
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

  
  $prefix = $xerte_toolkits_site->database_table_prefix;

  $query_parent_templates = "select * from {$prefix}originaltemplatesdetails where "
  . "template_name=parent_template and active= ? order by date_uploaded DESC";

  $parent_templates = db_query($query_parent_templates, array(1));

  $query_for_blank_templates = "select * from {$prefix}originaltemplatesdetails where "
  . "active= ? order by parent_template, date_uploaded DESC";

  $rows = db_query($query_for_blank_templates, array(1));
  
  
  foreach($parent_templates as $template) {
      if (access_check($template['access_rights'])) {
          // derived templates
          $derived = array($template);
          foreach ($rows as $row) {
              if ($row['template_name'] != $row['parent_template'] && $template['parent_template'] == $row['parent_template'] && access_check($row['access_rights'])) {
                  array_push($derived, $row);
              }
          }
          echo "<div class=\"template\" onmouseover=\"this.style.backgroundColor='#ebedf3'\" "
              . "onmouseout=\"this.style.backgroundColor='#fff'\">"
              . "<div class=\"template_icon " . strtolower($template['parent_template']) . "\">"
              . "</div><div class=\"template_desc\"><p class=\"parent_template\">";

          echo $template['display_name'];

          echo "</p><p class=\"template_desc_p\">";

          echo $template['description'];

          /*
          * If no example don't display the link
          */

          if ($template['display_id'] != 0) {

              echo "</p><a href=\"javascript:example_window('" . $template['display_id'] . "' )\">" . DISPLAY_EXAMPLE . "</a> | ";

          } else {

              echo "<br>";

          }

          ?>
          <button id="<?php echo $template['template_name'] ?>_button" type="button" class="xerte_button_c_no_width"
                  onclick="javascript:template_toggle('<?php echo $template['template_name'] ?>')">
              <i class="fa  icon-plus-sign xerte-icon"></i><?php echo DISPLAY_CREATE; ?>&nbsp;
          </button>
          </div>
          <div id="<?php echo $template['template_name']; ?>" class="rename">
              <span><?php echo(count($derived) == 1 ? DISPLAY_NAME : DISPLAY_CHOOSE_AND_NAME); ?></span>
              <form action="javascript:create_tutorial('<?php echo $template['parent_template']; ?>')" method="post"
                    enctype="text/plain">
                  <?php
                  if (count($derived) == 1) {
                      ?>
                      <input type="hidden" id="<?php echo $template['template_name']; ?>_templatename"
                             name="templatename" value="<?php echo $template['template_name']; ?>"/>
                      <?php
                  } else {
                      ?>
                      <select id="<?php echo $template['template_name']; ?>_templatename" name="templatename"
                              class="select_template">

                          <?php
                          foreach ($derived as $row) {
                              ?>
                              <option value="<?php echo $row['template_name']; ?>" <?php ($row['template_name'] == $row['parent_template'] ? "\"selected\"" : ""); ?> ><?php echo($row['template_name'] == $row['parent_template'] ? DISPLAY_DEFAULT_TEMPLATE : $row['display_name']); ?></option>
                              <?php
                          }
                          ?>
                      </select>
                      <?php
                  }
                  ?>
                  <input type="text" width="200" id="<?php echo $template['template_name']; ?>_filename"
                         name="filename"/>
                  <button type="submit" class="xerte_button_c"><i
                              class="fa  icon-plus-sign xerte-icon"></i><?php echo DISPLAY_CREATE; ?></button>
              </form>
          </div>
          </div>
          <?php
      }
  }
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

  if ($security_details == '*')
      return true;

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

?>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
</head>
<body>
<?php

    // get username only
    $temp = explode(" ", $lock_file_creator);
    $lock_file_creator_username = $temp[0];
    if ($lock_file_creator_username == $_SESSION['toolkits_logon_username']) {
        $user = str_replace($lock_file_creator_username,  DISPLAY_LOCKFILE_YOU . '! ', $lock_file_creator);
        echo "<p>" . DISPLAY_EDITED . $user . "</p><p>" . DISPLAY_LOCKFILE_YOU_MESSAGE . "</p>";
    }
    else {
        echo "<p>" . DISPLAY_EDITED . $lock_file_creator . "!</p><p>" . DISPLAY_LOCKFILE_MESSAGE . "</p>";
    }
    echo "<form action=\"\" method=\"POST\"><input type=\"hidden\" value=\"delete_lockfile\" name=\"lockfile_clear\" /><input type=\"submit\" value=\"" . DISPLAY_LOCKFILE_DELETE . "\" /></form>";
?>
</body>
</html>
<?php
}
