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

_load_language_file("/website_code/php/workspaceproperties/rss_templates_template.inc");


include "../display_library.php";

include "workspace_library.php";

/**
 * connect to the database
 */

$prefix = $xerte_toolkits_site->database_table_prefix;

$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$query_for_rss_templates = "select * from {$prefix}templatedetails, "
. "{$prefix}templatesyndication where creator_id= ? and "
. "{$prefix}templatedetails.template_id  = {$prefix}templatesyndication.template_id "
. "and (rss= ? or export = ? or syndication = ?)" ;

$params = array($_SESSION['toolkits_logon_id'], 'true', 'true', 'true');
$query_rss_response = db_query($query_for_rss_templates, $params);

usort($query_rss_response, function($first, $second){
    return $first['template_id'] > $second['template_id'];
});

echo "<table class=\"workspaceProjectsTable\">";

echo "<caption>" . RSS_WORKSPACE_INTRO . "</caption>";

echo "<tr><th class=\"narrow\">" . WORKSPACE_LIBRARY_TEMPLATE_ID . "</th><th>" . WORKSPACE_LIBRARY_TEMPLATE_NAME . "</th>";

echo "<th>" . RSS_WORKSPACE_RSS . "</th><th>" . RSS_WORKSPACE_EXPORT . "</th><th>" . RSS_WORKSPACE_OPEN . "</th><th>" . RSS_WORKSPACE_OPEN_CATEGORY . "</th></tr>";

$path = $xerte_toolkits_site->site_url . "preview.php?template_id=";

foreach($query_rss_response as $row_template_name) {

    echo "<tr><td>" . $row_template_name['template_id'] . "</td>";
	
	echo "<td><a href=\"" . $path . $row_template_name['template_id'] . "\" target=\"_blank\">";
	
	echo str_replace("_"," ",$row_template_name['template_name']);
	
	
	echo "<span class=\"sr-only\">(" . WORKSPACE_LIBRARY_LINK_WINDOW . ")</span></a></td><td class=\"iconCell\">";

    if($row_template_name['rss'] == "true"){

        echo "<i class=\"fa fa-check\"></i><span class=\"sr-only\">" . RSS_WORKSPACE_ON . "</span>";

    }else{

		echo "<i class=\"fa fa-times\"></i><span class=\"sr-only\">" . RSS_WORKSPACE_OFF . "</span>";

    }

    echo "</td><td class=\"iconCell\">";
	
    if($row_template_name['export'] == "true"){

		echo "<i class=\"fa fa-check\"></i><span class=\"sr-only\">" . RSS_WORKSPACE_ON . "</span>";

    }else{

		echo "<i class=\"fa fa-times\"></i><span class=\"sr-only\">" . RSS_WORKSPACE_OFF . "</span>";

    }

    echo "</td><td class=\"iconCell\">";
	
	if($row_template_name['syndication'] == "true"){

		echo "<i class=\"fa fa-check\"></i><span class=\"sr-only\">" . RSS_WORKSPACE_ON . "</span>";

    }else{

		echo "<i class=\"fa fa-times\"></i><span class=\"sr-only\">" . RSS_WORKSPACE_OFF . "</span>";

    }
	
	echo "</td><td>";
	
	if($row_template_name['syndication'] == "true"){

        echo " " . $row_template_name['category'] . " ";

    }else{

        echo "-";

    }
	
	echo "</td></tr>";

}

echo "</table>";
