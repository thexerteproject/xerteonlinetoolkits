<?PHP     

require("../../../config.php");
require("../../../session.php");

require("../database_library.php");
require("../user_library.php");

if(is_user_admin()){

	$path = $xerte_toolkits_site->error_log_path;

	$error_file_list = opendir($path);
	
	echo "<div style=\"float:left; margin:10px; width:100%; height:30px; position:relative; border-bottom:1px solid #999\"><a href=\"javascript:delete_error_logs()\">Delete all error logs</a></div>";

	while($file = readdir($error_file_list)){

		if(strpos($file,".log")!=0){

			$user_parameter = substr($file,0,strlen($file)-4);

			$query_for_full_name = "select login_id, firstname, surname from " . $xerte_toolkits_site->database_table_prefix . "logindetails where username=\"" . $user_parameter . "\"";

			$query_for_full_name_response = mysql_query($query_for_full_name);

			$row_name = mysql_fetch_array($query_for_full_name_response);			
	
			if(mysql_num_rows($query_for_full_name_response)!=0){

				echo "<div class=\"template\" id=\"log" . $row_name['login_id'] . "\" savevalue=\"log" . $row_name['login_id'] .  "\"><p>" . $row_name['firstname'] . " " . $row_name['surname'] . " <a href=\"javascript:templates_display('log" . $row_name['login_id'] . "')\">View</a></p></div><div class=\"template_details\" id=\"log" . $row_name['login_id']  . "_child\">";

			}else{

				echo "<div class=\"template\" id=\"log" . $user_parameter . "\" savevalue=\"log" . $user_parameter .  "\"><p>" . $user_parameter . " <a href=\"javascript:templates_display('log" . $user_parameter . "')\">View</a></p></div><div class=\"template_details\" id=\"log" . $user_parameter  . "_child\">";

			}
		
			echo "<p>" . str_replace("*","",file_get_contents($path . $file)) . "</p>";

			echo "</div>";

		}

	}
			
}else{

	echo "the feature is for administrators only";

}

?>