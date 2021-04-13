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
 * share this template with a group, gives a group rights to a template
 *
 * @author Noud Liefrink
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/share_this_template.inc");

$group_id = $_POST['group_id'];

$template_id = $_POST['template_id'];

$prefix = $xerte_toolkits_site->database_table_prefix;
if(is_numeric($group_id)&&is_numeric($template_id)){

    $database_id=database_connect("Share this template database connect success","Share this template database connect success");

    //Add this connection to template_group_rights
    $query_to_insert_share = "INSERT INTO {$prefix}template_group_rights (group_id, template_id, role) VALUES (?,?,?)";
    $params = array($group_id, $template_id, "editor");

    if(db_query($query_to_insert_share, $params)){

        /**
         * sort ouf the html to return to the screen
         */

        $query_for_name = "select group_name from {$prefix}user_groups WHERE group_id=?";
        $params = array($group_id);

        $row = db_query_one($query_for_name, $params); 

        echo SHARING_THIS_FEEDBACK_SUCCESS  . " " . $row['group_name'] . "<br>";

    }else{

        echo SHARING_THIS_FEEDBACK_FAIL . " <br>";			

    }
}