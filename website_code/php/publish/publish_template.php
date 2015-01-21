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
 * Edit page, brings up the xerte editor window
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");

_load_language_file("/website_code/php/publish/publish_template.inc");

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
 * Check the template ID is numeric
 */

if(is_numeric($_POST['template_id'])){

    /*
     * Find out if this user has rights to the template	
     */

    $safe_template_id = (int) $_POST['template_id'];

    $query_for_edit_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

    $query_for_edit_content = str_replace("TEMPLATE_ID_TO_REPLACE", $safe_template_id, $query_for_edit_content_strip);

    $row_publish = db_query_one($query_for_edit_content);


    if(is_user_an_editor($safe_template_id,$_SESSION['toolkits_logon_id'])){

        // XXX What is temp_array[2] here? Looks broken. TODO: Fix it.
        require("../../../modules/" . $temp_array[2] . "/publish.php");
			
		publish($row_publish, $_POST['template_id']);
			
		echo UPDATE_SUCCESS;
		
    }

}else{

    echo PUBLISH_FAIL;

}
