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
/**
 * Created by PhpStorm.
 * User: tom
 * Date: 26-3-2019
 * Time: 18:11
 */

require_once("../../../config.php");

_load_language_file("/website_code/php/management/user_templates.inc");

require_once("../url_library.php");
require_once("../folder_library.php");
require_once("../user_library.php");
require_once("management_library.php");

global $xerte_toolkits_site;
global $prefix;

$prefix = $xerte_toolkits_site->database_table_prefix;

function delete_folder_loop($path){

    /**
     * @global $folder_id_array, $folder_array, $file_array, $dir_path - several arrays and strings
     */

    global $folder_id_array, $folder_array, $file_array;

    $d = opendir($path);

    array_push($folder_id_array, $d);

    while($f = readdir($d)){

        if(($f!=".")&&($f!="..")){

            $string = $path . DIRECTORY_SEPARATOR . $f;

            if(is_dir($string)){

                array_push($folder_array, $string);

                delete_folder_loop($string);

            }else{

                array_push($file_array, $string);

            }
        }

    }

    $x = array_pop($folder_id_array);

    closedir($x);

}

$dir_path="";
$temp_dir_path = "";
$temp_new_path = "";

$folder_id_array = array();
$folder_array = array();
$file_array = array();

function clean_up_files(){

    global $file_array, $folder_array;

    while($file = array_pop($file_array)){

        unlink($file);

    }

    while($folder = array_pop($folder_array)){

        rmdir($folder);

    }

}


function delete_template($template)
{

    global $prefix, $dir_path, $xerte_toolkits_site;

    $path = $xerte_toolkits_site->users_file_area_short . $template['template_id'] . "-" . $template['oldusername'] . "-" . $template['orgtemplate_name'];

    $feedback = USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACK_DELETED;
    $feedback = str_replace("{folder}", $path, $feedback);
    $feedback .= "<br>";


    $dir_path = $path;

    /*
    * find the files to delete
    */

    delete_folder_loop($dir_path);

    /*
    * remove the files
    */

    clean_up_files();

    /*
    * delete the directory for this template
    */

    rmdir($path);

    // Remove template from database
    $query_to_delete_template_attributes = "delete from {$prefix}templatedetails where template_id= ?";
    $params = array($template['template_id']);
    db_query($query_to_delete_template_attributes, $params);

    $query_to_delete_template_rights = "delete from {$prefix}templaterights where template_id= ?";
    $params = array($template['template_id']);
    db_query($query_to_delete_template_rights, $params);

    $query_to_delete_template_group_rights = "delete from {$prefix}template_group_rights where template_id= ?";
    $params = array($template['template_id']);
    db_query($query_to_delete_template_group_rights, $params);

    $query_to_delete_syndication = "delete from {$prefix}templatesyndication where template_id=?";
    $params = array($template['template_id']);
    db_query($query_to_delete_syndication, $params);

    $query_to_delete_xml_and_peer = "delete from {$prefix}additional_sharing where template_id=?";
    $params = array($template['template_id']);
    db_query($query_to_delete_xml_and_peer, $params);

    return $feedback;
}


function clear_recyclebin($templates)
{
    $feedback = "";
    for ($i=0; $i<count($templates); $i++)
    {
        $feedback .= delete_template($templates[$i]);
    }
    return "<p>" . $feedback . "</p>";
}

