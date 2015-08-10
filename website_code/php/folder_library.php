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
include 'file_library.php';
include 'user_library.php';

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

        $query = "INSERT INTO {$prefix}folderdetails (login_id,folder_parent,folder_name,date_created) values  (?,?,?,?)";
        $params = array($_SESSION['toolkits_logon_id'], get_user_root_folder(), $folder_name, date('Y-m-d'));
        
    }else{

        $query = "INSERT INTO {$prefix}folderdetails (login_id,folder_parent,folder_name,date_created) values  (?,?,?,?)";
        $params = array($_SESSION['toolkits_logon_id'], $folder_id, $folder_name, date('Y-m-d'));
    }

    $ok = db_query($query, $params);
    
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
            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $template_id . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "File " . $new_files_array[$x] . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username']);

        } else {

            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $template_id . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "File " . $new_files_array[$x] . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username']);

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
        if ($ok) {

            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder " . $folder_id . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "File " . $new_files_array[$x] . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username']);

        } else {

            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $folder_id . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "Folder " . $new_files_array[$x] . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username']);

        }

    }
}

