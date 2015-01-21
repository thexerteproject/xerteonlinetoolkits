<?php 
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
 * duplicate page, allows the site to duplicate a xerte module
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

$temp_dir_path="";
$temp_new_path="";

/**
 * 
 * Function create folder loop
 * This function creates folders needed when duplicating a template
 * @param string $foldername - the path to this folder
 * @param number $looplevel - a number to make sure that we enter and leave each folder correctly
 * @version 1.0
 * @author Patrick Lockley
 */

function create_folder_loop($folder_name,$loop_level){

    global $dir_path, $new_path, $temp_dir_path, $temp_new_path;

    while($f = readdir($folder_name)){

        $full = $dir_path . "/" . $f;

        if(is_dir($full)){

            if(($f==".")||($f=="..")){

            }else{

                $new_folder = opendir($full);
                $temp_dir_path = $dir_path;
                $temp_new_path = $new_path;
                $new_path = $new_path . "/" . $f;
                $dir_path=$full;

                if(@mkdir($new_path)){
                    if(@chmod($new_path, 0777)){

                        create_folder_loop($new_folder,++$loop_level);

                    }else{

                        receive_message($_SESSION['toolkits_logon_username'], "FILE_SYSTEM", "MAJOR", "Failed to set permissions on folder", "Failed to set correct rights on " . $new_path);

                        return false;
                    }
                }else{

                    receive_message($_SESSION['toolkits_logon_username'], "FILE_SYSTEM", "CRITICIAL", "Failed to create folder", "Failed to create folder " . $new_path);

                    return false;

                }


            }

        }else{

            $file_dest_path = $new_path . "/" . $f;
            if(@copy($full, $file_dest_path)){
                if(@chmod($file_dest_path, 0777)){


                }else{

                    receive_message($_SESSION['toolkits_logon_username'], "FILE_SYSTEM", "CRITICAL", "Failed to copy file", "Failed to copy file " . $full . " " . $file_dest_path);
                    return false;

                }
            }else{

                receive_message($_SESSION['toolkits_logon_username'], "FILE_SYSTEM", "MAJOR", "Failed to set rights on file", "Failed to set rights on file " . $full . " " . $file_dest_path);

                return false;

            }

        }
    }	

    $dir_path = $temp_dir_path;
    $new_path = $temp_new_path;

    /*
     * loop level is used to check for the recusion to make sure it has worked ok. A failure in this is not critical but is used in error reporting
     */

    $loop_level--;

    if($loop_level==-1){
        return true;
    }

}

/**
 * 
 * Function create folder loop
 * This function creates folders needed when duplicating a template
 * @param string $folder_name_id - the id of the new template
 * @param number $id_to_copy - the id of the old template
 * @param string $tutorial_id_from_post - The name of this tutorial type i.e Nottingham
 * @version 1.0
 * @author Patrick Lockley
 */

function duplicate_template($folder_name_id,$id_to_copy,$tutorial_id_from_post){

    global $dir_path, $new_path, $temp_dir_path, $temp_new_path, $xerte_toolkits_site;

    $dir_path = $xerte_toolkits_site->users_file_area_full . $id_to_copy. "-" . $_SESSION['toolkits_logon_username'] . "-" . $tutorial_id_from_post . "/";

    /*
     * Get the id of the folder we are looking to copy into
     */

    $new_path = $xerte_toolkits_site->users_file_area_full . $folder_name_id . "-" . $_SESSION['toolkits_logon_username'] . "-" . $tutorial_id_from_post . "/";

    $path = $xerte_toolkits_site->users_file_area_full . $folder_name_id  . "-" . $_SESSION['toolkits_logon_username'] . "-" . $tutorial_id_from_post . "/";

    if(mkdir($path)){

        if(@chmod($path,0777)){

            $d = opendir($dir_path);

            if(create_folder_loop($d,-1)){ 

                if(file_exists($new_path = $xerte_toolkits_site->users_file_area_full . $folder_name_id . "-" . $_SESSION['toolkits_logon_username'] . "-" . $tutorial_id_from_post . "/lockfile.txt")){

                    unlink($new_path = $xerte_toolkits_site->users_file_area_full . $folder_name_id . "-" . $_SESSION['toolkits_logon_username'] . "-" . $tutorial_id_from_post . "/lockfile.txt");

                }


                return true;

            }else{

                return false;	

            }

        }else{

            receive_message($_SESSION['toolkits_logon_username'], "FILE_SYSTEM", "MAJOR", "Failed to set rights on parent folder for template", "Failed to set rights on parent folder " . $path);

            return false;


        }
    }else{

        receive_message($_SESSION['toolkits_logon_username'], "FILE_SYSTEM", "CRITICAL", "Failed to create parent folder for template", "Failed to create parent folder " . $path);

        return false;

    }

}

?>
