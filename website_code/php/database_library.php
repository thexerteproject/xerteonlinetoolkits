<?PHP     /**	
	 * 
	 * Database library, code for connecting to the database
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */
	 
	 /**
	 * 
	 * Function database connect
 	 * This function checks http security settings
	 * @param string $success_string = Successful message for the error log
 	 * @param string $error_string = Error message for the error log
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function database_connect($success_string, $error_string){
	
	include_once("error_library.php");

	global $xerte_toolkits_site;
	
	/*
	* Try to connect
	*/

	$mysql_connect_id = @mysql_connect($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password);

	/*
	* Check for connection and error if failed
	*/

	if(!$mysql_connect_id){

		die("Sorry, the system cannot connect to the database at present. The mysql error is " . mysql_error() );
		
	}
	
	$database_fail = false;

	mysql_select_db($xerte_toolkits_site->database_name) or die($database_fail = true);
	
	/*
	* database failing code
	*/

	if($database_fail){

		receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "DATABASE FAILED AT " . $error_string, "MYSQL ERROR MESSAGE IS " . mysql_error());
		die("Sorry, the system cannot connect to the database at present. The mysql error is " . mysql_error() );


	}else{

		receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "SUCCESS", "DATABASE CONNECTED", $success_string);

	}
	
	/*
	* if all worked returned the mysql ID
	*/

	return $mysql_connect_id;

}

?>