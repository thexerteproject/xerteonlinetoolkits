<?php
/**
 * 
 * folder content page, used by the site to display a folder's contents
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */


require_once("../../../config.php");

include "../display_library.php";

/**
 * connect to the database
 */

if(is_numeric($_POST['folder_id'])){

    $database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

    echo "<p class=\"header\"><span>Folder contents</span></p>";			

    echo "<div class=\"mini_folder_content\">";

    list_folder_contents_event_free(mysql_real_escape_string($_POST['folder_id']));

    echo "</div>";

}

?>
