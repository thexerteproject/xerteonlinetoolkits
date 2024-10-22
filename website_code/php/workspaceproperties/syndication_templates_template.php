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
 * workspace templates template page, used displays the User created
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */


require_once("../../../config.php");

_load_language_file("/website_code/php/workspaceproperties/syndication_templates_template.inc");

include "../display_library.php";

include "workspace_library.php";

/**
 * connect to the database
 */
 
$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$prefix = $xerte_toolkits_site->database_table_prefix;

$query_for_rss_templates = "select * from  {$prefix}templatedetails, {$prefix}templaterights, {$prefix}templatesyndication where creator_id= ? "
. " and {$prefix}templatedetails.template_id = {$prefix}templaterights.template_id and {$prefix}templaterights.template_id  = {$prefix}templatesyndication.template_id and (role= ? or role=?) AND syndication = ?";

$params = array($_SESSION['toolkits_logon_id'], "creator", "co-author", "true");
$query_rss_response = db_query($query_for_rss_templates, $params);

usort($query_rss_response, function($first, $second){
    return $first['template_id'] > $second['template_id'];
});

echo "<table class=\"workspaceProjectsTable\">";

echo "<caption>" . SYNDICATION_TEMPLATE_INTRO . "</caption>";

echo "<tr><th class=\"narrow\">" . WORKSPACE_LIBRARY_TEMPLATE_ID . "</th><th>" . WORKSPACE_LIBRARY_TEMPLATE_NAME . "</th>";

echo "<th>" . SYNDICATION_TEMPLATE_TERM . "</th></tr>";

foreach($query_rss_response as $row_template_name) { 

    echo "<tr><td>" . $row_template_name['template_id'] . "</td><td>" . str_replace("_","",$row_template_name['template_name']) . "</td><td>";

    if($row_template_name['syndication']){

        echo " " . SYNDICATION_TEMPLATE_ON . " ";

    }else{

        echo " " . SYNDICATION_TEMPLATE_OFF . " ";

    }

    echo "</td></tr>";

}

echo "</table>";
