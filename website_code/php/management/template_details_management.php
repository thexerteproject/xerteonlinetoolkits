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
require_once("../../../config.php");

_load_language_file("/website_code/php/management/template_details_management.inc");

require("../user_library.php");

if(is_user_admin()){

    $query="update {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails set description=?,
        date_uploaded=?,
        display_name=?,
        display_id=?,
        access_rights=?,
        active=? WHERE template_type_id = ? ";


    $active = "0";
    if($_POST['active']==true){
		 $active = "1";
    }

    $res = db_query($query, array($_POST['desc'], $_POST['date_uploaded'], $_POST['display'], $_POST['example'], $_POST['access'], $active, $_POST['template_id']));


	if($res){
		echo TEMPLATE_CHANGE_SUCCESS;
	}else{
		echo TEMPLATE_CHANGE_FAIL . " " . mysql_error();
	}
			
}
