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
 * rename template, allows a user to rename a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";
include "../screen_size_library.php";
include "../url_library.php";
include "properties_library.php";

if(is_numeric($_POST['template_id'])){

    $tutorial_id = (int)$_POST['template_id'];

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $database_id = database_connect("Template rename database connect success","Template rename database connect failed");

    $query = "update {$prefix}templatedetails SET template_name = ? WHERE template_id = ?";
    $params = array(str_replace(" ", "_", $_POST['template_name']), $_POST['template_id']);

    if(db_query($query, $params)) {

        $query_for_names = "select template_name, date_created, date_modified from {$prefix}templatedetails where template_id=?"; 
        $params = array($tutorial_id);

        $row = db_query_one($query_for_names, $params); 

        echo "~~**~~" . $_POST['template_name'] . "~~**~~";	

        properties_display($xerte_toolkits_site,$tutorial_id,true,"name");

    }else{

    }

}
