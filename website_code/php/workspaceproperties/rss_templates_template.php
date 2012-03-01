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

_load_language_file("/website_code/php/workspaceproperties/rss_templates_template.inc");


include "../display_library.php";

include "workspace_library.php";

/**
 * connect to the database
 */

workspace_templates_menu();

$database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

$query_for_rss_templates = "select * from " . $xerte_toolkits_site->database_table_prefix . "templatedetails, " . $xerte_toolkits_site->database_table_prefix . "templaterights, " . $xerte_toolkits_site->database_table_prefix . "templatesyndication where creator_id=\"" . $_SESSION['toolkits_logon_id'] . "\"     and " . $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id = " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id and " . $xerte_toolkits_site->database_table_prefix . "templaterights.template_id  = " . $xerte_toolkits_site->database_table_prefix . "templatesyndication.template_id and (rss=\"true\" or export=\"true\")"; 

$query_rss_response = mysql_query($query_for_rss_templates);

workspace_menu_create();

echo "<div style=\"float:left; position:relative; width:15%; height:20px;\">" . RSS_WORKSPACE_RSS . "</div><div style=\"float:left; position:relative; width:15%; height:20px;\">" . RSS_WORKSPACE_EXPORT . "</div>";

while($row_template_name = mysql_fetch_array($query_rss_response)){

    echo "<div style=\"float:left; position:relative; width:50%;\">" . $row_template_name['template_name'] . "</div><div style=\"float:left; position:relative; width:15%;\">";

    if($row_template_name['rss']){

        echo " " . RSS_WORKSPACE_ON . " ";

    }else{

        echo " " . RSS_WORKSPACE_OFF . " ";

    }

    echo "</div><div style=\"float:left; position:relative; width:15%;\">";
    if($row_template_name['export']){

        echo " " . RSS_WORKSPACE_ON . " ";

    }else{

        echo " " . RSS_WORKSPACE_OFF . " ";

    }

    echo "</div>";

}

echo "</div></div>";

?>
