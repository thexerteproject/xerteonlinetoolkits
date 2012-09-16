<?PHP     

/**
* 
* new template page, allows the site to make a new xerte module
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/


$temp_dir_path="";
$temp_new_path="";

// taken from php.net/manual/en/function.copy.php

define('DS', DIRECTORY_SEPARATOR); // I always use this short form in my code.

/**
 * 
 * Function sort out paramaters
 * This function creates folders needed when duplicating a template
 * @param number $folder_name_id - the id of this template
 * @param number $tutorial_id_from_post - the parent template name for the new tutorial
 * @version 1.0
 * @author Patrick Lockley
 */


function create_new_template($folder_name_id,$parent_template_name){

    global $dir_path, $new_path, $temp_dir_path, $temp_new_path, $xerte_toolkits_site;


    $row_framework = db_query_one("SELECT template_framework from {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails WHERE template_name = ?", array($parent_template_name));


    // I think this is wrong, currently looking like : /home/david/src/xerteonlinetoolkits/modules//templates/0 should presumably be home/david/src/xerteonlinetoolkits/modules/xerte/templates/Nottingham
    $dir_path = $xerte_toolkits_site->basic_template_path . $row_framework['template_framework'] . "/templates/" . $parent_template_name;

    /**
     * Get the id of the folder we are looking to copy into
     */

    _debug("Creating new template : $folder_name_id, $parent_template_name");
    $new_path = $xerte_toolkits_site->users_file_area_full . $folder_name_id . "-" . $_SESSION['toolkits_logon_username'] . "-" . $parent_template_name;
    $path = $xerte_toolkits_site->users_file_area_full . $folder_name_id . "-" . $_SESSION['toolkits_logon_username'] . "-" . $parent_template_name;
    if(is_dir($path)) {
        _debug("Trying to create new template at location - $path - it's already in use. Aborting");
        die("Template directory already exists; will not overwrite/re-create.");
    }
    if(mkdir($path)){
        _debug("Created $path ok");
        if(@chmod($path,0777)){
            return true;
        }else{
            _debug("Failed to set rights ");
            receive_message($_SESSION['toolkits_logon_username'], "FILE_SYSTEM", "MAJOR", "Failed to set rights on parent folder for template", "Failed to set rights on parent folder " . $path);
            return false;
        }
    }else{
        receive_message($_SESSION['toolkits_logon_username'], "FILE_SYSTEM", "CRITICAL", "Failed to create parent folder for template", "Failed to create parent folder " . $path);
        return false;
    }
}
