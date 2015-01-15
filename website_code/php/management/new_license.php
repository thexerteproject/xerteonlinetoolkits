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

require("../user_library.php");
require("management_library.php");

if(is_user_admin()){

	$mysql_id = database_connect("New_license.php database connect success","New_license.php database connect failed");

    $query = "INSERT INTO " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses (license_name) values  (?)"; 
    $res = db_query($query, array($_POST['newlicense']));

	if($res) {
		// change these
		//receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder creation succeeded for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);

	}else{
		// change these
		//receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder creation failed for " . $_SESSION['toolkits_logon_username'], "Folder creation failed for " . $_SESSION['toolkits_logon_username']);
	}

	licence_list();

			
}else{

	management_fail();

}

