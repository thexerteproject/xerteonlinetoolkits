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

if (!isset($_POST['tutorial_id']))
{
    die('Invalid template_id');
}
$template_id = x_clean_input($_POST['tutorial_id'], 'numeric');

$database_connect_id = database_connect("syndication change template database connect success", "syndication change template database connect failed");

if(is_user_creator_or_coauthor($template_id)||s_user_permitted("projectadmin")){

    $query_for_syndication_status = "select syndication from {$prefix}templatesyndication where template_id=?";
    $params = array($template_id);

    $query_for_syndication_response = db_query($query_for_syndication_status, $params);

    if(sizeof($query_for_syndication_response)==0){

        $query_to_change_syndication_status = "INSERT into {$prefix}templatesyndication(template_id,syndication,keywords,description,category,license) VALUES (?,?,?,?,?,?)";
        $params = array($template_id, x_clean_input($_POST['synd']), x_clean_input($_POST['keywords']), x_clean_input($_POST['description']), x_clean_input($_POST['category_value']), x_clean_input($_POST['license_value']));

    }else{

        $query_to_change_syndication_status = "UPDATE {$prefix}templatesyndication SET "
                . "syndication = ?, keywords = ?, description = ?, category = ?, license = ? WHERE template_id=?";
        $params = array(x_clean_input($_POST['synd']), x_clean_input($_POST['keywords']), x_clean_input($_POST['description']), x_clean_input($_POST['category_value']), x_clean_input($_POST['license_value']), $template_id);
    }

    $query_to_change_syndication_status_response = db_query($query_to_change_syndication_status, $params);

    // Update templatedetails modify date
    $sql = "update {$xerte_toolkits_site->database_table_prefix}templatedetails set date_modified=? where template_id=?";
    $params = array(date("Y-m-d H:i:s"), $template_id);
    db_query_one($sql, $params);

    /**
     * Check template is public
     */

    if(template_access_settings($template_id)=="Public"){

        syndication_display($xerte_toolkits_site, $template_id,true);

    }else{

        syndication_not_public($xerte_toolkits_site);

    }


}else{

    syndication_display_fail(true);

}


