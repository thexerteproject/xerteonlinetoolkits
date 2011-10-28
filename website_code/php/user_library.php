<?php
/**
 * 
 * Function check if first time
 * Is this the users first time
 * @author Patrick Lockley
 * @version 1.0
 * @params number $session_login_ldap - the ldap login for this user
 * @return bool - Is this the users first time
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function check_if_first_time($session_login_ldap){

    global $xerte_toolkits_site;

    $query = "select login_id from {$xerte_toolkits_site->database_table_prefix}logindetails where username = ? ";
		
    $response = db_query($query, array($session_login_ldap));

	if(count($response)==0){
		
		return false;
	
	}
	
    if(!empty($response)) {
		
        if(sizeof($response) > 0){
            return false;
        }
        return true;

    }
    else{
		
        receive_message($session_login_ldap, "ADMIN", "CRITICAL", "Failed to check if the users first time", "Failed to check if the users first time");

    }
}

/**
 * 
 * Function get user id
 * get the user's database ID
 * @author Patrick Lockley
 * @version 1.0
 * @return number - The user's database id
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function get_user_id(){

    global $xerte_toolkits_site;

    $row = db_query_one("SELECT login_id FROM {$xerte_toolkits_site->database_table_prefix}logindetails WHERE username = ?", array($_SESSION['toolkits_logon_username']));

    if(!empty($row)) { 
        return $row['login_id'];	
    }else{
        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get users ID", "Failed to get users ID");
    }

}

/**
 * 
 * Function create user id
 * If a new user, create an ID
 * @author Patrick Lockley
 * @version 1.0
 * @return number - the user id
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function create_user_id($username, $firstname, $surname){

    global $xerte_toolkits_site;

    $query = "insert into {$xerte_toolkits_site->database_table_prefix}logindetails (username, lastlogin, firstname, surname) values (?,?,?,?)";
    $res = db_query($query, array($username, date('Y-m-d'), $firstname, $surname));

    if($res){

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Succeeded in creating users ID", "Succeeded in creating users ID");

        return get_user_id();

    }else{

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create users ID", "Failed to create users ID");

    }
    return false;
}

/**
 * 
 * Function recycle bin
 * looks for a reycle bin and if can't find one, make it.
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function recycle_bin(){

    global $xerte_toolkits_site;

    $query = "select folder_name from {$xerte_toolkits_site->database_table_prefix}folderdetails where 
        folder_name = ? AND login_id = ?";
    $res = db_query($query, array("recyclebin", $_SESSION['toolkits_logon_id']));

    $root_folder = get_user_root_folder();

    if(sizeof($res)==0){

        $query = "insert into {$xerte_toolkits_site->database_table_prefix}folderdetails 
            (login_id,folder_parent,folder_name) VALUES (?,?,?)";
        $res = db_query($query, array($_SESSION['toolkits_logon_id'], "0", "recyclebin") );

        if($res) {

            receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Succeeded in creating users recycle bin " .$_SESSION['toolkits_logon_id'], "Succeeded in creating users root folder " .$_SESSION['toolkits_logon_id']);

        }else{

            receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create users recycle bin", "Failed to create users recycle bin");

        }	

    }

}

/**
 * 
 * Function get recycle bin
 * Is this the users first time
 * @author Patrick Lockley
 * @version 1.0
 * @return number - folder id for the recycle bin
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function get_recycle_bin(){

    global $xerte_toolkits_site;

    $query = "select folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where folder_name=\"recyclebin\" AND login_id=\"" . $_SESSION['toolkits_logon_id'] . "\"";

    $query_response = mysql_query($query);

    $row = mysql_fetch_array($query_response);

    return $row['folder_id'];

}

/**
 * 
 * Function create a virtual root folder
 * Creates the root folder for the user
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function create_a_virtual_root_folder(){

    global $xerte_toolkits_site;

    $query = "insert into " . $xerte_toolkits_site->database_table_prefix . "folderdetails (login_id,folder_parent,folder_name) VALUES (\"" . $_SESSION['toolkits_logon_id'] . "\", \"0\", \"". $_SESSION['toolkits_logon_username'] . "\" )";

    if(mysql_query($query)){

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Succeeded in creating users root folder " .$_SESSION['toolkits_logon_id'], "Succeeded in creating users root folder " .$_SESSION['toolkits_logon_id']);

    }else{

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to create users root folder", "Failed to create users root folder");

    }

}

/**
 * 
 * Function update user logon time
 * Modify the time the user last accessed the system
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function update_user_logon_time(){

    global $xerte_toolkits_site;

    $query = "UPDATE " . $xerte_toolkits_site->database_table_prefix . "logindetails SET lastlogin = '" . date('Y-m-d') . "' WHERE username = '" . $_SESSION['toolkits_logon_username'] . "'"; 

    if(mysql_query($query)){

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Succeeded in updating users login time " . $_SESSION['toolkits_logon_username'], "Succeeded in updating users login time " .$_SESSION['toolkits_logon_id']);

    }else{

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "MINOR", "Failed to update users login time", "Failed to update users login time");

    }

    $query = "UPDATE " . $xerte_toolkits_site->database_table_prefix . "logindetails SET firstname = '" . $_SESSION['toolkits_firstname'] . "', surname = '" . $_SESSION['toolkits_surname'] . "' WHERE username = '" . $_SESSION['toolkits_logon_username'] . "'"; 

    if(mysql_query($query)){

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "Succeeded in updating users username " . $_SESSION['toolkits_logon_username'], "Succeeded in updating usersname ");

    }else{

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "MINOR", "Failed to update users username", "Failed to update users username");

    }

}

/**
 * 
 * Function get user root folder
 * Get the id for the users root folder
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function get_user_root_folder(){

    global $xerte_toolkits_site;

    $query = "select folder_id from " . $xerte_toolkits_site->database_table_prefix . "folderdetails where login_id='" . $_SESSION['toolkits_logon_id'] . "' AND folder_name = '" . $_SESSION['toolkits_logon_username'] . "'";

    $query_response = mysql_query($query);

    if($query_response!=FALSE){

        $row = mysql_fetch_array($query_response);

        return $row['folder_id'];

    }else{

        receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get users root folder", "Failed to get users root folder");		

    }

}


/**
 * 
 * Function is user admin
 * Is this user set as an administrator
 * @author Patrick Lockley
 * @version 1.0
 * @return bool - Is this the user an administrator
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function is_user_admin(){

    global $xerte_toolkits_site;

    if($_SESSION['toolkits_logon_id']=="site_administrator"){

        return true;

    }

}

?>
