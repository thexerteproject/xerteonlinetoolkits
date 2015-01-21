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
 * syndication change template, adds a template to the syndication RSS
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";

include "../user_library.php";
include "../url_library.php";	
include "properties_library.php";
$prefix = $xerte_toolkits_site->database_table_prefix;

if(is_numeric($_POST['tutorial_id'])){

    $database_connect_id = database_connect("syndication change template database connect success", "syndication change template database connect failed");

    if(is_user_creator($_POST['tutorial_id'])||is_user_admin()){

        $query_for_syndication_status = "select syndication from {$prefix}templatesyndication where template_id=?";
        $params = array($_POST['tutorial_id']);

        $query_for_syndication_response = db_query($query_for_syndication_status, $params);

        if(sizeof($query_for_syndication_response)==0){

            $query_to_change_syndication_status = "INSERT into {$prefix}templatesyndication(template_id,syndication,keywords,description,category,license) VALUES (?,?,?,?,?,?)";
            $params = array($_POST['tutorial_id'], $_POST['synd'], $_POST['keywords'], $_POST['description'], $_POST['category_value'], $_POST['license_value']);

        }else{

            $query_to_change_syndication_status = "UPDATE {prefix}templatesyndication SET "
                    . "syndication = ?, keywords = ?, description = ?, category = ?, license = ? WHERE template_id=?";
            $params = array($_POST['synd'], $_POST['keywords'], $_POST['description'], $_POST['category_value'], $_POST['license_value'], $_POST['tutorial_id']);
        }

        $query_to_change_syndication_status_response = db_query($query_to_change_syndication_status, $params);

        /**
         * Check template is public
         */

        if(template_access_settings($_POST['tutorial_id'])=="Public"){

            syndication_display($xerte_toolkits_site,true);

        }else{

            syndication_not_public($xerte_toolkits_site);

        }


    }else{

        syndication_display_fail();

    }

}

