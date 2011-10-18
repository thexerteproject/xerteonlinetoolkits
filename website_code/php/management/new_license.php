<?php
require_once("../../../config.php");

require("../user_library.php");

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

