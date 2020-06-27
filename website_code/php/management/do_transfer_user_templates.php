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

$prefix =  $xerte_toolkits_site->database_table_prefix;

if(is_user_admin())
{
    if (isset($_REQUEST['olduserid']) && isset($_REQUEST['newuserid']) && isset($_REQUEST['delete_user'])) {
        // Get username of olduserid
        $q = "select * from {$prefix}logindetails where login_id=?";
        $params = array($_REQUEST['olduserid']);
        $olduser_rec = db_query_one($q, $params);

        $olduser = $olduser_rec['username'];

        // Get username of newusername
        $q = "select * from {$prefix}logindetails where login_id=?";
        $params = array($_REQUEST['newuserid']);
        $newuser_rec = db_query_one($q, $params);

        $newuser = $newuser_rec['username'];

        $delete_user = ($_REQUEST['delete_user'] == 'true' ? true : false);

        $q = "select td.*, tr.*, otd.template_name as orgtemplate_name from {$prefix}templatedetails td, {$prefix}templaterights tr, {$prefix}originaltemplatesdetails otd, {$prefix}logindetails ld 
                where td.template_id=tr.template_id and tr.role='creator' and td.access_to_whom != 'Private' and td.creator_id=ld.login_id and td.template_type_id=otd.template_type_id and ld.username=?";
        $templates_to_move = db_query($q, array($olduser));
        if ($templates_to_move !== false) {
            // Get folder parent name of newuser
            $q = "select fd.folder_id, fd.login_id from {$prefix}folderdetails fd, {$prefix}logindetails ld where ld.login_id=fd.login_id and ld.username=? AND folder_name = ?";
            $rootfolder = db_query_one($q, array($newuser, $newuser));
            if ($rootfolder === false)
            {
                die("Could not find workspace folder of user " . $newuser);
            }
            $foldername = $olduser_rec['firstname'] .  " "  . $olduser_rec['surname'];
            if (isset($_REQUEST['newfoldername']))
            {
                $foldername = $_REQUEST['newfoldername'];
            }
            // Check if folder $foldername exists for user 'newuser'
            $q = "select folder_id from {$prefix}folderdetails fd, {$prefix}logindetails ld where ld.login_id=fd.login_id and ld.username=? AND folder_name = ?";
            $folder = db_query_one($q, array($newuser, $foldername));
            if ($folder === false)
            {
                die("Error checking existence of folder " . $foldername);
            }
            if ($folder === null)
            {
                // create folder
                $q = "INSERT INTO {$prefix}folderdetails (login_id,folder_parent,folder_name,date_created) values  (?,?,?,?)";
                $params = array($rootfolder['login_id'], $rootfolder['folder_id'], $foldername, date('Y-m-d'));
                $folderid = db_query($q, $params);
            }
            else
            {
                $folderid = $folder['folder_id'];
            }
            // Ok, so now we move all the templates to move to user $_GET['newuser'], in folder $folderid
            foreach($templates_to_move as $template)
            {
                // Correct the database
                // 1. templatedetails
                $q = "update {$prefix}templatedetails set creator_id=? where template_id=?";
                $res = db_query($q, array($rootfolder['login_id'], $template['template_id']));
                if ($res === false)
                {
                    die("Error updating templatedetails of template " . $template['template_id']);
                }

                // 2. templaterights
                // 2a. put in correct folder
                $q = "insert {$prefix}templaterights set template_id=?, user_id=?, role='creator', folder=?";
                $params = array($template['template_id'], $rootfolder['login_id'], $folderid);
                $res = db_query($q, $params);
                if ($res === false)
                {
                    die("Error inserting creator rights of user " . $newuser . " in templaterights of template " . $template['template_id']);
                }
                // 2b. Remove from olduser
                $q = "delete from {$prefix}templaterights where template_id=? and user_id=? and role = 'creator'";
                $params = array($template['template_id'], $template['creator_id']);
                $res = db_query($q, $params);
                if ($res === false)
                {
                    die("Error deleting creator rights of user " . $olduser . " in templaterights of template " . $template['template_id']);
                }
                // 2c. Remove any access previously already granted to newuser to prevent different roles of this one user
                $q = "delete from {$prefix}templaterights where template_id=? and user_id=? and role != 'creator'";
                $params = array($template['template_id'], $rootfolder['login_id']);
                $res = db_query($q, $params);
                if ($res === false)
                {
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

            if ($delete_user) {
                // Remove the old user from all projects that have been shared with him/her
                $q = "delete from {$prefix}templaterights where user_id=? and role != 'creator'";
                $params = array($_REQUEST['olduserid']);
                $res = db_query($q, $params);
                if ($res === false) {
                    die("Error deleting any older rights in templaterights for user " . $olduser);
                }
                $feedback = "<p>" . USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACK_REMOVEDFROMRIGHTS . "</p>";
                $feedback = str_replace("{user}", $olduser, $feedback);
                $feedback = str_replace("{count}", $res, $feedback);
                echo $feedback;

                // Remove user from login details
                /*
                $q = "delete from {$prefix}logindetails where login_id=?";
                $params = array($_REQUEST['olduserid']);
                $res = db_query($q, $params);
                if ($res === false) {
                    die("Error deleting user " . $olduser);
                }
                $feedback = "<p>" . USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACK_REMOVEDFROMLOGINDETAILS . "</p>";
                $feedback = str_replace("{user}", $olduser, $feedback);
                echo $feedback;
                */
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