function createGetFolderId($folder_structure, $newuserid, $old_folder_id, $transfer_shared_folders)
{
    global $prefix;
    for ($i=0; $i < count($folder_structure); $i++)
    {
        if ($folder_structure[$i]['folder_id'] == $old_folder_id)
        {
            if ($folder_structure[$i]['newid'] != -1)
            {
                return $folder_structure[$i]['newid'];
            }
            else
            {
                if ($folder_structure[$i]['folder_parent'] != 0) {
                    $parent_folder_id = createGetFolderId($folder_structure, $newuserid, $folder_structure[$i]['folder_parent'], $transfer_shared_folders);
                }
                else
                {
                    $parent_folder_id = 0;
                }
                // Check if folder with parent $parent_folder_id and name $folder_structure[$i]['folder_name'] exists
                $q = "select * from {$prefix}folderdetails where login_id=? and folder_parent=? and folder_name=?";
                $params = array($newuserid, $parent_folder_id, $folder_structure[$i]['folder_name']);
                $folder = db_query_one($q, $params);
                if ($folder === false)
                {
                    return false;
                }
                if ($folder != null)
                {
                    // Found, re-use
                    $folder_structure[$i]['newid'] = $folder['folder_id'];
                    return $folder['folder_id'];
                }
                // Not found, create
                $q = "insert into {$prefix}folderdetails set login_id=?, folder_parent=?, folder_name=?, date_created=?";
                $params = array($newuserid, $parent_folder_id, $folder_structure[$i]['folder_name'], date('Y-m-d H:i:s'));
                $folder_id = db_query($q, $params);
                $folder_structure[$i]['newid'] = $folder_id;
                if ($folder_id !== false){
                    $query = "INSERT INTO {$prefix}folderrights (folder_id, login_id, folder_parent, role) values (?,?,?,?)";
                    $params = array($folder_id, $newuserid, $parent_folder_id, "creator");
                    $ok = db_query($query, $params);
                }
                if ($transfer_shared_folders)
                {
                    // Check whether old_folder_id is shared, and change to new $folder_id
                    // Both for folderrights table as for folder_group_rights_table

                    // 1. folderrights
                    $q = "update {$prefix}folderrights set folder_id=? where folder_id=? and role != 'creator'";
                    $params = array($folder_id, $old_folder_id);
                    db_query($q, $params);

                    // Delete any sharing records with login_id
                    $q = "delete from {$prefix}folderrights where login_id=? and role != 'creator'";
                    $params = array($newuserid);
                    db_query($q, $params);

                    // 2. folder_group_rights_table
                    $q = "update {$prefix}folder_group_rights_table set folder_id=? where folder_id=? and role != 'creator'";
                    $params = array($folder_id, $old_folder_id);
                    db_query($q, $params);

                    // Move all templaterights referring to $old_folder_id to $folder_id
                    $q = "update {$prefix}templaterights set folder=? where folder=?";
                    $params = array($folder_id, $old_folder_id);
                    db_query($q, $params);
                }
                return $folder_id;
            }
        }
    }
    return false;
}


