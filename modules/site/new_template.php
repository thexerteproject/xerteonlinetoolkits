<?PHP     
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

function copy_r( $path, $dest )
{
    if(preg_match('/\.svn/', $path)) {
        _Debug("Skipping .svn dir ($path)");
        return true;
    }
    _debug("Copying $path to $dest, recursively... ");
    
    if( is_dir($path) )
    {
        @mkdir( $dest );
        $objects = scandir($path);
        if( sizeof($objects) > 0 )
        {
            foreach( $objects as $file )
            {
                if( $file == "." || $file == ".." )
                    continue;
                // go on
                if( is_dir( $path.DS.$file ) )
                {
                    copy_r( $path.DS.$file, $dest.DS.$file );
                }
                else
                {
				
					if(strpos($file,".info")===FALSE){
				
						copy( $path.DS.$file, $dest.DS.$file );
						
					}
                }
            }
        }
        return true;
    }
    elseif( is_file($path) )
    {
        return copy($path, $dest);
    }
    else
    {
        return false;
    }
}

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
            $ok = copy_r($dir_path, $path);
            _debug("Copy_r returned " . print_r($ok, true));
            return $ok;
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
