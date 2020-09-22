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

_load_language_file("/website_code/php/management/template_delete_sub.inc");

require("../user_library.php");

if(is_user_admin()){

    $query="update {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails set access_rights=? WHERE template_type_id = ? ";

    $res = db_query($query, array('deleted' , $_POST['template_id']));


	if($res !== false){
		$msg = "Template deleted by user from " . $_SERVER['REMOTE_ADDR'];
		receive_message("", "SYSTEM", "MGMT", "Temaplte deleted", $msg);

		echo TEMPLATE_DELETE_SUCCESS;
	}else{
		echo TEMPLATE_DELETE_FAIL;
	}
			
}
