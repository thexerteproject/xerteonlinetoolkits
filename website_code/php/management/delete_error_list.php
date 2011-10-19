<?PHP     

require("../../../config.php");
require("../../../session.php");

require("../database_library.php");
require("../user_library.php");

if(is_user_admin()){

	$path = $xerte_toolkits_site->error_log_path;

	$error_file_list = opendir($path);
	
	echo "<div style=\"float:left; margin:10px; width:100%; height:30px; position:relative; border-bottom:1px solid #999\">All error logs deleted</div>";

	while($file = readdir($error_file_list)){

		if(strpos($file,".log")!=0){

			unlink($path . $file);

		}

	}
			
}else{

	echo "the feature is for administrators only";

}

?>