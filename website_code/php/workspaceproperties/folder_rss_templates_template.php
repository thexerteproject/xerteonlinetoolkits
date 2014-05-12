<?php
/**
 * 
 * workspace templates template page, used displays the User created
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

_load_language_file("/website_code/php/workspaceproperties/folder_rss_templates_template.inc");

include "../url_library.php";
include "../display_library.php";

/**
 * connect to the database
 */

$database_connect_id = database_connect("my_propertes_template.php connect success","my_properties_template.php connect failed");

$prefix = $xerte_toolkits_site->database_table_prefix;
$query_for_folder = "select * from {$prefix}folderdetails where login_id= ? AND folder_parent != ? ";
$params = array($_SESSION['toolkits_logon_id'], "0");

$query_folder_response = db_query($query_for_folder, $params);

echo "<p class=\"header\"><span>" . FOLDER_RSS_TEMPLATE_MY . "</span></p>";

echo "<p>" . FOLDER_RSS_TEMPLATE_MY_FEED . "<br/><a href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_user", $_SESSION['toolkits_firstname'] . "_" . $_SESSION['toolkits_surname'] ) . "\" target=\"new\"> " . $xerte_toolkits_site->site_url . url_return("RSS_user", $_SESSION['toolkits_firstname'] . "_" . $_SESSION['toolkits_surname'] ) . "</a></p>";

if(sizeof($query_folder_response)!=0){

    echo "<p>" . FOLDER_RSS_TEMPLATE_MY_FOLDER_FEED . "</p>";
    foreach($query_folder_response as $row_folder) {

        echo "<p><a href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_user", $_SESSION['toolkits_firstname'] . "_" . $_SESSION['toolkits_surname'] );

        if($xerte_toolkits_site->apache=="true"){

            echo "/" . str_replace("_"," ",$row_folder['folder_name']) . "/";

        }else{

            echo "&folder_name=" . str_replace("_"," ",$row_folder['folder_name']);

        }

        echo "\" target=\"new\">" . $xerte_toolkits_site->site_url . url_return("RSS_user", $_SESSION['toolkits_firstname'] . "_" . $_SESSION['toolkits_surname'] ); 

        if($xerte_toolkits_site->apache=="true"){

            echo str_replace("_"," ",$row_folder['folder_name']) . "/";

        }else{

            echo "&folder_name=" . str_replace("_"," ",$row_folder['folder_name']);	

        }

        echo "</a></p>";

    }

}

