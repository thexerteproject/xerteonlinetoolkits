<?php
header("Content-Type: application/xml; charset=iso-8859-1");

require_once(dirname(__FILE__) . "/config.php");

_load_language_file("/syndicate.inc");

include $xerte_toolkits_site->php_library_path . "url_library.php";


$query = "SELECT {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails.template_name as origname, username, {$xerte_toolkits_site->database_table_prefix}logindetails.login_id, 
{$xerte_toolkits_site->database_table_prefix}templatedetails.template_id, keywords, creator_id, date_created, {$xerte_toolkits_site->database_table_prefix}templatedetails.template_name, 
license, category, export, {$xerte_toolkits_site->database_table_prefix}templatesyndication.description, firstname, surname 
FROM {$xerte_toolkits_site->database_table_prefix}templatedetails, {$xerte_toolkits_site->database_table_prefix}templatesyndication, {$xerte_toolkits_site->database_table_prefix}logindetails, 
{$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails 
WHERE syndication='true'
AND login_id = creator_id 
AND {$xerte_toolkits_site->database_table_prefix}templatedetails.template_id = {$xerte_toolkits_site->database_table_prefix}templatesyndication.template_id 
AND {$xerte_toolkits_site->database_table_prefix}templatedetails.template_type_id = {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails.template_type_id";

$rows = db_query($query);

echo "<" . "?xml version=\"1.0\" encoding=\"UTF-8\"?>
    <rss version=\"2.0\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:cc=\"http://web.resource.org/cc/\">
    <channel>
    <title>" .$xerte_toolkits_site->rss_title . "</title>
    <link>" . $xerte_toolkits_site->site_url . "</link><description>" . SYNDICATE_DESCRIPTION . $xerte_toolkits_site->synd_publisher . "</description><generator>Xerte Online Toolkits</generator><language>" . SYNDICATE_LANGUAGE . "</language><copyright>http://creativecommons.org/licenses/by-nc-sa/2.0/uk/ </copyright><lastBuildDate>" . date(DATE_RSS, time()-20000) ."</lastBuildDate><pubDate>" . date(DATE_RSS, time()-20000) . "</pubDate><dc:publisher>" . $xerte_toolkits_site->synd_publisher . "</dc:publisher><cc:license>" . $xerte_toolkits_site->synd_license . "</cc:license>"; 

foreach($rows as $row) {
    $_dataxml = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row['template_id'] . '-' . $row['username'] . '-' . $row['origname'] . '/data.xml';

    echo "<item><title>" . str_replace("_"," ",$row['template_name']) . "</title>
        <link>" . $xerte_toolkits_site->site_url . url_return("play" , $row['template_id']) . "</link>
        <dc:date>" . date(DATE_RSS, filemtime($_dataxml)) . "</dc:date>
        <description><![CDATA[" . $row['description'] . "<br>" . str_replace("_"," ",$row['template_name']) . " was developed by " . $row['firstname'] . " " . $row['surname'] . " <br/> This content has the following license - " . $row['license'];

    if($row['export']=="true"){

        echo "<br> " . SYNDICATE_DOWNLOAD . $xerte_toolkits_site->site_url . url_return("export", $row['template_id']);
        echo "<br> " . SYNDICATE_DOWNLOAD_SCORM . $xerte_toolkits_site->site_url . url_return("scorm", $row['template_id']);		

    }

    echo "]]></description><guid isPermaLink=\"true\">" . $xerte_toolkits_site->site_url . url_return("play",  $row['template_id']) . "</guid><dc:contributor>" . $xerte_toolkits_site->synd_publisher . "</dc:contributor><dc:creator>" . $row['surname'] . ", " . $row['firstname'] . " </dc:creator><dc:title>" . $row['template_name'] . "</dc:title><dc:type>Course</dc:type><dc:description><![CDATA[" . $row['description'] . "<br>" . str_replace("_"," ",$row['template_name']) . " was developed by " . $row['firstname'] . " " . $row['surname'] . "<Br> This content has the following license - " . $row['license'];

    if($row['export']=="true"){

        echo "<br> " . SYNDICATE_DOWNLOAD . $xerte_toolkits_site->site_url . url_return("export", $row['template_id']);
        echo "<br> " . SYNDICATE_DOWNLOAD_SCORM . $xerte_toolkits_site->site_url . url_return("scorm", $row['template_id']);		


    }

    echo "]]></dc:description><dc:format>text/html</dc:format><dc:language>en-gb</dc:language><dc:relation><![CDATA[";

    if($row['export']=="true"){

        echo $xerte_toolkits_site->site_url . url_return("export", $row['template_id']) . "</dc:relation><dc:relation>";
        echo $xerte_toolkits_site->site_url . url_return("scorm", $row['template_id']);		

    }


    echo "]]></dc:relation><dc:publisher>" . $xerte_toolkits_site->synd_publisher . "</dc:publisher><dc:rights>" . $row['license'] . "</dc:rights>";

    $new_array = explode(",",$row['keywords']);

    while($word = array_pop($new_array)){

        echo "<dc:subject>" . $word . "</dc:subject>";

    }

    echo "<cc:license><![CDATA[" . $xerte_toolkits_site->synd_license . "]]></cc:license></item>";

}

echo "</channel></rss>";
