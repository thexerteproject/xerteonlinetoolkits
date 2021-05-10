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
 
header("Content-Type: application/xml; charset=utf-8");

require_once(dirname(__FILE__) . "/config.php");
_load_language_file("/rss.inc");

include $xerte_toolkits_site->php_library_path . "url_library.php";

$query_modifier = "rss";

$action_modifder = "play";

if(isset($_GET['export'])){

    $query_modifier = "export";

    $action_modifder = "export";

}
if(isset($_GET['html5'])){

    $query_modifier = "rss";

    $action_modifder = "play_html5";

}

if(!isset($_GET['username'])){

    /*
     * Change this to reflect site settings
     */

    echo "<rss version=\"2.0\"
                    xmlns=\"http://backend.userland.com/rss2\"
                    xmlns:xerte=\"http://xerte.org.uk/rssDownload\">
        <channel><title>{$xerte_toolkits_site->name}</title>
        <link>{$xerte_toolkits_site->site_url}</link>
        <description>" . RSS_DESCRIPTION . " " . $xerte_toolkits_site->name . "</description>
        <language>" . RSS_LANGUAGE . "</language>
        <image><title>{$xerte_toolkits_site->name}</title>
        <url>{$xerte_toolkits_site->site_url}website_code/images/xerteLogo.jpg</url>
        <link>{$xerte_toolkits_site->site_url}</link></image>";


}else{
    // Construct the name as will be done by the software by concatenating first and lastname and replacing space with '_'
    $query_created_by = "select login_id, firstname, surname from {$xerte_toolkits_site->database_table_prefix}logindetails where replace(concat(firstname, '_', surname), ' ', '_')=?";
    $params = array($_GET['username']);
    $rows = db_query($query_created_by, $params);

    if(sizeof($rows) == 0) {
        header("HTTP/1.0 404 Not Found");
        exit(0);
    }else{
        $temp_array = array($rows[0]['firstname'], $rows[0]['surname']);

        $folder_string = 'public';
        if(isset($_GET['folder_name'])){
            $folder_string = " - " . _html_escape(str_replace("_", " ", $_GET['folder_name']));
        }

        echo "<rss version=\"2.0\"
                    xmlns=\"http://backend.userland.com/rss2\"
                    xmlns:xerte=\"http://xerte.org.uk/rssDownload\">
        <channel><title>{$xerte_toolkits_site->name}</title>
        <link>{$xerte_toolkits_site->site_url}</link>
        <description>" . RSS_DESCRIPTION . " " . $xerte_toolkits_site->name . "</description>
        <language>" . RSS_LANGUAGE . "</language>
        <image><title>{$xerte_toolkits_site->name}</title>
        <url>{$xerte_toolkits_site->site_url}website_code/images/xerteLogo.jpg</url>
        <link>{$xerte_toolkits_site->site_url}</link></image>";

		$row_create = $rows[0];

    }
}

$params = array();

if(!isset($_GET['username'])){
    $query = "select td.*, ts.*,ot.template_framework
        FROM {$xerte_toolkits_site->database_table_prefix}templatedetails td, {$xerte_toolkits_site->database_table_prefix}templatesyndication ts, {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails ot
        WHERE $query_modifier='true' AND td.template_id = ts.template_id AND td.template_type_id=ot.template_type_id";

}else{
    if(!isset($_GET['folder_name'])){
        $query = "select td.*,ts.*,ot.template_framework
            FROM {$xerte_toolkits_site->database_table_prefix}templatedetails td, {$xerte_toolkits_site->database_table_prefix}templatesyndication ts, {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails ot
            WHERE $query_modifier='true' AND creator_id=? AND td.template_id = ts.template_id AND td.template_type_id=ot.template_type_id";
        $params[] = $row_create['login_id'];
    }else{
        $row_folder = db_query_one("SELECT folder_id FROM {$xerte_toolkits_site->database_table_prefix}folderdetails WHERE 
            folder_name = ? or folder_name = ?", array(str_replace("_", " ", $_GET['folder_name']), $_GET['folder_name']));

        if(empty($row_folder)) {
            die("Invalid folder name");
        }

        $query = "select td.*, ts.*, tr.*, ot.template_framework from 
            {$xerte_toolkits_site->database_table_prefix}templaterights tr, 
            {$xerte_toolkits_site->database_table_prefix}templatedetails td, 
            {$xerte_toolkits_site->database_table_prefix}templatesyndication ts,
            {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails ot 
            WHERE folder = ?
            AND tr.template_id = td.template_id 
            AND ts.template_id = tr.template_id
            AND td.template_type_id=ot.template_type_id 
            AND $query_modifier='true'";
        $params[] = $row_folder['folder_id'];
    }

}

$rows = db_query($query, $params);

foreach($rows as $row) {

    if(!isset($_GET['username'])){
        $row_creator = db_query_one("SELECT firstname,surname from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?", array($row['creator_id']));
        $user = $row_creator['firstname'] . " " . $row_creator['surname'];
    }else{
        // revert back to $_GET['usenrame'] parsed value(s)
        $user = $temp_array[0] . " " . $temp_array[1];
    }

    $action = 'play';
    if(isset($_GET['export'])){
        $action = 'export';
    }
	if(isset($_GET['html5'])){
        $action = 'play_html5';
    }
    echo "<item>
        <title>" . str_replace("_"," ",$row['template_name']) . "</title>
        <link><![CDATA[" . $xerte_toolkits_site->site_url . url_return($action, $row['template_id']) . "]]></link>
        <description><![CDATA[" . $row['description'] . "<br><br>" . str_replace("_"," ",$row['template_name']) . " " . RSS_DEVELOP . $user . "]]></description>
        <pubDate>" . date(DATE_RSS, strtotime($row['date_modified'])) . "</pubDate>
        <guid><![CDATA[" . $xerte_toolkits_site->site_url . url_return($action, $row['template_id']) . "]]></guid>
        <xerte:xertedescription><![CDATA[" . $row['description'] . "]]></xerte:xertedescription>
        <xerte:xertetemplatename>" . str_replace("_"," ",$row['template_name']) . "</xerte:xertetemplatename>
        <xerte:xerteauthor>" . $user . "</xerte:xerteauthor>";

    if ($row['export'] == "true")
    {
        echo "<xerte:exportlink><![CDATA[" . $xerte_toolkits_site->site_url . url_return('export', $row['template_id']) . "]]></xerte:exportlink>";
        if ($row['template_framework'] == 'xerte') {

            echo "<xerte:scorm12link><![CDATA[" . $xerte_toolkits_site->site_url . url_return('export', $row['template_id']) . "]]></xerte:scorm12link>
            <xerte:scorm2004link><![CDATA[" . $xerte_toolkits_site->site_url . url_return('export', $row['template_id']) . "]]></xerte:scorm2004link>";
        }
    }
    echo "<xerte:keywords>" . $row['keywords'] . "</xerte:keywords>
        <xerte:syndication>" . $row['syndication'] . "</xerte:syndication>
        <xerte:license>" . $row['license'] . "</xerte:license>
        </item>\n";
}

echo "
    </channel>
    </rss>";

function _html_escape($string) {
    return htmlentities($string, ENT_QUOTES, null, false);
}

?>
