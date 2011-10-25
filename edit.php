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

require_once("config.php");

require $xerte_toolkits_site->php_library_path . "screen_size_library.php";
require $xerte_toolkits_site->php_library_path . "template_status.php";
require $xerte_toolkits_site->php_library_path . "display_library.php";
require $xerte_toolkits_site->php_library_path . "user_library.php";

/**
 * 
 * Function update_access_time
 * This function updates the time a template was last edited
 * @param array $row_edit = an array returned from a mysql query
 * @return bool True or False if two params match
 * @version 1.0
 * @author Patrick Lockley
 */

function update_access_time($row_edit){

    global $xerte_toolkits_site;

    return db_query("UPDATE {$xerte_toolkits_site->database_table_prefix}templatedetails SET date_accessed=? WHERE template_id = ?", array(date('Y-m-d'), $row_edit['template_id']));

}


/*
 * Check the template ID is numeric
 */

if(!isset($_GET['template_id']) || !is_numeric($_GET['template_id'])) {
    _debug("Template id is not numeric. ->" . $_GET['template_id']);
    require $xerte_toolkits_site->root_file_path . "modules/" . $row_edit['template_framework'] . "/edit.php";
    dont_show_template();
    exit(0);
}

/*
 * Find out if this user has rights to the template	
 */

$safe_template_id = (int) $_GET['template_id'];

$query_for_edit_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

$query_for_edit_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_edit_content_strip);

$query_for_edit_content_response = mysql_query($query_for_edit_content);

$row_edit = mysql_fetch_array($query_for_edit_content_response);

if(has_rights_to_this_template($safe_template_id,$_SESSION['toolkits_logon_id'])){	

    /*
     * Check if user is editor (could be read only)
     */

    if(is_user_an_editor($safe_template_id,$_SESSION['toolkits_logon_id'])){

        /*
         * Check for multiple editors
         */

        if(has_template_multiple_editors($safe_template_id)){

            /*
             * Check for lock file. A lock file is created to prevent more than one 
             */

            if(file_exists($xerte_toolkits_site->users_file_area_full . $row_edit['template_id'] . "-" . $row_edit['username'] . "-" . $row_edit['template_name'] . "/lockfile.txt")){

                /*
                 * Lock file exists, so open it up and see who created it
                 */	

                $lock_file_data = file_get_contents($xerte_toolkits_site->users_file_area_full . $row_edit['template_id'] . "-" . $row_edit['username'] . "-" . $row_edit['template_name'] . "/lockfile.txt");

                $temp = explode("*",$lock_file_data);

                if(count($temp)==1){

                    $temp = explode(" ",$lock_file_data);					

                }

                $lock_file_creator = $temp[0];

                /*
                 * Check if lock file creator is current user, if so, continue into the code
                 */

                if($lock_file_creator==$_SESSION['toolkits_logon_username']){

                    if(update_access_time($row_edit)){

                        /*
                         * Display the editor
                         */

                        require $xerte_toolkits_site->root_file_path . "modules/" . $row_edit['template_framework'] . "/edit.php";

                        output_editor_code($row_edit, $xerte_toolkits_site, "true", true);			

                    }else{

                        /*
                         * Show an error
                         */

                        error_show_template();

                    }

                }else{

                    if(isset($_POST['lockfile_clear'])){

                        /*
                         * Delete the lockfile
                         */

                        $file_handle = fopen($xerte_toolkits_site->users_file_area_full . $row_edit['template_id'] . "-" . $row_edit['username'] . "-" . $row_edit['template_name'] . "/lockfile.txt", 'w');

                        fwrite($file_handle, $_SESSION['toolkits_logon_username'] . "*");

                        fclose($file_handle);

                        /*
                         * Update the time this template was last edited
                         */

                        if(update_access_time($row_edit)){

                            require $xerte_toolkits_site->root_file_path . "modules/" . $row_edit['template_framework'] . "/edit.php";

                            output_editor_code($row_edit, $xerte_toolkits_site, "true", true);			

                        }else{

                            error_show_template();

                        }

                    }else{

                        /*
                         * Update the lock file. The lock file format is creator id*id that tried to access 1 <space> id that tried to access 2 and so on
                         */

                        $new_lock_file = $lock_file_data . $_SESSION['toolkits_logon_username'] . " ";

                        $file_handle = fopen($xerte_toolkits_site->users_file_area_full . $row_edit['template_id'] . "-" . $row_edit['username'] . "-" . $row_edit['template_name'] . "/lockfile.txt",'w');

                        fwrite($file_handle, $new_lock_file);

                        fclose($file_handle);

                        output_locked_file_code($lock_file_creator);

                    }

                }

            }else{

                /*
                 * No lock file, so create one
                 */

                $file_handle = fopen($xerte_toolkits_site->users_file_area_full . $row_edit['template_id'] . "-" . $row_edit['username'] . "-" . $row_edit['template_name'] . "/lockfile.txt", 'w');

                fwrite($file_handle, $_SESSION['toolkits_logon_username'] . "*");

                fclose($file_handle);

                /*
                 * Update the time this template was last edited
                 */

                if(update_access_time($row_edit)){

                    require $xerte_toolkits_site->root_file_path . "modules/" . $row_edit['template_framework'] . "/edit.php";

                    output_editor_code($row_edit, $xerte_toolkits_site, "true", true);			

                }else{

                    error_show_template();

                }

            }

        }else{

            /*
             * One editor (but shared) for this prohect, so continue without creating a lock file
             */

            if(update_access_time($row_edit)){
                require $xerte_toolkits_site->root_file_path . "modules/" . $row_edit['template_framework'] . "/edit.php";
                output_editor_code($row_edit, $xerte_toolkits_site, "true", false);			
            }else{
                error_show_template();		

            }

        }

    }else{

        /*
         * One editor (and no sharing) for this prohect, so continue without creating a lock file
         */

        if(update_access_time($row_edit)){
            _debug("editphp - no sharing etc");
            require $xerte_toolkits_site->root_file_path . "modules/" . $row_edit['template_framework'] . "/edit.php";

            output_editor_code($row_edit, $xerte_toolkits_site, "false", false);			

        }else{

            error_show_template();			

        }


    }

}else if(is_user_admin()){

    /*
     * Is the current user an administrator - If so access here.
     */

    require $xerte_toolkits_site->root_file_path . "modules/" . $row_edit['template_framework'] . "/edit.php";

    output_editor_code($row_edit, $xerte_toolkits_site, "false", false);	

}else{

    /*
     * Wiki mode - check to see if template allows anonymous editing.
     */

    $string_for_flash_xml = $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/data.xml";

    $buffer = file_get_contents($string_for_flash_xml);

    if(strpos($buffer,"editable=true")==false){	

        /*
         * Wiki mode not set
         */	

    }else{

        /*
         * Wiki mode set
         */	

        require $xerte_toolkits_site->root_file_path . "modules/" . $row_edit['template_framework'] . "/edit.php";

        output_editor_code($row_edit, $xerte_toolkits_site, "true", false);	

    }

}