if(is_user_permitted("projectadmin", "system"))
{
    if (isset($_REQUEST['olduserid']) && isset($_REQUEST['newuserid']) && isset($_REQUEST['transfer_private']) && isset($_REQUEST['transfer_shared_folders']) && isset($_REQUEST['delete_user'])) {

        $olduserid = x_clean_input($_REQUEST['olduserid'], 'numeric');
        $newuserid = x_clean_input($_REQUEST['newuserid'], 'numeric');
        $transfer_private = x_clean_input($_REQUEST['transfer_private']);
        $transfer_shared_folders = x_clean_input($_REQUEST['transfer_shared_folders']);
        $delete_user = x_clean_input($_REQUEST['delete_user']);

        // Get username of olduserid
        $q = "select * from {$prefix}logindetails where login_id=?";
        $params = array($olduserid);
        $olduser_rec = db_query_one($q, $params);

        $olduser = $olduser_rec['username'];

        // Get username of newusername
        $q = "select * from {$prefix}logindetails where login_id=?";
        $params = array($newuserid);
        $newuser_rec = db_query_one($q, $params);

        $newuser = $newuser_rec['username'];
        $newuserid = $newuserid;

        $transfer_private = ($transfer_private == 'true' ? true : false);
        $transfer_shared_folders = ($transfer_shared_folders == 'true' ? true : false);
        $delete_user = ($delete_user == 'true' ? true : false);

        $q = "select td.*, tr.*, otd.template_name as orgtemplate_name, f.folder_id, f.folder_parent, f.folder_name from {$prefix}templatedetails td, {$prefix}templaterights tr, {$prefix}originaltemplatesdetails otd, {$prefix}folderdetails f, {$prefix}logindetails ld 
                where td.template_id=tr.template_id and tr.role='creator' and tr.folder=f.folder_id and td.creator_id=ld.login_id and td.template_type_id=otd.template_type_id and ld.username=?";
        $templates_to_move = db_query($q, array($olduser));
        if ($templates_to_move !== false) {

            $foldername = $olduser_rec['firstname'] .  " "  . $olduser_rec['surname'];
            if (isset($_REQUEST['newfoldername']))
            {
                $foldername = x_clean_input($_REQUEST['newfoldername']);
            }

            // Build original folder tree
            $q = "select * from {$prefix}folderdetails where login_id=? order by folder_id";
            $params = array($olduserid);
            $folder_structure = db_query($q, $params);

            // At least two folders should exist...
            for ($i=0; $i < count($folder_structure); $i++)
            {
                if ($folder_structure[$i]['folder_name'] == $olduser)
                {
                    $folder_structure[$i]['folder_name'] = $foldername;
                    $new_root_folder_index = $i;
                }
                $folder_structure[$i]['newid'] = -1;
            }

            // Get folder parent name of newuser
            $rootfolder = get_user_root_folder_record_by_id($newuserid);

            // Check if folder $foldername exists for user 'newuser'
            $q = "select folder_id from {$prefix}folderdetails fd, {$prefix}logindetails ld where ld.login_id=fd.login_id and ld.username=? AND folder_name = ?";
            $folder = db_query_one($q, array($newuser, $foldername));
            if ($folder === false)
            {
                die("Error checking existence of folder " . $foldername);
            }
            $new_root_folder_id = -1;
            if ($folder === null)
            {
                // create folder
                $folder_create_query = "INSERT INTO {$prefix}folderdetails (login_id,folder_parent,folder_name,date_created) values  (?,?,?,?)";
                $folder_create_params = array($rootfolder['login_id'], $rootfolder['folder_id'], $foldername, date('Y-m-d H:i:s'));
                //$folderid = db_query($q, $params);
                // Create folder only if needed
            }
            else
            {
                $new_root_folder_id = $folder['folder_id'];
                $folder_structure[$new_root_folder_index]['newid'] = $new_root_folder_id;
            }
            // Ok, so now we move all the templates to move to user $_GET['newuser'], in folder $folderid
            $templates_recyclebin = array();
            foreach($templates_to_move as $template)
            {
                if ($template['folder_name'] == 'recyclebin' && $template['folder_parent'] == 0)
                {
                    $template['oldusername'] = $olduser;
                    $templates_recyclebin[] = $template;
                }
                // Do only move if template is not in recyclebin or transfer_private is on or not private or tsugi_published or xapi published
                else if ($transfer_private || $template['access_to_whom'] != 'Private' || $template['tsugi_published'] == "1" || $template['tsugi_xapi_enabled'] == "1")
                {
                    // If new root folder doesn't  exist yet, create it now
                    if ($new_root_folder_id == -1)
                    {
                        $new_root_folder_id = db_query($folder_create_query, $folder_create_params);
                        if ($new_root_folder_id === false)
                        {
                            die("Error creating folder " . $foldername . "in workspace of new user " . $newuser);
                        }
                        // Make sure folderrights record is created as well
                        $folder_rights_query = "INSERT INTO {$prefix}folderrights (folder_id,login_id,folder_parent,role) values  (?,?,?,?)";
                        $folder_rights_params = array($new_root_folder_id, $rootfolder['login_id'], $rootfolder['folder_id'], 'creator');
                        $folder_rights_id = db_query($folder_rights_query, $folder_rights_params);

                        $folder_structure[$new_root_folder_index]['newid'] = $new_root_folder_id;
                    }
                    // Correct the database
                    // 1. templatedetails
                    $q = "update {$prefix}templatedetails set creator_id=? where template_id=?";
                    $res = db_query($q, array($rootfolder['login_id'], $template['template_id']));
                    if ($res === false) {
                        die("Error updating templatedetails of template " . $template['template_id']);
                    }

                    // 2. templaterights
                    // 2a. Make sure new folder exists
                    $folder_id = createGetFolderId($folder_structure, $newuserid, $template['folder_id'], $transfer_shared_folders);
                    // 2b. put in correct folder
                    $q = "insert {$prefix}templaterights set template_id=?, user_id=?, role='creator', folder=?";
                    $params = array($template['template_id'], $rootfolder['login_id'], $folder_id);
                    $res = db_query($q, $params);
                    if ($res === false) {
                        die("Error inserting creator rights of user " . $newuser . " in templaterights of template " . $template['template_id']);
                    }
                    // 2c. Remove from olduser
                    $q = "delete from {$prefix}templaterights where template_id=? and user_id=? and role = 'creator'";
                    $params = array($template['template_id'], $template['creator_id']);
                    $res = db_query($q, $params);
                    if ($res === false) {
                        die("Error deleting creator rights of user " . $olduser . " in templaterights of template " . $template['template_id']);
                    }
                    // 2d. Remove any access previously already granted to newuser to prevent different roles of this one user
                    $q = "delete from {$prefix}templaterights where template_id=? and user_id=? and role != 'creator'";
                    $params = array($template['template_id'], $rootfolder['login_id']);
                    $res = db_query($q, $params);
                    if ($res === false) {
                        die("Error deleting any older rights in templaterights of template " . $template['template_id']);
                    }
                    // 3. rename USER_FILES folder
                    // 3a. old folder name
                    $oldfolder = $xerte_toolkits_site->users_file_area_short . $template['template_id'] . "-" . $olduser . "-" . $template['orgtemplate_name'];
                    // 3.b new folder name
                    $newfolder = $xerte_toolkits_site->users_file_area_short . $template['template_id'] . "-" . $newuser . "-" . $template['orgtemplate_name'];

                    // 3c. If $oldfolder exists, move it to $newfolder
                    if (file_exists($xerte_toolkits_site->root_file_path . $oldfolder)) {
                        $res = rename($xerte_toolkits_site->root_file_path . $oldfolder, $xerte_toolkits_site->root_file_path . $newfolder);
                        if ($res === false) {
                            die("Error renaming " . $oldfolder . " to " . $newfolder);
                        }
                        // Success
                        $feedback = "<p>" . USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACKLINE . "</p>";
                        $feedback = str_replace("{template_id}", $template['template_id'], $feedback);
                        $feedback = str_replace("{template_name}", str_replace("_", " ", $template['template_name']), $feedback);
                        $feedback = str_replace("{folder}", $foldername, $feedback);
                        $feedback = str_replace("{newuser}", $newuser, $feedback);
                        $feedback = str_replace("{oldfolder}", $oldfolder, $feedback);
                        $feedback = str_replace("{newfolder}", $newfolder, $feedback);

                        echo $feedback . ".<br>";
                    }
                }
            }

            if ($delete_user) {
                // Remove the old user from all projects that have been shared with him/her
                $q = "delete from {$prefix}templaterights where user_id=? and role != 'creator'";
                $params = array($olduserid);
                $res = db_query($q, $params);
                if ($res === false) {
                    die("Error deleting any older rights in templaterights for user " . $olduser);
                }
                $feedback = "<p>" . USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACK_REMOVEDFROMRIGHTS . "</p>";
                $feedback = str_replace("{user}", $olduser, $feedback);
                $feedback = str_replace("{count}", $res, $feedback);
                echo $feedback;

                if ($transfer_private && $transfer_shared_folders) {
                    // Empty recyclebin (and delete templates)
                    $feedback = clear_recyclebin($templates_recyclebin);
                    $feedback = str_replace("{user}", $olduser, $feedback);
                    echo $feedback;

                    // Remove user from login details
                    $q = "delete from {$prefix}logindetails where login_id=?";
                    $params = array($olduserid);
                    $res = db_query($q, $params);
                    if ($res === false) {
                        die("Error deleting user " . $olduser);
                    }
                    $feedback = "<p>" . USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACK_REMOVEDFROMLOGINDETAILS . "</p>";
                    $feedback = str_replace("{user}", $olduser, $feedback);
                    echo $feedback;
                }
            }
            else
            {
                $feedback = "<p>" .  USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACK_USERISNOTREMOVED . "</p>";
                $feedback = str_replace("{user}", $olduser, $feedback);
                echo $feedback;
            }

            echo "<button type=\"button\" class=\"xerte_button\" onclick=\"javascript:transfer_user_templates_closepanel()\">" . USERS_MANAGEMENT_TEMPLATE_TRANSFER_CLOSE_PANEL . "</button>";
        }
    }
    else {
        echo "Usage: migrate_user_templates.php?olduser=<login old user>&newuser=<login new user><br>";
        echo "Will move all templates created by olduser to folder olduser of user newuser<br>";
    }
}
else{
    management_fail();
}
