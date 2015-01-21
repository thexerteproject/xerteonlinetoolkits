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
 * screen size template, gets the xml and returns the size for the display of the template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");

include "../screen_size_library.php";

if(is_numeric($_POST['tutorial_id'])){

    $database_id = database_connect("screen size database connect success","screen size database connect failed");

    $prefix =  $xerte_toolkits_site->database_table_prefix ;
    $query_for_template_name = "select {$prefix}originaltemplatesdetails.template_name,"
    . "{$prefix}originaltemplatesdetails.template_framework from {$prefix}originaltemplatesdetails, {$prefix}templatedetails WHERE "
    . "{$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id AND template_id = ?";

    $params = array($_POST['tutorial_id']);
    
    $row_name = db_query_one($query_for_template_name, $params);

    echo get_template_screen_size($row_name['template_name'], $row_name['template_framework']) . "~" . $_POST['tutorial_id'];

}
