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
 * access change template, allows the site to see access properties for the template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once(dirname(__FILE__) . "/../../../config.php");

include "../template_status.php";
include "../user_library.php";
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

    global $row_access;

    if($row_access['access_to_whom']==$string){
        return true;
    }else{
        if(strcmp(substr($row_access['access_to_whom'],0,5),$string)==0){
            return true;
        }else{
            return false;
        }
    }
}

$database_connect_id = database_connect("Access template database connect success","Access template database connect failed");

/*
 * only creator can set access
 */

if(is_numeric($_POST['template_id'])){

    if(has_rights_to_this_template($_POST['template_id'],$_SESSION['toolkits_logon_id'])||is_user_admin()){

        access_display($xerte_toolkits_site, false);

    }else{

        access_display_fail();

    }		

}else{

    echo "<p>" . PROPERTIES_LIBRARY_ACCESS_FAIL . "</p>";

}
