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
 * name select template, displays usernames so people can choose to share a template
 * modified for use of folders
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/name_select_template.inc");

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

$prefix = $xerte_toolkits_site->database_table_prefix;

$parameters = explode("_", $_POST['folder_id']);

if(is_numeric($parameters[0])&&is_string($parameters[1])){

    $search = $_POST['search_string'];

    $tutorial_id = (int) $parameters[0];

    $database_id=database_connect("Template name select share folder access database connect success","Template name select share folder database connect failed");

    /**
     * Search the list of user logins for user with that name
     */

    if(strlen($search)!=0){

        $query_for_groups = "SELECT group_id, group_name from {$prefix}user_groups WHERE group_name like ? ORDER BY group_name ASC";
        $query_groups_response = db_query($query_for_groups, array("%$search%"));

        $query_for_names = "select login_id, firstname, surname, username from {$prefix}logindetails WHERE "
        . "((firstname like ?) or (surname like ?) or (username like ?)) AND login_id NOT IN ( "
        . "SELECT login_id from {$prefix}folderdetails where folder_id = ? ) ORDER BY firstname ASC";

        $params = array("%$search%", "%$search%", "%$search%", $tutorial_id);
                
        $query_names_response = db_query($query_for_names, $params); 

        if(sizeof($query_names_response)!=0 OR sizeof($query_groups_response)!=0){
            foreach($query_groups_response as $row){

                echo "<p>" . $row['group_name'] .  " - <button type=\"button\" class=\"xerte_button\" onclick=\"share_this_folder('" . $tutorial_id . "', '" . $row['group_id'] . "', group=true)\"><i class=\"fas fa-users\"></i>&nbsp;" . NAME_SELECT_CLICK_GROUP . "</button></p>";

            }

            foreach($query_names_response as $row){

                echo "<p>" . $row['firstname'] . " " . $row['surname'] . " (" . $row['username'] . ")  - <button type=\"button\" class=\"xerte_button\" onclick=\"share_this_folder('" . $tutorial_id . "', '" . $row['login_id'] . "')\"><i class=\"fa fa-user-plus\"></i>&nbsp;" . NAME_SELECT_CLICK . "</button></p>";

            }

        }else{

            echo "<p>" . NAME_SELECT_DETAILS_FAIL . "</p>";			

        }

    }

}
