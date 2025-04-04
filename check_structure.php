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
 *
 * Check structure of the workspace of a user
 *
 * @author Tom Reijnders
 * @version 1.0
 * @package
 */

require_once(dirname(__FILE__) . "/config.php");
require_once($xerte_toolkits_site->php_library_path  . "user_library.php");

function checkOrphan($folder, $folders)
{
    $folder_parent = $folder['folder_parent'];
    if ($folder_parent == 0) {
        return false;
    }
    $folder_is_orphan = true;
    foreach ($folders as $folder) {
        if ($folder['folder_id'] == $folder_parent) {
            $folder_is_orphan = false;
        }
    }
    return $folder_is_orphan;
}

function getFolderDetails($folder)
{
    global $xerte_toolkits_site;
    $sql = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}folderdetails fd, logindetails ld WHERE fd.folder_id = ? and fd.login_id = ld.login_id";
    $params = array($folder['folder_id']);
    $folderdetails = db_query_one($sql, $params);

    $sql = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}folderdetails fd, logindetails ld WHERE fd.folder_id = ? and fd.login_id = ld.login_id";
    $params = array($folder['folder_parent']);
    $parent_folder_details = db_query_one($sql, $params);

    $details = array();
    $details['folder_name'] = $folderdetails['folder_name'];
    $details['role'] = $folder['role'];
    $details['folder_owner'] = $folderdetails['firstname'] . " " . $folderdetails['surname'] . "(" . $folderdetails['username'] . ")";
    $details['folder_parent'] = $parent_folder_details['folder_name'] . "(" . $parent_folder_details['folder_id'] . ")";
    $details['folder_parent_owner'] = $parent_folder_details['firstname'] . " " . $parent_folder_details['surname'] . "(" . $parent_folder_details['username'] . ")";
    return $details;
}

$_SESSION['elevated'] = true;
if(is_user_admin()) {
    unset($_SESSION['elevated']);

    $fix = false;
    if (isset($_GET['fix'])) {
        $fix = true;
    }

    // Get the user id
    if (isset($_GET['username'])) {
        $username = x_clean_input($_GET['username']);

        // Get the user id
        $rowid = $row = db_query_one("SELECT login_id FROM {$xerte_toolkits_site->database_table_prefix}logindetails WHERE username = ?", array($username));
        $user_id = $row['login_id'];

        // Get root folder of user $user_id
        $root_folder = get_user_root_folder_id_by_id($user_id);

        // Get all the folders the user has access to
        $sql = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}folderrights WHERE login_id = ?";
        $params = array($user_id);
        $folders = db_query($sql, $params);

        $found = false;
        foreach ($folders as $folder) {
            $folder_is_orphan = checkOrphan($folder, $folders);
            if ($folder_is_orphan) {
                $found = true;
                echo "Orphaned folder: " . $folder['folder_id'] . "<br>";
                $details = getFolderDetails($folder);
                echo "Details: <br><ul>";
                echo "<li>Folder name         : " . $details['folder_name'] . "</li>";
                echo "<li>Role                : " . $details['role'] . "</li>";
                echo "<li>Folder shared by    : " . $details['folder_owner'] . "</li>";
                echo "<li>Folder parent       : " . $details['folder_parent'] . "</li>";
                echo "<li>Folder parent owner : " . $details['folder_parent_owner'] . "</li></ul>";

                if ($fix) {
                    echo "Fixing orphaned folder: {$details['folder_name']} (id={$folder['folder_id']}) and placing it at the root folder of user {$username} (id={$root_folder}) <br>";
                    $sql = "update {$xerte_toolkits_site->database_table_prefix}folderrights set folder_parent=? WHERE folder_id = ? and login_id = ?";
                    $params = array($root_folder, $folder['folder_id'], $user_id);
                    db_query($sql, $params);
                    echo "Orphaned folder fixed: " . $folder['folder_id'] . "<br>";
                }
            }
        }
        if (!$found) {
            echo "No orphaned folders found for user {$username}";
        }
    }
} else if(isset($_SESSION['toolkits_logon_id'])){
    unset($_SESSION['elevated']);
    echo "You are not permitted to use this page";
}else {
    unset($_SESSION['elevated']);
    $url = "check_structure.php";
    if(isset($_GET['username'])){
        $url .= "?username=" . $_GET['username'];
    }
    if (isset($_GET['fix'])) {
        $url .= "&fix=true";
    }
    $_SESSION['adminTo'] = $url;
    if (isset($_GET['altauth'])){
        $_SESSION['altauth'] = $xerte_toolkits_site->altauthentication;
    }
    header("location: index.php");
    exit();
}