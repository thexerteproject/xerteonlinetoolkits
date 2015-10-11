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
 * Date: 10-10-2015
 * Time: 12:58
 */
require_once(dirname(__FILE__) . "/../config.php");

class Integrate
{

    private $mesg;
    private $status;
    private $teacher_name;
    private $teacher_id;
    private $teacher_root_folder_id;
    private $teacher_group_folder_id;
    private $folder_name;
    private $org_template_id;


    /**
     *
     * Login page, self posts to become management page
     *
     * @author Patrick Lockley
     * @version 1.0
     * @package
     */

    private function Allowed()
    {
        return true;
    }

    /**
     *
     * Function create folder loop
     * This function creates folders needed when duplicating a template
     * @param string $foldername - the path to this folder
     * @param number $looplevel - a number to make sure that we enter and leave each folder correctly
     * @version 1.0
     * @author Patrick Lockley
     */

    private function createFolderLoop($dir_path, $new_path)
    {

        $folder_name = opendir($dir_path);

        while ($f = readdir($folder_name)) {
            $full = $dir_path . $f;
            if (is_dir($full)) {
                if (($f != ".") && ($f != "..")) {
                    $temp_new_path = $new_path . $f . "/";
                    if (@mkdir($temp_new_path)) {
                        if (@chmod($temp_new_path, 0777)) {
                            $this->createFolderLoop($full . "/", $temp_new_path);
                        } else {
                            $this->mesg .= "Failed to set permissions on folder: Failed to set correct rights on " . $temp_new_path . ".\n";
                            return false;
                        }
                    } else {
                        $this->mesg .= "Failed to create folder: Failed to create folder " . $temp_new_path . ".\n";
                        return false;
                    }
                }
            } else {
                $file_dest_path = $new_path . $f;
                if (@copy($full, $file_dest_path)) {
                    if (!@chmod($file_dest_path, 0777)) {
                        $this->mesg .= "Failed to copy file: Failed to set rights on file " . $full . " " . $file_dest_path . ".\n";
                        return false;
                    }
                } else {
                    $this->mesg .= "Failed to set rights on file: Failed to copy file " . $full . " " . $file_dest_path . ".\n";
                    return false;
                }
            }
        }
        closedir($folder_name);

        /*
         * loop level is used to check for the recusion to make sure it has worked ok. A failure in this is not critical but is used in error reporting
         */

        return true;
    }

    /**
     *
     * Function create folder loop
     * This function creates folders needed when duplicating a template
     * @param string $folder_name_id - the id of the new template
     * @param number $id_to_copy - the id of the old template
     * @param string $tutorial_id_from_post - The name of this tutorial type i.e Nottingham
     * @version 1.0
     * @author Patrick Lockley
     */

