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
 * notes change template, updates a users notes on a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");

include "../user_library.php";

include "properties_library.php";

if(is_numeric($_POST['template_id'])){

    $database_id = database_connect("notes change template database connect success","notes change template database connect failed");
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = "update {$prefix}templaterights SET notes = ?  WHERE template_id = ?";

    $params = array($_POST['notes'], $_POST['template_id']);
    
    
    if(db_query($query, $params)){

        notes_display($_POST['notes'],true, $_POST['template_id']);

    }else{
        notes_display($_POST['notes'],false, $_POST['template_id']);
    }

}
