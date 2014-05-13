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

_load_language_file("/website_code/php/folderproperties/folder_content_template.inc");


include "../display_library.php";

/**
 * connect to the database
 */

if(is_numeric($_POST['folder_id'])){

    $database_connect_id = database_connect("Folder_content_template.php connect success","Folder_content_template.php connect failed");

    echo "<p class=\"header\"><span>" . FOLDER_CONTENT_TEMPLATE_CONTENTS . "</span></p>";			
    list_folder_contents_event_free($_POST['folder_id']);
    
}

?>
