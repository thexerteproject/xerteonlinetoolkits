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
 * check remove sharing template, returns nr of templates owned by user to be removed to be able to give warning
 *
 * @author Tom Reijnders
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
require_once "../folder_status.php";
require_once "../folder_library.php";
require_once "../user_library.php";

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

_load_language_file("/website_code/php/folderproperties/check_remove_sharing_folder.inc");

$id = $_POST['id'];
$folder_id = $_POST['folder_id'];
$group = $_POST['group'];

if(is_numeric($_POST['folder_id'])) {

    if (is_user_creator_or_coauthor_folder($_POST['folder_id']) || is_user_admin() || $_POST['user_deleting_self'] == "true") {
        $prefix = $xerte_toolkits_site->database_table_prefix;

        $database_id = database_connect("Folder sharing database connect failed", "Folder sharing database connect failed");

        // Get creator of folder
        $creator = get_folder_creator($folder_id);

        // Check if user has templates owned by the user being removed
        $workspaceId = get_user_root_folder_by_id($id);

        $checkParams = array($id);

        $foldersToCheck = get_all_subfolders_of_folder_for_user($folder_id, $creator);

        $query_to_check_folder = "SELECT count(template_id) as nrtemplates from {$prefix}templaterights where user_id = ? and role = 'creator' and folder in (";
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

        $nr_templates = db_query_one($query_to_check_folder, $checkParams);
        if ($nr_templates['nrtemplates'] > 0) {
            if ($_POST['user_deleting_self'] == "true"){
                echo YOU_HAVE_TEMPLATES_IN_FOLDER;
            }
            else {
                echo USER_HAS_TEMPLATES_IN_FOLDER;
            }
        } else {
            echo "NO";
        }
    }
}