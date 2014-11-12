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
 * access change template, allows the site to set access properties for the template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../user_library.php";
include "../template_status.php";

include "properties_library.php";

/**
 * 
 * Function template share status
 * This function checks the current access setting against a string
 * @param string $string - string to check against the database
 * @return bool True or False if two params match
 * @version 1.0
 * @author Patrick Lockley
 */

function template_share_status($string){

    if($_POST['access']==$string){
        return true;
    }else{
        if(strpos($string,"other-"==0)){
            return true;
        }else{		
            return false;
        }
    }

}

$database_id = database_connect("Access change database connect success","Access change database connect failed");

/*
 * Update the database setting
 */
$prefix = $xerte_toolkits_site->database_table_prefix;

 $query = "UPDATE {$prefix}templatedetails SET access_to_whom = ? WHERE template_id = ?";
if(isset($_POST['server_string'])){
    $access_to_whom = $_POST['access'] . '-' . $_POST['server_string'];    
}else{
    $access_to_whom = $_POST['access'];
}

$params = array($access_to_whom, $_POST['template_id']);
$ok = db_query($query, $params);

if($ok) {
    access_display($xerte_toolkits_site, true);

}else {

    access_display_fail();
}
