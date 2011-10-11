<?PHP     /**
	 * 
	 * peer view page, sends the email back to the 
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */
	
	require("../../../config.php");
	
	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/peer_review.inc";

	include "../database_library.php";

	$mysql_id = database_connect("peer review Database connect success","peer review database connect failed");

	$query_for_file_name = "select template_name from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where template_id =\"" . mysql_real_escape_string($_POST['template_id']) . "\"";

	$query_response = mysql_query($query_for_file_name);

	$row_template_name = mysql_fetch_array($query_response);

	$headers = str_replace("*","\n",$xerte_toolkits_site->headers);

	if(isset($_POST['user'])){

		if(mail( $_POST['user'] . "@" . $xerte_toolkits_site->email_to_add_to_username, PEER_REVIEW_FEEDBACK . " - \"" . str_replace("_"," ",$row_template_name['template_name']) ."\"", PEER_REVIEW_EMAIL_GREETING . " <br><br> " . PEER_REVIEW_EMAIL_INTRO . "<br><br><br>" . $_POST['feedback'] . "<br><br><br>" . PEER_REVIEW_EMAIL_YOURS . "<br><br>" . PEER_REVIEW_EMAIL_SIGNATURE, $headers)){

			echo "<b>" . PEER_REVIEW_USER_FEEDBACK . "</b>";

		}else{

			echo "<b>" . PEER_REVIEW_PROBLEM . ".</b>";

		}

	}

?>