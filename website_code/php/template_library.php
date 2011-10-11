<?PHP     /**
	 * 
	 * function get maximum template number, finds the highest template number
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */

function get_maximum_template_number(){

	global $xerte_toolkits_site;

	include_once "error_library.php";

	$query = "select max(template_id) from " . $xerte_toolkits_site->database_table_prefix . "templatedetails";

	$query_response = mysql_query($query);

	if($query_response===false){

		receive_message($_SESSION['toolkits_logon_username'], "ADMIN", "CRITICAL", "Failed to get the maximum template number", "Failed to get the maximum template number");

	}else{

		$row = mysql_fetch_array($query_response);

		return $row['max(template_id)'];

	}

}


?>