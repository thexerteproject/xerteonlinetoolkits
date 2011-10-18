<?php
/**
 * 
 * rename template, allows a user to rename a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";
include "../screen_size_library.php";
include "../url_library.php";
include "properties_library.php";

if(is_numeric($_POST['template_id'])){

    $tutorial_id = mysql_real_escape_string($_POST['template_id']);

    $database_id = database_connect("Template rename database connect success","Template rename database connect failed");

    $query = "update " . $xerte_toolkits_site->database_table_prefix . "templatedetails SET template_name =\"" . str_replace(" ", "_", mysql_real_escape_string($_POST['template_name'])) . "\" WHERE template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";

    if(mysql_query($query)){

        $query_for_names = "select template_name, date_created, date_modified from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where template_id=\"". $tutorial_id . "\"";

        $query_names_response = mysql_query($query_for_names);

        $row = mysql_fetch_array($query_names_response);

        echo "~~**~~" . $_POST['template_name'] . "~~**~~";	

        properties_display($xerte_toolkits_site,$tutorial_id,true);

    }else{

    }

    mysql_close($database_id);

}

?>
