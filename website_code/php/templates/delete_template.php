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
 * delete_template, allows the template to be deleted (placed in the recycle bin)
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
include "../user_library.php";
include "../deletion_library.php";
include "../template_status.php";

_load_language_file("/website_code/php/templates/delete_template.inc");

if(empty($_SESSION['toolkits_logon_id'])) {
            die("Please login");
}

/*
 * get the folder id to delete
 */
$prefix = $xerte_toolkits_site->database_table_prefix;


if(is_numeric($_POST['template_id'])){

    $safe_template_id = (int) $_POST['template_id'];

    if(!is_template_syndicated($safe_template_id)){

        if(is_user_creator($safe_template_id)){

            $query_for_folder_id = "select * from {$prefix}templaterights where template_id= ?"; 
            $params = array($safe_template_id);

            $row = db_query_one($query_for_folder_id, $params); 

            // delete from the database 

            $query_to_delete_template = "UPDATE {$prefix}templaterights set folder= ? WHERE template_id = ? AND user_id = ?";
            $params = array(get_recycle_bin(), $safe_template_id, $_SESSION['toolkits_logon_id']);
            
            if(db_query($query_to_delete_template, $params)){

                receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Moved file to users recycle bin", "Moved file to users recycle bin");

            }else{

                receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to move file to the recycle bin", "Failed to move file to the recycle bin");	

            }


        }else{

            echo DELETE_TEMPLATE_NOT_CREATOR;

        }

    }else{

        echo DELETE_TEMPLATE_SYNDICATED;

    }


}
