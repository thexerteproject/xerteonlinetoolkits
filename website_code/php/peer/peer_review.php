<?php

/**
 * 
 * peer view page, sends the email back to the 
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

_load_language_file("/website_code/php/peer/peer_review.inc");

if(empty($_POST['template_id'])) {
    die("invalid form submission");
}

$query_for_file_name = "select template_name from {$xerte_toolkits_site->database_table_prefix}templatedetails where template_id =?";

$row_template_name = db_query_one($query_for_file_name, array($_POST['template_id']));

$headers = get_email_headers();

if(isset($_POST['retouremail'])){

	$subject = PEER_REVIEW_FEEDBACK . " - \"" . str_replace("_"," ",$row_template_name['template_name']) ."\"";
	
	$message = PEER_REVIEW_EMAIL_GREETING . " <br><br> " . PEER_REVIEW_EMAIL_INTRO . "<br><br><br>" . $_POST['feedback'] . "<br><br><br>" . PEER_REVIEW_EMAIL_YOURS . "<br><br>" . PEER_REVIEW_EMAIL_SIGNATURE;

    if(mail( $_POST['retouremail'], $subject, $message, $headers)){

        echo "<b>" . PEER_REVIEW_USER_FEEDBACK . "</b>";

    }else{

        echo "<b>" . PEER_REVIEW_PROBLEM . ".</b>";

    }

}

?>
