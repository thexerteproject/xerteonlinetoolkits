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
  $query = "SELECT folder_id, folder_name FROM {$prefix}folderdetails WHERE folder_parent = ?";
  $rows = db_query($query, array($folder_id));
  
  foreach($rows as $row) { 
    $extra='';
    $extra1='';
	$extra2='';
    if($item!==false) {
      $extra='';
      $extra1='';
      $extra2=" style=\"padding-left:" . ($level*10) . "px\" ";
    }

    echo "<li class=\"dynamic_area_folder\" $extra2>$extra<i class=\"fa fa-folder-open fa-fw xerte-icon\"></i>&nbsp;" . 
            str_replace("_", " ", $row['folder_name']) . "$extra1" . "<ul class=\"dynamic_area_folder\">";

    $item = list_folder_contents_event_free($row['folder_id'], $path, $item, $input_method);

    echo "</ul></li>";

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
      SELECT {$prefix}templaterights.template_id FROM {$prefix}templaterights WHERE folder = ?)
          ORDER BY {$prefix}templatedetails.date_created ASC";

  $rows = db_query($query, array($folder_id));
  foreach($rows as $row) {
    $extra='';
    $extra1='';
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

    echo "<li class=\"dynamic_area_file\" $extra2 >$extra<i class=\"fa fa-file-text fa-fw xerte-icon\"></i>&nbsp;" . str_replace("_", " ", $row['template_name']) . "$extra1</li>\r\n";

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
function list_folders_in_this_folder_depracated($folder_id, $sort_type){

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
function list_files_in_this_folder_depracated($folder_id, $sort_type) {

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
function list_folder_contents_depracated($folder_id, $sort_type) {

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
function list_users_projects_depracated($sort_type) {

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

if (!function_exists('str_contains')) {
    function str_contains($haystack, $needle)
    {
        return '' === $needle || false !== strpos($haystack, $needle);
    }
}

function get_subfolders_of_shared_folder($folder_id, $role, $sort_type){

    /*
    * use the global level for folder indenting
    */
    global $xerte_toolkits_site;

    $items = array();
    /*
    * select the folders in this folder
    */

    $prefix = $xerte_toolkits_site->database_table_prefix;


    $query = "select fd.folder_id, fd.folder_name, fr.role, fr.folder_parent from {$prefix}folderdetails fd, {$prefix}folderrights fr where fr.folder_id = fd.folder_id AND fr.folder_parent = ?";
    $params = array($folder_id);

    /*
    * Add some more to the query to sort the files
    */

    if ($sort_type == "alpha_down") {
        $query .= " order by fd.folder_name DESC";
    } elseif ($sort_type == "alpha_up") {
        $query .= " order by fd.folder_name ASC";
    } elseif ($sort_type == "date_down") {
        $query .= " order by fd.date_created DESC";
    } elseif ($sort_type == "date_up") {
        $query .= " order by fd.date_created ASC";
    }

    $query_response = db_query($query, $params);

    /*
    * recurse through the folders
    */

    foreach($query_response as $row) {

        $item = array();
        $item['folder_id'] = $row['folder_id'];
        $item['folder_name'] = $row['folder_name'];
        $item['folder_parent'] = $row['folder_parent'];
        $item['role'] = $role;
        $item['type'] = "sub_folder_shared";

        $items[] = $item;

        $folders = get_subfolders_of_shared_folder($item['folder_id'], $role, $sort_type);
        if ($folders) {
            $items = array_merge($items, $folders);
        }
    }

    return $items;
}

/**
 *   Get all the folders and files in a specific group folder
 *
 */
function get_group_folder_contents($group_id, $tree_id, $sort_type, $copy_only=false)
{
    /*
        * use the global level for folder indenting
        */
    global $xerte_toolkits_site;

    $items = array();
    /*
    * select the folders in this folder
    */

    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = "select fd.folder_id, fd.folder_name, fgr.role from {$prefix}folderdetails fd, {$prefix}folder_group_rights fgr "
        . " where fd.folder_id = fgr.folder_id AND fgr.group_id = ?";
    $params = array($group_id);

    /*
    * Add some more to the query to sort the files
    */

    if ($sort_type == "alpha_down") {
        $query .= " order by fd.folder_name DESC";
    } elseif ($sort_type == "alpha_up") {
        $query .= " order by fd.folder_name ASC";
    } elseif ($sort_type == "date_down") {
        $query .= " order by fd.date_created DESC";
    } elseif ($sort_type == "date_up") {
        $query .= " order by fd.date_created ASC";
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
        $item->role = (isset($row['role']) ? $row['role'] : '');
        $item->type = "folder_shared";

        $item->xot_type = "folder";
        $item->published = false;
        $item->shared = false;

        $items[] = $item;

        $files = get_shared_folder_contents($item->xot_id, $item->role, $item->id,  $sort_type, $copy_only);
        if ($files) {
            $items = array_merge($items, $files);
        }
    }

    return $items;
}

/**
 * Just get the file shared with a specific group
 */
function get_group_files_in_this_group($folder_id, $tree_id, $sort_type, $copy_only=false)
{
    global $xerte_toolkits_site;

    $items = array();

    $prefix = $xerte_toolkits_site->database_table_prefix;

    //select templates the same way as regularly, however, now check for group_id in template_group_rights
    $query = "select td.template_name as project_name, td.creator_id, otd.template_name,td.access_to_whom, td.tsugi_published, "
        . " otd.parent_template, otd.template_framework, td.template_id, tgr.role, '' as creator_folder_name, 2 as nrshared from {$prefix}templatedetails td, "
        . " {$prefix}template_group_rights tgr, {$prefix}originaltemplatesdetails otd where td.template_id = tgr.template_id and tgr.group_id = ? "
        . " and otd.template_type_id = td.template_type_id ";
    if ($copy_only)
        $query .= " and (tgr.role = 'creator' or tgr.role ='co-author') ";
    $params = array($folder_id);
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
        if ($row['role'] != 'creator' && $row['creator_folder_name'] == "recyclebin") {
            continue;
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
        //$item->role = $row['role'];
        if($row["creator_id"] == $_SESSION["toolkits_logon_id"]){
            $item->role = $row['role'];
        }else{
            $item->role = "non-creator";
        }

        $shared = "";

        $item->type = ($shared == "") ? strtolower($row['parent_template']) : strtolower($row['parent_template']) . "_" . $shared;
        $item->xot_type = "file";

        $item->published = $row['access_to_whom'] != 'Private' || $row['tsugi_published'] == 1;
        $item->shared = $row['nrshared'] > 1;
        if (!isset($xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']})) {
            $item->editor_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['parent_template']}->editor_size;
            $item->preview_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['parent_template']}->preview_size;
        }
        else {
            $item->editor_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->editor_size;
            $item->preview_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->preview_size;
        }

        $items[] = $item;
    }

    return $items;
}

function get_group_contents($group_id, $tree_id, $sort_type, $copy_only=false)
{

    /*
    * select the folder contents in this folder
    */

    $items = get_group_folder_contents($group_id, $tree_id, $sort_type, $copy_only);
    $files = get_group_files_in_this_group($group_id, $tree_id, $sort_type, $copy_only);
    if ($files) {
        $items = array_merge($items, $files);
    }

    return $items;
}

/**
 * Builds an array with the folders only of the folder suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 * @param $folder_id
 * @param $sort_type
 */
function get_folders_in_this_folder($folder_id, $tree_id, $sort_type, $copy_only=false, $type = ""){

    /*
    * use the global level for folder indenting
    */
    global $xerte_toolkits_site;

    $items = array();
    /*
    * select the folders in this folder
    */

    $prefix = $xerte_toolkits_site->database_table_prefix;

    if ($type == "group_top") {
        $query = "select fd.folder_id, fd.folder_name from {$prefix}folderdetails fd, {$prefix}folder_group_rights fgr "
            . " where fd.folder_id = fgr.folder_id AND fgr.group_id = ?";
        $params = array($folder_id);
    }else{
        $query = "select fd.folder_id, fd.folder_name, fr.role from {$prefix}folderdetails fd, {$prefix}folderrights fr where fr.folder_id = fd.folder_id AND fr.folder_parent = ?";
        $params = array($folder_id);
    }

    $top = false;
    $newtype = $type;
    if (str_contains($type, "_top")){
        $top = true;
        $newtype = str_replace("_top", "", $type);
    }

    /*
    * Add some more to the query to sort the files
    */

    if ($sort_type == "alpha_down") {
        $query .= " order by fd.folder_name DESC";
    } elseif ($sort_type == "alpha_up") {
        $query .= " order by fd.folder_name ASC";
    } elseif ($sort_type == "date_down") {
        $query .= " order by fd.date_created DESC";
    } elseif ($sort_type == "date_up") {
        $query .= " order by fd.date_created ASC";
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
        $item->role = (isset($row['role']) ? $row['role'] : '');
        $shared = "";
        if ($item->role != 'creator' || $type == 'group_top'){
            $shared = 'shared';
        }
        $item->type = ($shared == "") ?  "folder" : "folder_" . $shared;

       /* if($row['folder_id'] == $folder_id){
            $item->type = "folder_shared";
        }else{
        }*/

        $item->xot_type = "folder";
        $item->published = false;
        $item->shared = false;

        $items[] = $item;

        $files = get_folder_contents($item->xot_id, $item->id,  $sort_type, $copy_only, $newtype);
        if ($files) {
            $items = array_merge($items, $files);
        }
    }

    return $items;
}

/**
 * Retrieve the whole subfolder structure of a shared folder in one sql query.
 * Assume a max depth of 10 levels.
 * @param $folder_id
 * @param $tree_id
 * @param $sort_type
 * @param $copy_only
 * @param $type
 * @return array
 */
function get_shared_folder_contents($folder_id, $role, $tree_id, $sort_type, $copy_only=false)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $items = array();
    // Retrieve the whole structure of the shared folder in one query
    // Assume a max depth of 10 levels
    $sql = "select fr0.folder_id as id0, 
            fr1.folder_id as id1, 
            fr2.folder_id as id2, 
            fr3.folder_id as id3, 
            fr4.folder_id as id4, 
            fr5.folder_id as id5, 
            fr6.folder_id as id6, 
            fr7.folder_id as id7, 
            fr8.folder_id as id8, 
            fr9.folder_id as id9,
            fr10.folder_id as id10
             from {$prefix}folderrights fr0
                left outer join {$prefix}folderrights fr1 on fr1.folder_parent = fr0.folder_id 
                left outer join {$prefix}folderrights fr2 on fr2.folder_parent = fr1.folder_id 
                left outer join {$prefix}folderrights fr3 on fr3.folder_parent = fr2.folder_id 
                left outer join {$prefix}folderrights fr4 on fr4.folder_parent = fr3.folder_id 
                left outer join {$prefix}folderrights fr5 on fr5.folder_parent = fr4.folder_id 
                left outer join {$prefix}folderrights fr6 on fr6.folder_parent = fr5.folder_id 
                left outer join {$prefix}folderrights fr7 on fr7.folder_parent = fr6.folder_id 
                left outer join {$prefix}folderrights fr8 on fr8.folder_parent = fr7.folder_id 
                left outer join {$prefix}folderrights fr9 on fr9.folder_parent = fr8.folder_id 
                left outer join {$prefix}folderrights fr10 on fr10.folder_parent = fr9.folder_id 
                where fr0.folder_id = ? and fr0.role = 'creator'";
    $params = array($folder_id);
    $folder_structure = db_query($sql, $params);
    $folders = array();
    if (count($folder_structure) == 0) {
        return $items;
    }
    $pos = strpos($tree_id, "_F" . $folder_id);
    if ($pos === false) {
        return $items;
    }
    $parent_tree_id = substr($tree_id, 0, $pos);
    $folders[$folder_id] = array('id' => $tree_id, 'parent' => $parent_tree_id, 'role' => $role);
    foreach ($folder_structure as $folder) {
        $ctree = $tree_id;
        foreach($folder as $key => $id) {
            if ($key == 'id0' || $id == null) {
                continue;
            }
            $folders[$id] = array('id' => $ctree . "_F" . $id, 'parent' => $ctree, 'role' => $role);
            $ctree .= "_F" . $id;
        }
    }
    $folderids = array_keys($folders);
    // Get the folder items
    $sql = "select fd.folder_id, fd.folder_name from {$prefix}folderdetails fd where folder_id in (" . implode(",", $folderids) . ")";
    if ($sort_type == "alpha_down") {
        $sql .= " order by fd.folder_name DESC";
    } elseif ($sort_type == "alpha_up") {
        $sql .= " order by fd.folder_name ASC";
    } elseif ($sort_type == "date_down") {
        $sql .= " order by fd.date_created DESC";
    } elseif ($sort_type == "date_up") {
        $sql .= " order by fd.date_created ASC";
    }

    $folder_items = db_query($sql, array());
    foreach ($folder_items as $row) {
        if ($row['folder_id'] == $folder_id) {
            continue;
        }
        $item = new stdClass();
        $item->id = $folders[$row['folder_id']]['id'];
        $item->xot_id = $row['folder_id'];
        $item->parent = $folders[$row['folder_id']]['parent'];
        $item->text = $row['folder_name'];
        $item->role = $role;
        $item->type = "sub_folder_shared";
        $item->xot_type = "folder";
        $item->published = false;
        $item->shared = false;
        $items[] = $item;
    }

    // Get files in the folders
    $sql = "select td.template_name as project_name, td.creator_id, otd.template_name,td.access_to_whom, td.tsugi_published, "
        . " otd.parent_template, otd.template_framework, td.template_id, tr.folder, tr.role, fd3.folder_name as creator_folder_name, count(tr2.template_id) as nrshared "
        . " from {$prefix}templatedetails td "
        . " join {$prefix}templaterights tr on td.template_id=tr.template_id and tr.folder in (" . implode(",", $folderids) . ")" //and tr.user_id=?
        . " join {$prefix}originaltemplatesdetails otd on otd.template_type_id = td.template_type_id "
        . " join {$prefix}templaterights tr3 on td.template_id=tr3.template_id and tr3.role='creator' "
        . " join {$prefix}folderdetails fd3 on tr3.folder=fd3.folder_id "
        . " left join {$prefix}templaterights tr2 on td.template_id=tr2.template_id ";
    //if ($copy_only) {
    //    $sql .= " and (tr.role = 'creator' or tr.role ='co-author') ";
    //}
    $sql .= " group by td.template_id, td.creator_id, td.template_name, td.date_created, otd.template_name,td.access_to_whom, td.tsugi_published, otd.parent_template, otd.template_framework, tr.role, tr.folder,fd3.folder_name ";
    if ($sort_type == "alpha_down") {
        $sql .= " order by td.template_name DESC";
    } elseif ($sort_type == "alpha_up") {
        $sql .= " order by td.template_name ASC";
    } elseif ($sort_type == "date_down") {
        $sql .= " order by td.date_created DESC";
    } elseif ($sort_type == "date_up") {
        $sql .= " order by td.date_created ASC";
    }
    $files = db_query($sql);



    foreach ($files as $row) {
        // Check whether shared LO is in recyclebin
        if ($row['role'] != 'creator' && $row['creator_folder_name'] == "recyclebin") {
            continue;
        }

        $item = new stdClass();
        $item->id = $folders[$row['folder']]['id'] . "_" . $row['template_id'];
        $item->xot_id = $row['template_id'];
        $item->parent = $folders[$row['folder']]['id'];
        $item->text = $row['project_name'];
        // $item->role = $role;
        if ($row["creator_id"] == $_SESSION["toolkits_logon_id"]) {
            $item->role = $row['role'];
        } else {
            $item->role = $role;
        }
        if ($copy_only) {
            if ($item->role !== 'creator' && $item->role !== 'co-author')
                continue;
        }

        $shared = "";
        if ($row['role'] != 'creator') {
            $shared = 'shared';
        }

        $item->type = ($shared == "") ? strtolower($row['parent_template']) : strtolower($row['parent_template']) . "_" . $shared;
        $item->xot_type = "file";
        $item->published = $row['access_to_whom'] != 'Private' || $row['tsugi_published'] == 1;
        $item->shared = ($row['nrshared'] > 1);
        if (!isset($xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']})) {
            $item->editor_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['parent_template']}->editor_size;
            $item->preview_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['parent_template']}->preview_size;
        }
        else {
            $item->editor_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->editor_size;
            $item->preview_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->preview_size;
        }
        $items[] = $item;
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

function get_files_in_this_folder($folder_id, $tree_id, $sort_type, $copy_only, $type = "")
{

    global $xerte_toolkits_site;

    $items = array();

    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = NULL;
    $params = NULL;

    if ($type != "group_top") {
        $query  = "select td.template_name as project_name, td.creator_id, otd.template_name,td.access_to_whom, td.tsugi_published, "
            . " otd.parent_template, otd.template_framework, td.template_id, tr.role, fd3.folder_name as creator_folder_name, count(tr2.template_id) as nrshared "
            . " from {$prefix}templatedetails td "
            . " join {$prefix}templaterights tr on td.template_id=tr.template_id and tr.folder=? " //and tr.user_id=?
            . " join {$prefix}originaltemplatesdetails otd on otd.template_type_id = td.template_type_id "
            . " join {$prefix}templaterights tr3 on td.template_id=tr3.template_id and tr3.role='creator' "
            . " join {$prefix}folderdetails fd3 on tr3.folder=fd3.folder_id "
            . " left join {$prefix}templaterights tr2 on td.template_id=tr2.template_id ";
        $params = array($folder_id);  //,$_SESSION['toolkits_logon_id']
        if ($copy_only) {
            $query .= " and (tr.role = 'creator' or tr.role ='co-author') ";
        }
    } else {
        //select templates the same way as regularly, however, now check for group_id in template_group_rights
        $query = "select td.template_name as project_name, td.creator_id, otd.template_name,td.access_to_whom, td.tsugi_published, "
            . " otd.parent_template, otd.template_framework, td.template_id, tgr.role, '' as creator_folder_name, 2 as nrshared from {$prefix}templatedetails td, "
            . " {$prefix}template_group_rights tgr, {$prefix}originaltemplatesdetails otd where td.template_id = tgr.template_id and tgr.group_id = ? "
            . " and otd.template_type_id = td.template_type_id ";
        if ($copy_only)
            $query .= " and (tgr.role = 'creator' or tgr.role ='co-author') ";
        $params = array($folder_id);
    }

    if ($type != "group_top") {
        $query .= " group by td.template_id, td.creator_id, td.template_name, td.date_created, otd.template_name,td.access_to_whom, td.tsugi_published, otd.parent_template, otd.template_framework, tr.role, tr.folder,fd3.folder_name ";
    }

    $top = false;
    $newtype = $type;
    if (str_contains($type, "_top")) {
        $top = true;
        $newtype = str_replace("_top", "", $type);
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
        if ($row['role'] != 'creator' && $row['creator_folder_name'] == "recyclebin") {
            continue;
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
        //$item->role = $row['role'];
        if($row["creator_id"] == $_SESSION["toolkits_logon_id"]){
            $item->role = $row['role'];
        }else{
            $item->role = "non-creator";
        }

        $shared = "";
        if ($row['role'] != 'creator' && $newtype != 'group') {
            $shared = 'shared';
        }


        $item->type = ($shared == "") ? strtolower($row['parent_template']) : strtolower($row['parent_template']) . "_" . $shared;
        $item->xot_type = "file";

        $item->published = $row['access_to_whom'] != 'Private' || $row['tsugi_published'] == 1;
        $item->shared = $row['nrshared'] > 1;
        if (!isset($xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']})) {
            $item->editor_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['parent_template']}->editor_size;
            $item->preview_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['parent_template']}->preview_size;
        }
        else {
            $item->editor_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->editor_size;
            $item->preview_size = $xerte_toolkits_site->learning_objects->{$row['template_framework'] . "_" . $row['template_name']}->preview_size;
        }

        $items[] = $item;
    }
    return $items;
}


/**
 * Builds an array with the whole structure of the folder suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 * @param $folder_id
 * @param $sort_type
 */
function get_folder_contents($folder_id, $tree_id, $sort_type, $copy_only, $type = "") {
    $folders = get_folders_in_this_folder($folder_id, $tree_id, $sort_type, $copy_only, $type);
    $files = get_files_in_this_folder($folder_id, $tree_id, $sort_type, $copy_only, $type);

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
 * Builds an array with the whole structure of the folder suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 * @param $folder_id
 * @param $sort_type
 */
function get_shared_folder_contents_deprecated($folder_id, $tree_id, $sort_type, $copy_only, $type = "") {
    $folders = get_folders_of_shared_folder($folder_id, $tree_id, $sort_type, $copy_only, $type);
    $files = get_files_in_this_folders($folders, $tree_id, $sort_type, $copy_only, $type);
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
 * Builds an array with the whole structure of the folder suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 * @param $folder_id
 * @param $sort_type
 */
function get_workspace_contents($folder_id, $tree_id, $sort_type, $copy_only=false, $type="") {

    global $xerte_toolkits_site;

    $items = array();
    $folders = get_workspace_folders($folder_id, $tree_id, $sort_type, $copy_only, $type);
    $templates = get_workspace_templates($folder_id, $tree_id, $sort_type, $copy_only, $type);

    $top = false;
    $newtype = $type;
    if (str_contains($type, "_top")){
        $top = true;
        $newtype = str_replace("_top", "", $type);
    }

    foreach($folders as $folder)
    {
        $item = new stdClass();
        $item->id = $folder['tree_id'];
        $item->xot_id = $folder['folder_id'];
        $item->parent = $folder['tree_parent_id'];
        $item->text = $folder['folder_name'];
        if(isset($folder['nrshared']) &&  $folder['nrshared'] > 1){
            $folder['type'] = "folder_shared";
            $item->type = $folder['type'];
        }else{
            $item->type = $folder['type'];
        }
        $item->xot_type = "folder";
        $item->published = false;
        $item->shared = false;
        $item->role = $folder['role'];

        $items[] = $item;

        if ($folder['type'] == 'folder_shared' || $folder['type'] == 'sub_folder_shared')
        {
            $files = get_shared_folder_contents($folder['folder_id'], $folder['role'], $folder['tree_id'], $sort_type, $copy_only);
            //$files = get_folder_contents($folder['folder_id'], $folder['tree_id'],$sort_type, $copy_only);
            if ($files)
            {
                foreach ($files as $index => $file){
                    $found = false;
                    foreach ($folders as $folderCheck){
                        if($file->id == $folderCheck['tree_id']){
                            $found = true;
                        }
                    }

                    if(!$found){
                        if(isset($folder['nrshared']) && $folder['nrshared'] > 1 && $files[$index]->type == "folder"){
                             $files[$index]->type = "sub_folder_shared";
                             $files[$index]->role = $folder['role'];
                        }
                        array_push($items, $file);
                    }
                }
            }
        }
        else {
            $foldertemplates = array_filter($templates, function ($template) use ($item) {
                return $template['folder'] == $item->xot_id;
            });
            foreach ($foldertemplates as $template) {
                // Check whether shared LO is in recyclebin
                if ($template['role'] != 'creator' && $template['creator_folder_name'] == "recyclebin") {
                    continue;
                }

                $titem = new stdClass();
                $titem->id = $folder['tree_id'] . "_" . $template['template_id'];
                $titem->xot_id = $template['template_id'];
                $titem->parent = $folder['tree_id'];
                $titem->text = $template['project_name'];
                $titem->role = $template['role'];
                if ($newtype == "")
                    $titem->type = strtolower($template['parent_template']);
                else
                    $titem->type = strtolower($template['parent_template'] . "_group");
                $titem->xot_type = "file";
                $titem->published = $template['access_to_whom'] != 'Private' || $template['tsugi_published'] == 1;
                $titem->shared = $template['nrshared'] > 1;
                if (!isset($xerte_toolkits_site->learning_objects->{$template['template_framework'] . "_" . $template['template_name']})) {
                    $titem->editor_size = $xerte_toolkits_site->learning_objects->{$template['template_framework'] . "_" . $template['parent_template']}->editor_size;
                    $titem->preview_size = $xerte_toolkits_site->learning_objects->{$template['template_framework'] . "_" . $template['parent_template']}->preview_size;
                }
                else {
                    $titem->editor_size = $xerte_toolkits_site->learning_objects->{$template['template_framework'] . "_" . $template['template_name']}->editor_size;
                    $titem->preview_size = $xerte_toolkits_site->learning_objects->{$template['template_framework'] . "_" . $template['template_name']}->preview_size;
                }

                $items[] = $titem;
            }
        }
    }


    // And now the items of the workspace itself
    $foldertemplates = array_filter($templates, function($template) use ($folder_id){
        return $template['folder'] == $folder_id;
    });
    foreach($foldertemplates as $template)
    {
        // Check whether shared LO is in recyclebin
        if ($template['role'] != 'creator' && $template['creator_folder_name'] == "recyclebin") {
            continue;
        }

        $titem = new stdClass();
        $titem->id = $tree_id . "_" . $template['template_id'];
        $titem->xot_id = $template['template_id'];
        $titem->parent = $tree_id;
        $titem->text = $template['project_name'];
        $titem->role = $template['role'];
        if ($newtype == "")
            $titem->type = strtolower($template['parent_template']);
        else
            $titem->type = strtolower($template['parent_template'] . "_group");
        $titem->xot_type = "file";
        $titem->published = $template['access_to_whom'] != 'Private' || $template['tsugi_published'] == 1;
        if (isset($template['nrshared']))
        {
            $titem->shared = $template['nrshared'] > 1;
        }
        else
        {
            $titem->shared = false;
        }
        if (isset($xerte_toolkits_site->learning_objects->{$template['template_framework'] . "_" . $template['template_name']}->editor_size)) {
			$titem->editor_size = $xerte_toolkits_site->learning_objects->{$template['template_framework'] . "_" . $template['template_name']}->editor_size;
		}
		else
		{
            $titem->editor_size = $xerte_toolkits_site->learning_objects->{$template['template_framework'] . "_" . $template['parent_template']}->editor_size;
		}
		if (isset($xerte_toolkits_site->learning_objects->{$template['template_framework'] . "_" . $template['template_name']}->preview_size)) {
			$titem->preview_size = $xerte_toolkits_site->learning_objects->{$template['template_framework'] . "_" . $template['template_name']}->preview_size;
		}
		else
		{
            $titem->preview_size = $xerte_toolkits_site->learning_objects->{$template['template_framework'] . "_" . $template['parent_template']}->preview_size;
		}
        $items[] = $titem;
    }

    //remove double items


    $uniqueItems = array();
    foreach ($items as $item => $value){
        /*if(!in_array($value, $uniqueItems)){
            $uniqueItems[$item] = $value;
        }*/
        $counter = 0;
        if(count($uniqueItems) > 0){
            foreach ($uniqueItems as $uniqueItem){
                if($value->id != $uniqueItem->id){
                    $counter++;
                }else{
                    break;
                }
            }

            if(count($uniqueItems) == $counter){
                $uniqueItems[$item] = $value;
            }
        }else{
            $uniqueItems[$item] = $value;
        }
    }

    return $uniqueItems;
}

/**
 * Builds an array with the folders only of the folder suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 * @param $folder_id
 * @param $sort_type
 * @param int $group_id if we are looking a group not a folder
 */
function get_workspace_folders($folder_id, $tree_id, $sort_type, $copy_only=false, $type = ""){

    /*
    * use the global level for folder indenting
    */
    global $xerte_toolkits_site;

    $items = array();
    /*
    * select the folders in this folder
    */

    $prefix = $xerte_toolkits_site->database_table_prefix;

    //if ($type == "") {
    //    $query = "select folder_id, folder_name, folder_parent from {$prefix}folderdetails where login_id = ? and folder_parent != 0";
    //    $params = array($_SESSION['toolkits_logon_id']);
    //}
    if ($type == "group_top") {
        $query = "select fd.folder_id, fd.folder_name, fd.folder_parent, fgr.role, from {$prefix}folderdetails fd, {$prefix}folder_group_rights fgr "
            . " where fd.folder_id = fgr.folder_id AND fgr.group_id = ?";
        $params = array($folder_id);
    }else{
        $query = "select fd.folder_id, fd.folder_name, fr.folder_parent, fr.role, cfr.nrshared as nrshared from {$prefix}folderdetails fd, {$prefix}folderrights fr cross join (
select fr.folder_id, count(fr.folder_id) as nrshared  from {$prefix}folderdetails fd, {$prefix}folderrights fr  where fr.folder_id = fd.folder_id  and fr.folder_parent != 0 and fr.folder_id in 
                    (
                        select fd.folder_id from {$prefix}folderdetails fd, {$prefix}folderrights fr where fr.folder_id = fd.folder_id AND fr.login_id=? and fr.folder_parent != 0
                    )  GROUP BY  fr.folder_id
) as cfr  where fr.folder_id = fd.folder_id and fr.folder_id = cfr.folder_id AND fr.login_id=? and fr.folder_parent != 0 
";
        $params = array($_SESSION['toolkits_logon_id'], $_SESSION['toolkits_logon_id']);
    }

    $top = false;
    $newtype = $type;
    if (str_contains($type, "_top")){
        $top = true;
        $newtype = str_replace("_top", "", $type);
    }

    /*
    * Add some more to the query to sort the files
    */

    if ($sort_type == "alpha_down") {
        $query .= " order by fd.folder_name DESC";
    } elseif ($sort_type == "alpha_up") {
        $query .= " order by fd.folder_name ASC";
    } elseif ($sort_type == "date_down") {
        $query .= " order by fd.date_created DESC";
    } elseif ($sort_type == "date_up") {
        $query .= " order by fd.date_created ASC";
    }

    $query_response = db_query($query, $params);

    /*
    * recurse through the folders
    */

    //checking if folder is shared with a group
    $query_group = "SELECT * FROM {$prefix}folder_group_rights";
    $params = array();
    foreach ($query_response as $index => $folder){
        if($index != 0){
            $query_group .= " or folder_id = ?";
        }else{
            $query_group .= " where folder_id = ?";
        }
        array_push($params, $folder["folder_id"]);
    }



    $shared_groups = db_query($query_group, $params);
    if(count($shared_groups) > 0){
        foreach ($shared_groups as $shared){
            foreach ($query_response as $index => $folder){
                if($shared["folder_id"] == $folder["folder_id"]){
                    $query_response[$index]["nrshared"] = intval($query_response[$index]["nrshared"]) + 1;
                }
            }
        }
    }

    // Get all sub-folders of shared folders
    /*
    $subfolders = array();
    foreach($query_response as $folder) {

        if ($folder['nrshared'] > 1 && $folder['role'] !== 'creator') {
            $folders = get_subfolders_of_shared_folder($folder['folder_id'], $folder['role'], $sort_type);

            if ($folders) {
                $subfolders = array_merge($subfolders, $folders);
            }
        }
    }
    // Only add folders that have not been found yet (these are probably shared by their own)
    foreach($subfolders as $folder)
    {
        $found = false;
        foreach($query_response as $index=>$row)
        {
            if ($row['folder_id'] == $folder['folder_id'])
            {
                $found = true;
                break;
            }
        }
        if (!$found)
        {
            $query_response[] = $folder;
        }
    }
    */


    // Build tree
    // Loop until all the tree_id's have a value
    // Nr of loops equals the depths of the tree
    // First loop (with parent = 0);
    $nextlevel = array();
    $unassigned_found = false;
    $recyclebin = get_recycle_bin();
    $recyclebin_tree_id = "ID_" . $_SESSION['toolkits_logon_id'] . "_F" . $recyclebin;
    foreach($query_response as $index=>$row)
    {
        if ($row['folder_parent'] == $folder_id)
        {
            $query_response[$index]['tree_id'] = $tree_id . '_F' . $row['folder_id'];
            $query_response[$index]['tree_parent_id'] = $tree_id;
            $nextlevel[$row['folder_id']] = $query_response[$index]['tree_id']; // Watch out. do not use $row, it's not filled 2 lines up
        }
        else if ($row['folder_parent'] == $recyclebin)
        {
            $query_response[$index]['tree_id'] = $recyclebin_tree_id . '_F' . $row['folder_id'];
            $query_response[$index]['tree_parent_id'] = $recyclebin_tree_id;
            $nextlevel[$row['folder_id']] = $query_response[$index]['tree_id']; // Watch out. do not use $row, it's not filled 2 lines up
        }
        else
        {
            $unassigned_found = true;
        }
        if (!isset($query_response[$index]['type'])) {
            $shared = "";
            if ($query_response[$index]['role'] != 'creator' && $newtype != 'group') {
                $shared = 'shared';
            }
            $query_response[$index]['type'] = ($shared == "") ? "folder" : "folder_" . $shared;
        }
    }

    $max_depth = 50;
    $level = 0;
    while ($unassigned_found && $level < $max_depth)
    {
        $currlevel = $nextlevel;
        $nextlevel = array();
        $unassigned_found = false;
        foreach($query_response as $index=>$row)
        {
            if (isset($currlevel[$row['folder_parent']]))
            {
                $query_response[$index]['tree_id']  = $currlevel[$row['folder_parent']] . '_F' . $row['folder_id'];
                $query_response[$index]['tree_parent_id'] = $currlevel[$row['folder_parent']];
                if (!isset($query_response[$index]['type'])) {
                    $shared = "";

                    if ($query_response[$index]['role'] != 'creator' && $newtype != 'group') {
                        $shared = 'shared';
                    }
                    $query_response[$index]['type'] = ($shared == "") ? "folder" : "folder_" . $shared;
                }
                $nextlevel[$row['folder_id']] = $query_response[$index]['tree_id'];
            }
            else{
                if (!isset($row['tree_id']))
                {
                    $unassigned_found = true;
                }
            }
        }
        $level++;
    }

    if ($unassigned_found)
    {
        // Something went wrong here, parent is not found even at depth level $max_depth
        // Log to error log
        $incomplete_rows = array();
        foreach($query_response as $index=>$row)
        {
            if (!isset($row['tree_id']) && $query_response[$index]['role'] == 'creator')
            {
                $incomplete_rows[] = $row;
            }
        }
        $error_msg = "Incomplete rows in folder tree. Depth level: $max_depth. Rows: " . print_r($incomplete_rows, true);
        error_log("Error in get_workspace_folders: " . $error_msg);
        _debug("Error in get_workspace_folders: " . $error_msg);
    }


    $sharedFolders = array();
    foreach ($query_response as $index => $folder){
        if(isset($folder['nrshared']) && intval($folder['nrshared']) > 1){
            array_push($sharedFolders, $folder["folder_id"]);
            $query_response[$index]['type'] = 'folder_shared';
        }
    }

    /*
    if(count($sharedFolders) > 0){
        for($j = 0; $j < count($sharedFolders); $j++){
            for($i = 0; $i < count($query_response); $i++){
                if($sharedFolders[$j] == $query_response[$i]["folder_parent"] && $query_response[$i]['type'] != 'sub_folder_shared'){
                    array_push($sharedFolders, $query_response[$i]["folder_id"]);
                    $query_response[$i]['type'] = 'sub_folder_shared';
                }
            }
        }
    }
  */


    /*$query = "SELECT * FROM folderdetails where";
    $params = array();
    foreach ($query_response as $folder){

        if(intval($folder['nrshared']) > 1){
            if(count($params) == 0){
                $query.= " folder_id = ?";
            }else{
                $query .= " or folder_id = ?";
            }
            array_push($params, $folder['real_parent']);
        }
    }
    if(count($params) > 0){
        $query_shared_sub_folder = db_query($query, $params);

        foreach ($query_response as $index =>$folder){
            foreach ($query_shared_sub_folder as $sharedSubFolder){
                if($folder['real_parent'] ==  $sharedSubFolder['folder_id']){
                    $query_response[$index]['type'] = 'sub_folder_shared';
                }
            }
        }
    }*/


    return $query_response;
}


/**
 * Builds an array with the files only of the folder suitable for jsTree
 * Called by an AJAX function, that returns the array as a alternative JSON file for jstree
 * @param $folder_id
 * @param $sort_type
 * @param int $group_id if we are looking for files in a group not folder.
 */

function get_workspace_templates($folder_id, $tree_id, $sort_type, $copy_only=false, $type = "")
{

    global $xerte_toolkits_site;

    $items = array();

    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = NULL;
    $params = NULL;
    if ($type != "group_top") {
        $query = "select td.template_name as project_name, otd.template_name,td.access_to_whom, td.tsugi_published, "
            . " otd.parent_template, otd.template_framework, td.template_id, tr.role, count(tr2.template_id) as nrshared from {$prefix}templatedetails td, "
            . " {$prefix}templaterights tr, {$prefix}originaltemplatesdetails otd left join {$prefix}templaterights tr2 on tr.template_id=tr2.template_id "
            . " where td.template_id = tr.template_id and tr.user_id = ? "
            . " and tr.folder= ? and  otd.template_type_id = td.template_type_id ";
        $query  = "select td.template_name as project_name, otd.template_name,td.access_to_whom, td.tsugi_published, "
            . " otd.parent_template, otd.template_framework, td.template_id, tr.role, tr.folder, fd3.folder_name as creator_folder_name, count(tr2.template_id) as nrshared "
            . " from {$prefix}templatedetails td "
            . " join {$prefix}templaterights tr on td.template_id=tr.template_id and tr.user_id=? "
            . " join {$prefix}originaltemplatesdetails otd on otd.template_type_id = td.template_type_id "
            . " join {$prefix}templaterights tr3 on td.template_id=tr3.template_id and tr3.role='creator' "
            . " join {$prefix}folderdetails fd3 on tr3.folder=fd3.folder_id "
            . " left join {$prefix}templaterights tr2 on td.template_id=tr2.template_id ";
        $params = array($_SESSION['toolkits_logon_id']);
    } else {
        //select templates the same way as regularly, however, now check for group_id in template_group_rights
        $query = "select td.template_name as project_name, otd.template_name,td.access_to_whom, td.tsugi_published, "
           . " otd.parent_template, otd.template_framework, td.template_id, tgr.role, 2 as nrshared from {$prefix}templatedetails td, "
            . " {$prefix}template_group_rights tgr, {$prefix}originaltemplatesdetails otd where td.template_id = tgr.template_id and tgr.group_id = ? "
            . " and otd.template_type_id = td.template_type_id ";
        $params = array($type);
    }

    if ($copy_only) {
        $query .= " and (tr.role = 'creator' or tr.role ='co-author') ";
    }

    if ($type != "group_top") {
        $query .= " group by td.template_id, td.template_name, td.date_created, otd.template_name,td.access_to_whom, td.tsugi_published, otd.parent_template, otd.template_framework, tr.role, tr.folder,fd3.folder_name ";
    }

    if ($sort_type == "alpha_down") {
        $query .= "order by tr.folder ASC, td.template_name DESC";
    } elseif ($sort_type == "alpha_up") {
        $query .= "order by tr.folder ASC, td.template_name ASC";
    } elseif ($sort_type == "date_down") {
        $query .= "order by tr.folder ASC, td.date_created DESC";
    } elseif ($sort_type == "date_up") {
        $query .= "order by tr.folder ASC, td.date_created ASC";
    }

    $query_response = db_query($query, $params);

    return $query_response;
}


function insert_groupitems_into_workspace_items($workspace_items, $group_items){
    // Get ID of root folder
    $root_id = $workspace_items[0]->id;

    // Create a new array and start copying $workspace_itmes until we find the first item with xot_type file and parent = $root_id
    $new_workspace_items = array();
    $i = 0;
    while ($i < count($workspace_items) && ($workspace_items[$i]->xot_type != 'file' || $workspace_items[$i]->parent != $root_id)) {
        $new_workspace_items[] = $workspace_items[$i];
        $i++;
    }
    // Copy in all the group_items
    foreach ($group_items as $group_item) {
        $new_workspace_items[] = $group_item;
    }
    // Copy in the rest of the workspace_items
    while ($i < count($workspace_items)) {
        $new_workspace_items[] = $workspace_items[$i];
        $i++;
    }
    return $new_workspace_items;
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
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $root_folder = get_user_root_folder();

    $workspace = new stdClass();
    $workspace->user = $_SESSION['toolkits_logon_id'];
    $workspace->items = array();

    /**
     * We've two toplevel icons
     * - Workspace
     * - Recyclebin
     *
     */

    $workspace->workspace_id = "ID_" . $_SESSION['toolkits_logon_id'] . "_F" . $root_folder;
    $item = new stdClass();
    $item->id = $workspace->workspace_id;
    $item->xot_id = get_user_root_folder();
    $item->parent = "#";
    $item->text = DISPLAY_WORKSPACE;
    $item->type = "workspace";
    $item->role = "creator";
    $item->xot_type = "workspace";
    $item->published = false;
    $item->shared = false;
    $state = new stdClass();
    $state->opened = true;
    $state->disabled = false;
    $state->selected = true;
    $item->state = $state;

    //workspace content (this includes shared content, group content is handled seperately
    $workspace->items[] = $item;
    $workspace->nodes[$item->id] = $item;
    $items = get_workspace_contents($item->xot_id, $item->id, $sort_type, $copy_only,"_top");
    $sharedItems = array();
    if ($items) {
        $workspace->items = array_merge($workspace->items, $items);
        foreach($items as $item)
        {
            if(count($sharedItems)>0){
                foreach ($sharedItems as $shared){
                    if($item->parent == $shared){
                        $item->ChildOfShared = true;
                        array_push($sharedItems, $item->id);
                        $workspace->nodes[$item->id] = $item;
                    }else{
                        $workspace->nodes[$item->id] = $item;
                    }
                }
            }else{
                if($item->type == "folder_shared" || $item->type == "sub_folder_shared"){
                    array_push($sharedItems, $item->id);
                }
                $workspace->nodes[$item->id] = $item;
            }

        }
    }

    //group shared content
    //check to which groups the user belongs
    $query = "SELECT * FROM {$prefix}user_group_members ugm, {$prefix}user_groups ug WHERE ugm.login_id = ?".
        " AND ugm.group_id = ug.group_id ";
    if ($sort_type == "alpha_down") {
        $query .= "order by ug.group_name DESC";
    } elseif ($sort_type == "alpha_up") {
        $query .= "order by ug.group_name ASC";
    }

    $groups = db_query($query, array($_SESSION['toolkits_logon_id']));
    $workspace->groups = array();
    $counter = 0;
    $group_items = array();

    foreach ($groups as $group){
        $workspace->groups[$counter] = "ID_" . $_SESSION['toolkits_logon_id'] . "_G" . $group['group_id'];
        $item = new stdClass();
        $item->id = $workspace->groups[$counter];
        $item->xot_id = $group['group_id'];
        $item->parent = $workspace->workspace_id;
        $item->text = $group['group_name'];
        $item->type = "group";
        $item->xot_type = "group";

        $group_items[] = $item;
        $workspace->nodes[$item->id] = $item;
        $items = get_group_contents($item->xot_id, $item->id, $sort_type, $copy_only);
        if ($items) {

            $group_items = array_merge($group_items, $items);

            foreach($items as $item)
            {
                $workspace->nodes[$item->id] = $item;
            }
        }

        $counter++;
    }

    // Now insert the group items into the workspace items after the normal folders
    $workspace->items = insert_groupitems_into_workspace_items($workspace->items, $group_items);

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
    $sharedtemplates = array();
    $rows = db_query($query_for_blank_templates, array());
    foreach($rows as $row)
    {
        $templates[] = strtolower($row['parent_template']);
        $grouptemplates[] = strtolower($row['parent_template']) . "_group";
        $sharedtemplates[] = strtolower($row['parent_template']) . "_shared";
    }
    $workspace->templates = $templates;
    $workspace->grouptemplates = $grouptemplates;
    $workspace->sharedtemplates = $sharedtemplates;


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

              echo "</p><a href=\"javascript:example_window('" . $template['display_id'] . "')\">" . DISPLAY_EXAMPLE . "<span class='sr-only'> - " . $template['display_name'] . "</span></a> | ";

          } else {

              echo "</p>";

          }

          ?>
          <button id="<?php echo $template['template_name'] ?>_button" type="button" class="xerte_button_c_no_width"
                  onclick="javascript:template_toggle('<?php echo $template['template_name'] ?>')">
              <i class="fa fa-plus xerte-icon"></i><?php echo DISPLAY_CREATE; ?><span class="sr-only"> <?php echo $template['display_name']; ?></span>
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
					  <label for="<?php echo $template['template_name']; ?>_templatename" class="sr-only"><?php echo DISPLAY_TEMPLATE; ?></label>
                      <select id="<?php echo $template['template_name']; ?>_templatename" name="templatename"
                              class="select_template" onchange="javascript:setup_example('<?php echo $template["template_name"]; ?>_templatename')">

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
				  <label for="<?php echo $template['template_name']; ?>_filename" class="sr-only"><?php echo DISPLAY_PROJECT_NAME; ?></label>
                  <input type="text" width="200" id="<?php echo $template['template_name']; ?>_filename"
                         name="filename"/>
                  <p>
                      <button type="submit" class="xerte_button_c">
						<i class="fa fa-circle-plus xerte-icon"></i><?php echo DISPLAY_CREATE; ?><span class="sr-only"> <?php echo $template['display_name']; ?></span>
					  </button>
                  </p>
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

    global $xerte_toolkits_site;
    _load_language_file("/index.inc");

?>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
    <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v4-shims.min.css">
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v5-font-face.min.css">
</head>
<body class="lockFileContent">
<header class='topbar'>
    <div>
        <img src='website_code/images/logo.png' style='margin-left:10px; float:left' />
        <img src='website_code/images/apereoLogo.png' style='margin-right:10px; float:right' />
    </div>
</header>
<main>
    <div>
<?php
    // get username only
    $temp = explode(" ", $lock_file_creator);
    $lock_file_creator_username = $temp[0];
    if ($lock_file_creator_username == $_SESSION['toolkits_logon_username']) {
        // replace username with "you" text and remove brackets from the date/time
        $user = str_replace($lock_file_creator_username,  DISPLAY_LOCKFILE_YOU . '! ' . DISPLAY_LOCKFILE_TIME, $lock_file_creator);
        $user = preg_replace('/\(([^()]*)\)(?!.*\([^()]*\))/','$1',$user,1);
        echo "<p>" . DISPLAY_EDITED . $user . ".</p><p>" . DISPLAY_LOCKFILE_YOU_MESSAGE . "</p>";
    }
    else {
        $user = str_replace($lock_file_creator_username,  $lock_file_creator_username . '. ' . DISPLAY_LOCKFILE_TIME, $lock_file_creator);
        $user = preg_replace('/\(([^()]*)\)(?!.*\([^()]*\))/','$1',$user,1);
        echo "<p>" . DISPLAY_EDITED . $user . ".</p><p>" . DISPLAY_LOCKFILE_MESSAGE . "</p>";
    }
    echo "<form action=\"\" method=\"POST\"><input type=\"hidden\" value=\"delete_lockfile\" name=\"lockfile_clear\" /><input class=\"xerte_button\" type=\"submit\" value=\"" . DISPLAY_LOCKFILE_DELETE . "\" /></form>";
?>
    </div>
</main>
<footer>
    <div>
        <p class="copyright">
            <?php echo $xerte_toolkits_site->copyright; ?> <i class="fa fa-info-circle" aria-hidden="true" style="color:#f86718; cursor: help;" title="<?PHP $vtext = "version.txt";$lines = file($vtext);echo $lines[0];?>"></i>
        </p>
        <div class="footerlogos">
            <a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" title="Xerte accessibility statement https://xot.xerte.org.uk/play.php?template_id=214"><img src="website_code/images/wcag2.2AA-blue.png" alt="<?php echo INDEX_WCAG_LOGO_ALT; ?>"></a><a href="https://opensource.org/" target="_blank" title="Open Source Initiative: https://opensource.org/"><img src="website_code/images/osiFooterLogo.png" alt="<?php echo INDEX_OSI_LOGO_ALT; ?>"></a><a href="https://www.apereo.org" target="_blank" title="Apereo: https://www.apereo.org"><img src="website_code/images/apereoFooterLogo.png" border="0" alt="<?php echo INDEX_APEREO_LOGO_ALT; ?>"></a><a href="https://xerte.org.uk" target="_blank" title="Xerte: https://xerte.org.uk"><img src="website_code/images/xerteFooterLogo.png" alt="<?php echo INDEX_XERTE_LOGO_ALT; ?>"></a>
        </div>
    </div>
</footer>
</body>
</html>
<?php
}
