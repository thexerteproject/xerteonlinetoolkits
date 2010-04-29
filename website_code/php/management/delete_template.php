<?PHP // Delete template code
//
// Version 1.0 University of Nottingham
// 
// Delete this template from the database and from the file system

	require("../../../config.php");
	require("../../../session.php");

	include "../database_library.php";
	include "../user_library.php";
	include "../deletion_library.php";

	$database_id = database_connect("delete main template database connect success","delete main template database connect failed");
	
	if(is_user_admin()){

		// work out the file path before we start deletion

		$query_to_get_template_type_id = " select template_type_id,template_framework,template_name from " .$xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where template_type_id = \"" . $_POST['template_id'] . "\"";

		echo $query_to_get_template_type_id . "<br>";

		$query_to_get_template_type_id_response = mysql_query($query_to_get_template_type_id);

		$row_template_id = mysql_fetch_array($query_to_get_template_type_id_response);

		$path = $xerte_toolkits_site->root_file_path  . $xerte_toolkits_site->module_path . $row_template_id['template_framework'] . "/parent_templates/" . $row_template_id['template_name'] . "/";

		$path2 = $xerte_toolkits_site->root_file_path  . $xerte_toolkits_site->module_path . $row_template_id['template_framework'] . "/templates/" . $row_template_id['template_name'] . "/";

		echo $path . "<br>" . $path2;

		set_up_deletion($path);

		set_up_deletion($path2);

		$query_to_delete_template = "delete from " .$xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where template_type_id=\"" . $_POST['template_id'] . "\"";

		echo $query_to_delete_template . "<br>";

		if(mysql_query($query_to_delete_template)){	
			
			echo "succeed";

		}else{

			echo "Fail";
	
		}


	}
	mysql_close($database_id);

?>