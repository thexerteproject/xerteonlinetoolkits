<?php
/**
 * 
 * duplicate page, allows the site to edit a xerte module
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */


/**
 * 
 * Function create folder loop
 * This function outputs the xerte editor code
 * @param array $row_edit - the mysql query for this folder
 * @param number $xerte_toolkits_site - a number to make sure that we enter and leave each folder correctly
 * @param bool $read_status - a read only flag for this template
 * @param number $version_control - a setting to handle the delettion of lock files when the window is closed
 * @version 1.0
 * @author Patrick Lockley
 */

function output_editor_code($row_edit, $xerte_toolkits_site, $read_status, $version_control){

    require_once($xerte_toolkits_site->php_library_path . "database_library.php");
    require_once($xerte_toolkits_site->php_library_path . "display_library.php");

    $row_username = db_query_one("select username from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?" , array($row_edit['user_id']));

    if(empty($row_username)) {
        die("Invalid user id ?");
    }

    /**
     * create the preview xml used for editing
     */

    $preview = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/preview.xml";
    $data    = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/data.xml";

    if(!file_exists($preview) && file_exists($data)){
        copy($data, $preview);
        chmod($preview, 0777);
    }

    /**
     * set up the strings used in the flash vars
     */

    $string_for_flash_xml = $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/preview.xml";
    $string_for_flash_media = $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/media/";
    $string_for_flash_xwd = "modules/" . $row_edit['template_framework'] . "/parent_templates/" . $row_edit['template_name'] . "/";


    /**
     * sort of the screen sies required for the preview window
     */

    $temp = explode("~",get_template_screen_size($row_edit['template_name'],$row_edit['template_framework']));

    /**
     * set up the onunload function used in version control
     */

    if($version_control){

        echo edit_xerte_page_format_top(str_replace("$1", $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/",file_get_contents("modules/" . $row_edit['template_framework'] . "/edit_xerte_top")));

    }else{

        echo edit_xerte_page_format_top(str_replace("$1", $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/",file_get_contents("modules/" . $row_edit['template_framework'] . "/edit_xerte_top")));

    }

    /**
     * set up the flash vars the editor needs.
     */

    echo "\n";
    echo "so.addVariable(\"xmlvariable\", \"$string_for_flash_xml\");";
    echo "\n";
    echo "so.addVariable(\"rlovariable\", \"$string_for_flash_media\");";
    echo "\n";
    echo "so.addVariable(\"originalpathvariable\", \"$string_for_flash_xwd\");";
    echo "\n";
    echo "so.addVariable(\"template_id\", \"" . $row_edit['template_id'] . "\");";
    echo "\n";
    echo "so.addVariable(\"template_height\", \"" . $temp[1] . "\");";
    echo "\n";
    echo "so.addVariable(\"template_width\", \"" . $temp[0] . "\");";
    echo "\n";
    echo "so.addVariable(\"read_and_write\", \"" . $read_status . "\");";
    echo "\n";
    echo "so.addVariable(\"savepath\", \"" . $xerte_toolkits_site->flash_save_path . "\");";
    echo "\n";
    echo "so.addVariable(\"upload_path\", \"" . $xerte_toolkits_site->flash_upload_path . "\");";
    echo "\n";
    echo "so.addVariable(\"preview_path\", \"" . $xerte_toolkits_site->flash_preview_check_path . "\");";
    echo "\n";
    echo "so.addVariable(\"flv_skin\", \"" . $xerte_toolkits_site->flash_flv_skin . "\");";
    echo "\n";
    echo "so.addVariable(\"site_url\", \"" . $xerte_toolkits_site->site_url . "\");";
    echo "\n";
    echo "so.addVariable(\"apache\", \"" . $xerte_toolkits_site->apache . "\");";
    echo "\n";
    echo "so.write(\"flashcontent\");";
    echo "\n";
    echo "</script></body></html>";
    echo "\n";

}
?>
