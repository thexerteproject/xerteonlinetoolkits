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
 * share this template, gives a new user rights to a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/share_this_template.inc");


$prefix = $xerte_toolkits_site->database_table_prefix;
if(is_numeric($_POST['user_id'])&&is_numeric($_POST['template_id'])){

    $user_id = $_POST['user_id'];

    $tutorial_id = $_POST['template_id'];

    $database_id=database_connect("Share this template database connect success","Share this template database connect success");

    /**
     * find the user you are sharing with's root folder to add this template to
     */

    $query_to_find_out_root_folder = "select folder_id from {$prefix}folderdetails where login_id = ? and folder_parent=? and folder_name!=?";

    $params = array($user_id, '0', 'recyclebin');
    
    $row_query_root = db_query_one($query_to_find_out_root_folder, $params); 

    $query_to_insert_share = "INSERT INTO {$prefix}templaterights (template_id, user_id, role, folder) VALUES (?,?,?,?)";
    $params = array($tutorial_id, $user_id,"editor", $row_query_root['folder_id']);

    if(db_query($query_to_insert_share, $params)){

        /**
         * sort ouf the html to return to the screen
         */

        $query_for_name = "select firstname, surname from {$prefix}logindetails WHERE login_id=?";
        $params = array($user_id);

        $row = db_query_one($query_for_name, $params); 

        echo SHARING_THIS_FEEDBACK_SUCCESS  . " " . $row['firstname'] . " " . $row['surname'] . "<br>";

    }else{

        echo SHARING_THIS_FEEDBACK_FAIL . " <br>";			

    }
}