    private function duplicateTemplate($user_name, $new_id, $id_to_copy, $template_type)
    {

        global $dir_path, $new_path, $xerte_toolkits_site;

        // Get creator of template $id_to_copy
        global $xerte_toolkits_site;

        $prefix = $xerte_toolkits_site->database_table_prefix;

        $this->mesg .= " - Copy template contents\n";
        $q = "select ld.username from {$prefix}templatedetails td, {$prefix}logindetails ld where td.template_id=? and td.creator_id=ld.login_id";
        $row = db_query_one($q, array($id_to_copy));

        if ($row == null) {
            $this->mesg .= "Cannot find user of template " . $id_to_copy . ".\n";
            return false;
        }
        $org_user_name = $row['username'];

        $dir_path = $xerte_toolkits_site->users_file_area_full . $id_to_copy . "-" . $org_user_name . "-" . $template_type . "/";

        /*
         * Get the id of the folder we are looking to copy into
         */

        $new_path = $xerte_toolkits_site->users_file_area_full . $new_id . "-" . $user_name . "-" . $template_type . "/";

        if (mkdir($new_path)) {
            if (@chmod($new_path, 0777)) {
                if ($this->createFolderLoop($dir_path, $new_path)) {
                    if (file_exists($new_path = $xerte_toolkits_site->users_file_area_full . $new_id . "-" . $user_name . "-" . $template_type . "/lockfile.txt")) {
                        unlink($new_path = $xerte_toolkits_site->users_file_area_full . $new_id . "-" . $user_name . "-" . $template_type . "/lockfile.txt");
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                $this->mesg .= "Failed to set rights on parent folder for template: Failed to set rights on parent folder " . $new_path . ".\n";
                return false;
            }
        } else {
            $this->mesg .= "Failed to create parent folder for template: Failed to create parent folder " . $new_path . ".\n";
            return false;
        }
    }

    /*
     * Look if login exists, and if not create it.
     * This will not create an account with password.
     *
     * It is assumed the account is already created (depending on the authentication method)
     *
     * returns array($login_id, $root_folder_id)
     */
    private function checkCreateLogin($username, $firstname, $surname)
    {
        global $xerte_toolkits_site;

        $prefix = $xerte_toolkits_site->database_table_prefix;

        if (!$this->Allowed())
            return false;

        $this->mesg .= "Check login " . $username . "\n";
        $this->mesg .= "   - Check if user " . $username . " exists.\n";
        // search for user in logindetails table
        $q = "select * from {$prefix}logindetails where username=?";
        $row = db_query_one($q, array($username));

        if ($row !== false && $row != null) {
            $login_id = $row['login_id'];
        } else {

            $this->mesg .= "   - Create user login for " . $username . ".\n";

            // Create logindetails
            $query = "insert into {$prefix}logindetails (username, lastlogin, firstname, surname) values (?,?,?,?)";
            $login_id = db_query($query, array($username, date('Y-m-d'), $firstname, $surname));

            // Create recycle bin
            $query = "insert into {$prefix}folderdetails (login_id,folder_parent,folder_name) VALUES (?,?,?)";
            $res = db_query($query, array($login_id, "0", 'recyclebin'));

            if ($res === false) {
                $this->mesg .= "   - Failed to create recyclebin for user " . $username . "\n";
                return false;
            }
        }

        // Check root folder
        $root_folder_id = $this->checkCreateRootFolder($login_id, $username);
        if ($root_folder_id == null || $root_folder_id === false) {
            $this->mesg .= "   - Cannot find/create root folder for user " . $username . ".\n";
            return false;
        }
        return array('login_id' => $login_id, 'root_folder_id' => $root_folder_id);

    }

    /*
     * Look if root folder for user exists, and if not create it.
     *
     * returns folder_id
     */
    private function checkCreateRootFolder($login_id, $username)
    {
        global $xerte_toolkits_site;

        $prefix = $xerte_toolkits_site->database_table_prefix;

        if (!$this->Allowed())
            return false;

        // Check root folder
        $this->mesg .= "   - Check root folder for user " . $username . ".\n";

        $query = "select folder_id from {$prefix}folderdetails where login_id= ? AND folder_name = ?";
        $params = array($login_id, $username);

        $response = db_query_one($query, $params);
        if ($response == null) {

            $this->mesg .= "   - Create root folder for user " . $username . ".\n";

            $query = "insert into {$prefix}folderdetails (login_id,folder_parent,folder_name) VALUES (?,?,?)";
            $params = array($login_id, "0", $username);

            $folder_id = db_query($query, $params);
        }
        else
        {
            $folder_id = $response['folder_id'];
        }
        return $folder_id;

    }

    /*
     * Look if a folder for user exists, and if not create it.
     *
     * returns folder_id
     */
    private function checkCreateFolder($login_id, $parent_folder_id, $foldername)
    {
        global $xerte_toolkits_site;

        $prefix = $xerte_toolkits_site->database_table_prefix;

        if (!$this->Allowed())
            return false;

        // search for user in logindetails table
        $q = "select * from {$prefix}folderdetails where login_id=? and folder_parent=? and folder_name=?";
        $row = db_query_one($q, array($login_id, $parent_folder_id, $foldername));

        if ($row == null) {
            // Create folder
            $query = "insert into {$prefix}folderdetails (login_id,folder_parent,folder_name,date_created) values  (?,?,?,?)";
            $params = array($login_id, $parent_folder_id, $foldername, date('Y-m-d'));

            $folder_id = db_query($query, $params);

            return $folder_id;  // Might be false
        } else {
            return $row['folder_id'];
        }
    }

    /*
     * Copy template to userfolder and return id of template
     */
    private function copyTemplateToUserFolder($template_id, $login_id, $user_name, $folder_id, $for_user)
    {
        global $xerte_toolkits_site;

        $prefix = $xerte_toolkits_site->database_table_prefix;

        if (!$this->Allowed())
            return false;

        /*
             * get the maximum id number from templates, as the id for this template
             */
        $row = db_query_one("SELECT max(template_id) as count FROM {$prefix}templatedetails");

        if ($row === false) {
            $this->mesg .= "Failed to get the maximum template number.\n";
            return false;
        }
        $new_template_id = $row['count'] + 1;

        $query_for_template_type_id = "select otd.template_type_id, otd.template_name as org_template_name, otd.template_framework, td.extra_flags, td.template_name from "
            . "{$prefix}originaltemplatesdetails otd, {$prefix}templatedetails td where "
            . "otd.template_type_id = td.template_type_id  AND "
            . "td.template_id = ? ";

        $params = array($template_id);

        $row_template_type = db_query_one($query_for_template_type_id, $params);

        /*
         * create the new template record in the database
         */

        $query_for_new_template = "insert into {$prefix}templatedetails "
            . "(template_id, creator_id, template_type_id, date_created, date_modified, access_to_whom, template_name, extra_flags)"
            . " VALUES (?,?,?,?,?,?,?,?)";
        $params = array(
            $new_template_id,
            $login_id,
            $row_template_type['template_type_id'],
            date('Y-m-d'),
            date('Y-m-d'),
            "Private",
            $row_template_type['template_name'] . "_" . $for_user,
            $row_template_type['extra_flags']);

        if (db_query($query_for_new_template, $params) !== FALSE) {

            $query_for_template_rights = "insert into {$prefix}templaterights (template_id,user_id,role, folder) VALUES (?,?,?,?)";
            $params = array($new_template_id, $login_id, "creator", $folder_id);

            if (db_query($query_for_template_rights, $params) !== FALSE) {

                $this->mesg .= " - Created new template record for the database.\n";

                if ($this->duplicateTemplate($user_name, $new_template_id, $template_id, $row_template_type['org_template_name']))
                {
                    return $new_template_id;
                }
                else
                {
                    $this->mesg .= "Failed to duplicate contents to new template.\n";
                    return false;
                }

            } else {

                $this->mesg .= "Failed to create new template record for the database.\n";
                return false;
            }

        } else {

            $this->mesg .= "Failed to create new template record for the database.\n";

            return false;

        }
    }


    /*
     * Copy template to userfolder and return id of template
     */
    private function shareTemplateWithUserInFolder($template_id, $new_login_id, $new_folder_id)
    {
        global $xerte_toolkits_site;

        $prefix = $xerte_toolkits_site->database_table_prefix;

        if (!$this->Allowed())
            return false;

        //$this->mesg .= "Share template\n;";

        $query_to_insert_share = "insert into {$prefix}templaterights (template_id, user_id, role, folder) VALUES (?,?,?,?)";
        $params = array($template_id, $new_login_id, "editor", $new_folder_id);

        if (db_query($query_to_insert_share, $params) !== false) {

            return true;

        } else {

            return false;
        }
    }

    function __construct()
    {

    }

    public function setTeacher($username, $firstname, $surname)
    {
        $teacher = $this->checkCreateLogin($username, $firstname, $surname);

        if ($teacher !== false)
        {
            $this->teacher_id = $teacher['login_id'];
            $this->teacher_root_folder_id = $teacher['root_folder_id'];
            $this->teacher_name = $username;
            $this->status = true;
        }
        else
        {
            $this->status = false;
        }
    }

    public function setGroupFolder($foldername)
    {
        $folderid = $this->checkCreateFolder($this->teacher_id, $this->teacher_root_folder_id, $foldername);
        
        if ($folderid !== false)
        {
            $this->teacher_group_folder_id  = $folderid;
            $this->folder_name = $foldername;

            $this->status = true;
        }
        else
        {
            $this->status = false;    
        }
    }
    
    public function setOriginalTemplateId($template_id)
    {
        $this->org_template_id = $template_id;
        $this->mesg .= "Set original template to " . $template_id . ".\n";
    }
    
    public function addStudent($username, $firstname, $surname)
    {
        // Create login for student
        $this->mesg .= "Add student " . $firstname . " " . $surname . ".\n";
        $login = $this->checkCreateLogin($username, $firstname, $surname);

        if ($login !== false)
        {
            // Place template in teachers folder for this student
            $this->mesg .= " - Place template in teachers folder.\n";
            $template_id = $this->copyTemplateToUserFolder($this->org_template_id, $this->teacher_id, $this->teacher_name, $this->teacher_group_folder_id, $firstname . " " . $surname);

            if ($this->status)
            {
                // Share template with student
                $this->mesg .= " - Share template with student.\n";
                if ($this->shareTemplateWithUserInFolder($template_id, $login['login_id'], $login['root_folder_id']))
                {
                    $this->mesg .= "\n";
                    return true;
                }
                else
                {
                    $this->mesg .= "Failed to share template with student\n";
                }
            }
            else
            {
                $this->mesg .= "Failed to copy template to teacher folder\n";
                return false;
            }
        }
        else
        {
            $this->status = false;
            return false;
        }

    }

    public function getMesgHTML()
    {
        return str_replace("\n", "<br>",  $this->mesg);
    }

    public function getMesg()
    {
        return $this->mesg;
    }

    public function getStatus()
    {
        return $this->status;
    }

}