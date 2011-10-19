<?PHP     require("../../../config.php");
require("../../../session.php");


require("../database_library.php");
require("../user_library.php");

if(is_user_admin()){

	$database_id = database_connect("play_security_management.php connected","play_security_management.php list failed");

	$query="update " . $xerte_toolkits_site->database_table_prefix . "play_security_details set security_setting=\"" . $_POST['security'] . "\", security_data=\"" . $_POST['data'] . "\",  security_info =\"" . $_POST['info'] . "\" where security_id =\"" . $_POST['play_id'] . "\"";

	if(mysql_query($query)){

		echo "Update successful";

	}else{

		echo "Update failed";

	}
			
}

?>