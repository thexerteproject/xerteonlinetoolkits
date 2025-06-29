<?php
require_once("../../../config.php");

_load_language_file("/website_code/php/management/users.inc");
_load_language_file("/management.inc");

require("../user_library.php");
require("management_library.php");

if(is_user_permitted("useradmin")){
	$data = $_POST;
	unset($data["id"]);
	$role_names = array_keys($data);
	$userid = $_POST["id"];
	$return = "";
	$roles = array(); 

	if(count($role_names) !== 0){
		// convert the role names to roleids
		$questionMarks = "?";
		for($i = 1; $i < count($role_names);$i++){
			$questionMarks .= ", ?";
		}
		$query = "select distinct roleid from  {$xerte_toolkits_site->database_table_prefix}role where name in ({$questionMarks})";
		$result = db_query($query, $role_names);
		foreach($result as $row){
			$roles[] = array_values($row)[0];
		}
	}
	
	// gat all role ids from the roles of the user
	$query = "select distinct roleid from  {$xerte_toolkits_site->database_table_prefix}logindetailsrole where userid=?";
	$result = db_query($query, array($userid));
	$user_roles = array();
	foreach($result as $row){
		$user_roles[] = $row["roleid"];
	}

	if(!is_user_permitted()){
		$super = array_search(1, $roles);
		$system = array_search(2, $roles);
		if($super !== false)
			unset($roles[$super]);

		if($system !== false)
			unset($roles[$system]);
	}
	
	//array_values is used to reindex the arrays here
	$roles_to_unassign = array_values(array_diff($user_roles, $roles));
	$roles_to_assign = array_values(array_diff($roles, $user_roles));
	
	if(!is_user_permitted()){
		$super = array_search(1, $roles_to_assign);
		$system = array_search(2, $roles_to_assign);
		if($super !== false)
			unset($roles_to_assign[$super]);

		if($system !== false)
			unset($roles_to_assign[$system]);

		$super = array_search(1, $roles_to_unassign);
		$system = array_search(2, $roles_to_unassign);
		if($super !== false)
			unset($roles_to_unassign[$super]);

		if($system !== false)
			unset($roles_to_unassign[$system]);
	}

	if(count($roles_to_unassign) > 0){
		$questionMarks = "?";
        $params = array($userid, $roles_to_unassign[0]);
		for($i = 1; $i < count($roles_to_unassign);$i++){
            $params[] = $roles_to_unassign[$i];
			$questionMarks .= ", ?";

		}
		$query = "delete from  {$xerte_toolkits_site->database_table_prefix}logindetailsrole where userid=? and roleid in ({$questionMarks})";
		$result = db_query($query, $params);
		if($result ===  false){
			$return .= USERS_FAILED_REMOVE_ROLES . PHP_EOL;
		}
	}

	if(count($roles_to_assign) > 0){
		// named parameters are used because you only have to include the userid once in the parameters array; 
		$questionMarks = "(:userid, :param0)";
		for($i = 1; $i < count($roles_to_assign); $i++){
			$questionMarks .= ", (:userid, :param{$i})";
		}
		$query = "insert into  {$xerte_toolkits_site->database_table_prefix}logindetailsrole (userid, roleid) values " . $questionMarks;
		
		$params = array("userid" => $userid);
		for($i = 0; $i < count($roles_to_assign); $i++){
			$params["param{$i}"] = $roles_to_assign[$i];
		} 

		$result = db_query($query, $params);
		if($result ===  false){
			$return .= USERS_FAILED_ADD_ROLES . PHP_EOL;
		}
	}

	if($return == "")
		$return =  USERS_ROLES_SUCCESS;


	echo $return;
} else {
	management_fail();
}
