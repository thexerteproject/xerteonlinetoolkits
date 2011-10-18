<?php

header("Content-Type: application/xml; charset=ISO-8859-1");  

require_once "config.php";
_load_language_file("/rss.inc");

include $xerte_toolkits_site->php_library_path . "url_library.php";

function normal_date($string){
    $temp = explode("-", $string);
    return $temp[2] . "/" . $temp[1] . "/" . $temp[0];
}

$query_modifier = "rss";

$action_modifder = "play";

if(isset($_GET['export'])){

    $query_modifier = "export";

    $action_modifder = "export";

}

if(!isset($_GET['username'])){

    /*
     * Change this to reflect site settings
     */

    echo "<rss version=\"2.0\">
        <channel><title>{$xerte_toolkits_site->name}</title>
        <link>{$xerte_toolkits_site->site_url}</link>
        <description>" . RSS_DESCRIPTION . " " . $xerte_toolkits_site->name . "</description>
        <language>" . RSS_LANGUAGE . "</language>
        <image><title>{$xerte_toolkits_site->name}</title>
        <url>{$xerte_toolkits_site->site_url}website_code/images/xerteLogo.jpg</url>
        <link>{$xerte_toolkits_site->site_url}</link></image>";


}else{  

    $temp_array = explode("_",$_GET['username']);

    $query_created_by = "select login_id from {$xerte_toolkits_site->database_table_prefix}logindetails where (firstname=? AND surname = ?)";
    $rows = db_query($query_created_by, array($temp_array[0], $temp_array[1]));

    if(sizeof($rows) == 0) {
        header("HTTP/1.0 404 Not Found");
        exit(0);
    }else{

        $folder_string = 'public';
        if(isset($_GET['folder_name'])){
            $folder_string = " - " . _html_escape(str_replace("_", " ", $_GET['folder_name']));
        }

        echo "<rss version=\"2.0\"><channel>
            <title>" . _html_escape($temp_array[0]) . " " . _html_escape($temp_array[1]) . RSS_LO . " - " . {$xerte_toolkits_site->name}</title>
            <link>{$xerte_toolkits_site->site_url}</link>
            <description>" . RSS_FEED_DESC . _html_escape($temp_array[0]) . " " . _html_escape($temp_array[1]) . RSS_PLURAL . " {$folder_string} . " . RSS_FEED_PUBLIC . {$xerte_toolkits_site->name}</description>
            <language>en-gb</language>
            <image>
            <title>{$xerte_toolkits_site->rss_title}</title>
            <url>{$xerte_toolkits_site->site_url}website_code/images/xerteLogo.jpg</url>
            <link>{$xerte_toolkits_site->site_url}</link></image>";
        $row_create = $rows[1];

    }
}

$params = array();

if(!isset($_GET['username'])){
    $query = "select {$xerte_toolkits_site->database_table_prefix}templatedetails.template_id,creator_id,date_created,template_name,description 
        FROM {$xerte_toolkits_site->database_table_prefix}templatedetails, {$xerte_toolkits_site->database_table_prefix}templatesyndication 
        WHERE $query_modifier='true' AND {$xerte_toolkits_site->database_table_prefix}templatedetails.template_id = {$xerte_toolkits_site->database_table_prefix}templatesyndication.template_id";

}else{
    if(!isset($_GET['folder_name'])){
        $query = "select {$xerte_toolkits_site->database_table_prefix}templatedetails.template_id,creator_id,date_created,template_name,description 
            FROM {$xerte_toolkits_site->database_table_prefix}templatedetails, {$xerte_toolkits_site->database_table_prefix}templatesyndication 
            WHERE $query_modifier='true' AND creator_id=? AND {$xerte_toolkits_site->database_table_prefix}templatedetails.template_id = {$xerte_toolkits_site->database_table_prefix}templatesyndication.template_id";
        $params[] = $row_create['login_id'];
    }else{
        $row_folder = db_query_one("SELECT folder_id FROM {$xerte_toolkits_site->database_table_prefix}folderdetails WHERE folder_name = ?", array(str_replace("_", " ", $_GET['folder_name'])));

        if(empty($row_folder)) {
            die("Invalid folder name");
        }

        $query = "select * from {$xerte_toolkits_site->database_table_prefix}templaterights, {$xerte_toolkits_site->database_table_prefix}templatedetails, {$xerte_toolkits_site->database_table_prefix}templatesyndication 
            WHERE folder = ?
            AND {$xerte_toolkits_site->database_table_prefix}templaterights.template_id = {$xerte_toolkits_site->database_table_prefix}templatedetails.template_id 
            AND {$xerte_toolkits_site->database_table_prefix}templatesyndication.template_id = {$xerte_toolkits_site->database_table_prefix}templaterights.template_id and rss = 'true'";
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
    echo "<item>
        <title>" . str_replace("_"," ",$row['template_name']) . "</title>
        <link><![CDATA[" . $xerte_toolkits_site->site_url . url_return($action, $row['template_id']) . "]]></link>
        <description><![CDATA[" . $row['description'] . "<br><br>" . str_replace("_"," ",$row['template_name']) . RSS_DEVELOP . $user . "]]></description>
        <pubDate>" . date(DATE_RSS, strtotime($row['date_created'])) . "</pubDate>
        <guid><![CDATA[" . $xerte_toolkits_site->site_url . url_return($action, $row['template_id']) . "]]></guid>
        </item>\n";
}

echo "
    </channel>
    </rss>";

function _html_escape($string) {
    return htmlentities($string, ENT_QUOTES, null, false);
}

?>
