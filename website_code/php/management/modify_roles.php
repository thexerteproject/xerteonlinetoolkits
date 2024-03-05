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

	if(count($role_names) == 0){
		$result = db_query("delete from logindetailsrole where (userid=? and roleid=any (select roleid from role))", array($userid));
		echo $result === false? USERS_FAILED_REMOVE_ROLES : USERS_ROLES_SUCCESS;
		return;
	}

	$questionMarks = "?";
	for($i = 1; $i < count($role_names);$i++){
		$questionMarks .= ", ?";
	}

	$query = "select distinct roleid from role where name in ({$questionMarks})";
	$result = db_query($query, $role_names);
	$roles = array();
	foreach($result as $row){
		$roles[] = array_values($row)[0];
	}

	$query = "select distinct roleid from logindetailsrole where userid=?";
	$result = db_query($query, array($userid));
	$user_roles = array();
	foreach($result as $row){
		$user_roles[] = $row["roleid"];
	}

	$roles_to_unassign = array_values(array_diff($user_roles, $roles));
	$roles_to_assign = array_values(array_diff($roles, $user_roles));

	if(count($roles_to_unassign) > 0){
		$questionMarks = "?";
		for($i = 1; $i < count($roles_to_unassign);$i++){
			$questionMarks .= ", ?";
		}
		$query = "delete from logindetailsrole where userid=? and roleid in ({$questionMarks})";
		$result = db_query($query, array($userid, ...$roles_to_unassign));
		if($result ===  false){
			$return .= USERS_FAILED_REMOVE_ROLES . PHP_EOL;
		}
	}

	if(count($roles_to_assign) > 0){
		$questionMarks = "(:userid, :param0)";
		for($i = 1; $i < count($roles_to_assign); $i++){
			$questionMarks .= ", (:userid, :param{$i})";
		}
		$query = "insert into logindetailsrole (userid, roleid) values " . $questionMarks;
		
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
