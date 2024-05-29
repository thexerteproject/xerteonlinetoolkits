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

_load_language_file("/website_code/php/workspaceproperties/peer_templates_template.inc");

include "../display_library.php";

include "workspace_library.php";
 $prefix = $xerte_toolkits_site->database_table_prefix;
/**
 * connect to the database
 */

$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$query_for_peer_templates = "select * from {$prefix}templatedetails, "
. "{$prefix}additional_sharing where creator_id= ? AND "
. "{$prefix}templatedetails.template_id  = {$prefix}additional_sharing.template_id and sharing_type=?";

$params = array( $_SESSION['toolkits_logon_id'], 'peer');
$query_peer_response = db_query($query_for_peer_templates, $params);

usort($query_peer_response, function($first, $second){
    return $first['template_id'] > $second['template_id'];
});

echo "<table class=\"workspaceProjectsTable\">";

echo "<caption>" . PEER_REVIEW_INTRO . "</caption>";

$path = $xerte_toolkits_site->site_url . "peer.php?template_id=";

echo "<tr><th class=\"narrow\">" . WORKSPACE_LIBRARY_TEMPLATE_ID . "</th><th>" . WORKSPACE_LIBRARY_TEMPLATE_NAME . "</th>";

echo "<th>" . PEER_REVIEW_PSWD . "</th></tr>";

foreach($query_peer_response as $row) {
	
	echo "<tr><td>" . $row['template_id'] . "</td>";
	
	echo "<td><a href=\"" . $path . $row['template_id'] . "\" target=\"_blank\">";
	
	echo str_replace("_"," ",$row['template_name']);
	
	echo "<span class=\"sr-only\">(" . WORKSPACE_LIBRARY_LINK_WINDOW . ")</span></a></td>";
	
	echo "<td>" . explode(',', $row['extra'])[0] . "<button class=\"copyBtn\" onclick=\"javascript:navigator.clipboard.writeText('" . explode(',', $row['extra'])[0] . "');\" title=\"" . PEER_REVIEW_COPY . "\"><i class=\"fa fa-copy\"></i><span class=\"sr-only\">" . PEER_REVIEW_COPY . "</span></button></td></tr>";

}

echo "</table>";
