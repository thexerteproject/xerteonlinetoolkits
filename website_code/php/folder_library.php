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
require_once('file_library.php');
require_once('user_library.php');
require_once('folder_status.php');

_load_language_file("/website_code/php/folder_library.inc");

/**
 * 
 * Function make new folder
 * This function is used to send an error email meesage
 * @param string $folder_id = id for the new folder
 * @param string $folder_name = Name of the new folder
 * @version 1.0
 * @author Patrick Lockley
 */


function make_new_folder($folder_id,$folder_name){

    global $xerte_toolkits_site;

    $mysql_id = database_connect("New folder database connect success","New folder database connect failed");

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    if($folder_id=="file_area"){
        $folder_id = get_user_root_folder();
    }
    $query = "INSERT INTO {$prefix}folderdetails (login_id,folder_parent,folder_name,date_created) values  (?,?,?,?)";
    $params = array($_SESSION['toolkits_logon_id'], $folder_id, $folder_name, date('Y-m-d H:i:s'));


    $new_folder_id = db_query($query, $params);
    $ok = false;
    if ($new_folder_id !== false){
        $query = "INSERT INTO {$prefix}folderrights (folder_id, login_id, folder_parent, role) values (?,?,?,?)";
        $params = array($new_folder_id, $_SESSION['toolkits_logon_id'], $folder_id, "creator");
        $ok = db_query($query, $params);
    }

    if($ok !== false) {


        receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder creation succeeded for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);

        echo FOLDER_LIBRARY_CREATE;

    }else{

        receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder creation failed for " . $_SESSION['toolkits_logon_username'], "Folder creation failed for " . $_SESSION['toolkits_logon_username']);

        echo FOLDER_LIBRARY_FAIL;

    }



}

/**
 * 
 * Function delete folder
 * This function is used to send an error email meesage
 * @param string $folder_id = id for the new folder
 * @param string $folder_name = Name of the new folder
 * @version 1.0
 * @author Patrick Lockley
 */

function delete_folder($folder_id){

    global $xerte_toolkits_site;

    $database_id = database_connect("Delete folder database connect success","Delete folder database connect failed");

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $query_to_delete_folder = "delete from {$prefix}folderdetails where folder_id=?";
    $params = array($folder_id); 

    //echo $query_to_delete_folder;

    $ok = db_query($query_to_delete_folder, $params);
    if($ok !== false) {
        receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder " . $folder_id . " deleted for " . $_SESSION['toolkits_logon_username'], "Folder deletion succeeded for " . $_SESSION['toolkits_logon_username']);
    }else{
        receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder " . $folder_id . " not deleted for " . $_SESSION['toolkits_logon_username'], "Folder deletion falied for " . $_SESSION['toolkits_logon_username']);
    }

}


/**
 * 
 * Function move file
 * This function is used to move files and folders
 * @param array $files_to_move = an array of files and folders to move
 * @param string $destination = Name of the new folder
 * @version 1.0
 * @author Patrick Lockley
 */

function move_file($template_id,$destination)
{

    global $xerte_toolkits_site;

    $mysql_id = database_connect("Move file database connect success", "Move file database connect failure");


    if (($destination != "")) {


        /*
         * Move files in the database
         */

        $prefix = $xerte_toolkits_site->database_table_prefix;

        $query_file = "UPDATE {$prefix}templaterights SET folder = ? WHERE template_id = ?  AND user_id = ?";
        $params = array($destination, $template_id, $_SESSION['toolkits_logon_id']);

        $ok = db_query($query_file, $params);

        if ($ok !== false) {
            if ($ok != 1)
            {
                // Not updated, so this is probably a project in a shared folder not owned by you
                // Check if the project has a shared folder that is the same as the destination folder
                $ancestor = get_shared_ancestor($template_id);
                if ($ancestor !== false && $ancestor === get_shared_folder_ancestor($destination))
                {
                    // The project is in a shared folder, and the destination is the same shared folder
                    // So we may update the project
                    $query_file = "UPDATE {$prefix}templaterights SET folder = ? WHERE template_id = ?  AND role = 'creator'";
                    $params = array($destination, $template_id);
                    $ok = db_query($query_file, $params);
                }
                else
                {
                    echo MOVE_FILE_FAILED_NOT_OWNER;
                }
            }
            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $template_id . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "Template " . $template_id . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username']);
        } else {
            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $template_id . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "File " . $$template_id . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username']);
        }
    }
}

