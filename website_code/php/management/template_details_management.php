<?php

require_once("../../../config.php");

_load_language_file("/website_code/php/management/template_details_management.inc");

require("../user_library.php");

if(is_user_admin()){

    $query="update {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails set description=?,
        date_uploaded=?,
        display_name=?,
        display_id=?,
        access_right=?,
        active=? WHERE template_type_id = ? ";


    $active = "0";
    if($_POST['active']==true){
		 $query.= "1";
    }

    $res = db_query($query, array($_POST['desc'], $_POST{'date_uploaded'], $_POST['display'], $_POST['example'], $_POST['access'], $active, $_POST['template_id']));


	if($res){
		echo TEMPLATE_CHANGE_SUCCESS;
	}else{
		echo TEMPLATE_CHANGE_FAIL;
	}
			
}
