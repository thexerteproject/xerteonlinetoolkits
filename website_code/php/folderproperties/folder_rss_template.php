<?php
/**
 * 
 * folder rss page, used by the site to display a folder's rss settings
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

_load_language_file("/website_code/php/folderproperties/folder_rss_template.inc");

include "../url_library.php";

//connect to the database

$parameters = explode("_", $_POST['folder_id']);

if(count($parameters)!=1){

    if(is_numeric($parameters[0])&&is_string($parameters[1])){

        $database_connect_id = database_connect("Folder_rss_template.php database connect success", "Folder_rss_template.php database connect failed");

        $prefix = $xerte_toolkits_site->database_table_prefix;
        
        $query_for_folder_name = "select folder_name from {$prefix}folderdetails where folder_id=?";
        $params = array($_POST['folder_id']);

        $row_template_name = db_query_one($query_for_folder_name, $params);

        echo "<p class=\"header\"><span>" . FOLDER_RSS_FEEDS . "</span></p>";			

        echo "<p>" . FOLDER_RSS_PUBLIC . "</p>";

        
        $query_for_name = "select firstname, surname from {$prefix}logindetails where login_id=?";
        $params = array($_SESSION['toolkits_logon_id']);

        $row_name= db_query_one($query_for_name, $params);


        if($xerte_toolkits_site->apache=="true"){

            echo "<p><a target=\"new\" href=\"" .  $xerte_toolkits_site->site_url  . "RSS/" . $row_name['firstname'] . "_" . $row_name['surname'] . "/" .  str_replace(" ","_",$row_template_name['folder_name']) . "/\">" .  $xerte_toolkits_site->site_url  . "RSS/" . $row_name['firstname'] . "_" . $row_name['surname'] . "/" .  str_replace(" ","_",$row_template_name['folder_name']) . "/</a></p>";

        }else{

            echo "<p><a target=\"new\" href=\"" .  $xerte_toolkits_site->site_url  . "rss.php?username=" . $row_name['firstname'] . "_" . $row_name['surname']  . "&folder_name=" .  str_replace(" ","_",$row_template_name['folder_name']) . "\">" .  $xerte_toolkits_site->site_url  . "rss.php?username=" . $row_name['firstname'] . "_" . $row_name['surname'] . "&folder_name=" .  str_replace(" ","_",$row_template_name['folder_name']) . "</a></p>";

        }

    }

}