function move_folder($folder_id,$destination)
{

    global $xerte_toolkits_site;

    $mysql_id = database_connect("Move file database connect success", "Move file database connect failure");


    if (($destination != "")) {


        /*
         * Move folder in database
         */

        $prefix = $xerte_toolkits_site->database_table_prefix;

        $query_folder = "UPDATE {$prefix}folderdetails SET folder_parent = ? WHERE (folder_id = ?  )";
        $params = array($destination, $folder_id);

        $ok = db_query($query_folder, $params);

        $query_folder = "UPDATE {$prefix}folderrights SET folder_parent = ? WHERE (folder_id = ?  )";
        $params = array($destination, $folder_id);

        $ok = $ok && db_query($query_folder, $params);

        if ($ok) {
            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder " . $folder_id . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "File " . $new_files_array[$x] . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username']);
        } else {
            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $folder_id . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "Folder " . $new_files_array[$x] . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username']);
        }

    }
}

/* already in folder status:
function has_rights_to_this_folder($folder_id, $user_id){
    global $xerte_toolkits_site;
    $query = "select * from {$xerte_toolkits_site->database_table_prefix}folderdetails where login_id=? AND folder_id = ?";
    $result = db_query_one($query, array($user_id, $folder_id));

    if(!empty($result)) {
        return true;
    }
    return false;
}
*/

function get_all_subfolders_of_folder_for_user($folder_id, $user_id){
    global $xerte_toolkits_site;
    $query = "select * from {$xerte_toolkits_site->database_table_prefix}folderrights where folder_parent = ? AND login_id=? ";
    $result = db_query($query, array($folder_id, $user_id));

    $folders = array();
    foreach($result as $row) {
        $folders[] = $row['folder_id'];
        $folders = array_merge($folders, get_all_subfolders_of_folder_for_user($row['folder_id'], $user_id));
    }
    return $folders;
}

function get_folder_creator($folder)
{
    global $xerte_toolkits_site;
    $sql = "select login_id from {$xerte_toolkits_site->database_table_prefix}folderrights where folder_id=? and role='creator'";
    $params = array($folder);
    $row = db_query_one($sql, $params);
    if (!empty($row)) {
        return $row['login_id'];
    }

    return null;
}

function get_all_templates_of_user_in_folder($folder_id, $user_id){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    // Get creator of folder
    $creator = get_folder_creator($folder_id);

    $checkParams = array($user_id);
    $foldersToCheck = get_all_subfolders_of_folder_for_user($folder_id, $creator);

    $query_to_check_folder = "SELECT template_id from {$prefix}templaterights where user_id = ? and role = 'creator' and folder in (";
    $first = true;
    foreach ($foldersToCheck as $folder) {
        if (!$first) {
            $query_to_check_folder .= ", ";
        }
        $first = false;
        $query_to_check_folder .= "?";
        array_push($checkParams, $folder);
    }

    $query_to_check_folder .= ")";

    $result = db_query($query_to_check_folder, $checkParams);

    $templates = array();
    foreach($result as $row) {
        $templates[] = $row['template_id'];
    }
    return $templates;
}

function get_all_templates_of_users_in_folder($folder_id, $user_ids){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    // Get creator of folder
    $creator = get_folder_creator($folder_id);

    $checkParams = array($user_ids);
    $foldersToCheck = get_all_subfolders_of_folder_for_user($folder_id, $creator);

    $questionmarks = str_repeat("?,", count($user_ids) - 1) . "?";

    $query_to_check_folder = "SELECT template_id, user_id from {$prefix}templaterights where user_id in {$questionmarks} and role = 'creator' and folder in (";
    $first = true;
    foreach ($foldersToCheck as $folder) {
        if (!$first) {
            $query_to_check_folder .= ", ";
        }
        $first = false;
        $query_to_check_folder .= "?";
        array_push($checkParams, $folder);
    }

    $query_to_check_folder .= ")";

    $result = db_query($query_to_check_folder, $checkParams);

    return $result;
}

function get_all_folders_shared_with_group($group)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $sql = "select fd.* from {$prefix}folderdetails fd, {$prefix}folder_group_rights fgr where group_id=? and role != 'creator' and fd.folder_id=fgr.folder_id";
    $params = array($group);

    $rows = db_query($sql, $params);

    return $rows;
}

//this functions directly removes a directory and all its children. Use with care.
function rrmdir($src) {
    if ($src != "") {
        $dir = opendir($src);
        while (false !== ($file = readdir($dir))) {
            if (($file != '.') && ($file != '..')) {
                $full = $src . '/' . $file;
                if (is_dir($full)) {
                    rrmdir($full);
                } else {
                    unlink($full);
                }
            }
        }
        closedir($dir);
        rmdir($src);
    }
}

function deleteZip($dir, $templateName)
{
    $files = glob($dir . '*');

    foreach($files as $file)
    {
        if(strpos($file, $templateName . ".zip") !== false)
        {
            unlink($file);
        }
    }
}