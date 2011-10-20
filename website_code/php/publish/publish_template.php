<?php
/**
 * 
 * Edit page, brings up the xerte editor window
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

require "../screen_size_library.php";
require "../template_status.php";
require "../display_library.php";
require "../user_library.php";

/**
 * 
 * Function update_access_time
 * This function updates the time a template was last edited
 * @param array $row_edit = an array returned from a mysql query
 * @return bool True or False if two params match
 * @version 1.0
 * @author Patrick Lockley
 */

/*
 * Connect to the database
 */

$mysql_id = database_connect("Edit database connect successful","Edit database connect failed");

/*
 * Check the template ID is numeric
 */

if(is_numeric(mysql_real_escape_string($_POST['template_id']))){

    /*
     * Find out if this user has rights to the template	
     */

    $safe_template_id = mysql_real_escape_string($_POST['template_id']);

    $query_for_edit_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

    $query_for_edit_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_edit_content_strip);

    $query_for_edit_content_response = mysql_query($query_for_edit_content);

    $row_publish = mysql_fetch_array($query_for_edit_content_response);

    if(is_user_an_editor($safe_template_id,$_SESSION['toolkits_logon_id'])){

        $file = file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $safe_template_id . "-" . $row_publish['username'] . "-" . $row_publish['template_name'] . "/preview.xml");

        $fh = fopen($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $safe_template_id . "-" . $row_publish['username'] . "-" . $row_publish['template_name'] . "/data.xml", 'w');

        fwrite($fh,$file);

        fclose($fh);

        echo template_access_settings($safe_template_id);			

    }

}else{

    echo "Sorry you are not an editor of this template and so cannot publish it";

}

?>
