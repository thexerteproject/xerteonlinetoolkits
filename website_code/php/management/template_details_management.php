<?

require("../../../config.php");
require("../../../session.php");

require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/management/template_details_management.inc";

require("../database_library.php");
require("../user_library.php");

if(is_user_admin()){

	$database_id = database_connect("templates list connected","template list failed");

	$query="update " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails set description=\"" . $_POST['desc'] . "\", date_uploaded=\"" . $_POST['date_uploaded'] . "\", display_name =\"" . $_POST['display'] . "\",  display_id =\"" . $_POST['example'] . "\", access_rights=\"" . $_POST['access'] . "\", active=\"";

       if($_POST['active']==true){
	
		 $query.= "1";
	}else{

		 $query.= "0";

	}

	$query .= "\" where template_type_id =\"" . $_POST['template_id'] . "\"";

	if(mysql_query($query)){

		echo TEMPLATE_CHANGE_SUCCESS;

	}else{

		echo TEMPLATE_CHANGE_FAIL;

	}
			
}

?>