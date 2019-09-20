<?php
/**
 * Created by PhpStorm.
 * User: tom
 * Date: 26-3-2019
 * Time: 18:11
 */

require_once(dirname(__FILE__) . "/config.php");
require_once(dirname(__FILE__) . "/website_code/php/folder_library.php");

global $xerte_toolkits_site;

$prefix =  $xerte_toolkits_site->database_table_prefix;

if (isset($_SESSION['toolkits_logon_id']) &&  $_SESSION['toolkits_logon_id'] == "site_administrator")
{
    if (isset($_GET['olduser']) && isset($_GET['newuser'])) {
        $q = "select td.*, tr.*, otd.template_name as orgtemplate_name from {$prefix}templatedetails td, {$prefix}templaterights tr, {$prefix}originaltemplatesdetails otd, {$prefix}logindetails ld 
                where td.template_id=tr.template_id and tr.role='creator' and td.creator_id=ld.login_id and td.template_type_id=otd.template_type_id and ld.username=?";
        $templates_to_move = db_query($q, array($_GET['olduser']));
        if ($templates_to_move !== false) {
            // Get folder parent name of newuser
            $q = "select fd.folder_id, fd.login_id from {$prefix}folderdetails fd, {$prefix}logindetails ld where ld.login_id=fd.login_id and ld.username=? AND folder_name = ?";
            $rootfolder = db_query($q, array($_GET['newuser'], $_GET['newuser']));
            if ($rootfolder === false)
            {
                die("Could not find workspace folder of user " . $_GET['newuser']);
            }
            $foldername = $_GET['olduser'];
            if (isset($_GET['newfoldername']))
            {
                $foldername = $_GET['newfoldername'];
            }
            // Check if folder $foldername exists for user 'newuser'
            $q = "select folder_id from {$prefix}folderdetails fd, {$prefix}logindetails ld where ld.login_id=fd.login_id nad ld.username=? AND folder_name = ?";
            $folder = db_query($q, array($_GET['newuser'], $foldername));
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
                $res = db_query($q, arary($template['template_id']));
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
                    die("Error inserting creator record in templaterights of template " . $template['template_id']);
                }
                // 2b. Remove any access previously already granted to newuser to prevent different roles of this one user
                $q = "delete from {$prefix}templaterights where template_id=? and login_id=? and creator != 'creator'";
                $params = array($template['template_id'], $rootfolder['login_id']);
                $res = db_query($q, $params);
                if ($res === false)
                {
                    die("Error deleting any older rights in templaterights of template " . $template['template_id']);
                }
                // 3. rename USER_FILES folder
                // 3a. old folder name
                $oldfolder = $xerte_toolkits_site->users_file_area_short . $template['template_id'] . "_" . $_GET['olduser'] . "_" . $template['orgtemplate_name'];
                // 3.b new folder name
                $newfolder = $xerte_toolkits_site->users_file_area_short . $template['template_id'] . "_" . $_GET['newuser'] . "_" . $template['orgtemplate_name'];

                // Move
                $res = rename($oldfolder, $newfolder);
                if ($res === false)
                {
                    die("Error renaming " . $oldfolder . " to " . $newfolder);
                }
                // Success
                echo "Placed template with id " . $template['template_id'] . " (" . str_replace("_", " ", $template['template_id']) . ") in folder " . $foldername . " of " . $_GET['newuser'] . " and renamed " . $oldfolder . " to " . $newfolder . ".";
            }
        }
    }
    echo "Usage: migrate_user.php?olduser=<login old user>&newuser=<login new user>";
}
else{
    echo "Permission denied!";
}