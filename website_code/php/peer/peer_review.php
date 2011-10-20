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


if(empty($_POST['template_id'])) {
    die("invalid form submission");
}

$query_for_file_name = "select template_name from {$xerte_toolkits_site->database_table_prefix}templatedetails where template_id =?";

$row_template_name = db_query_one($query_for_file_name, array($_POST['template_id']));

$headers = str_replace("*","\n",$xerte_toolkits_site->headers);

if(isset($_POST['user'])){
    if(mail( $_POST['user'] . "@" . $xerte_toolkits_site->email_to_add_to_username, "Feedback on project - \"" . str_replace("_"," ",$row_template_name['template_name']) ."\"", "Hello, <br><br> You've received feedback on your project.<br><br><br>" . $_POST['feedback'] . "<br><br><br>Thanks for using the site<br><br>The Xerte Project Team", $headers)){
        echo "<b>Your feedback has been sent to the user</b>";
    }else{
        echo "<b>A problem has occured.</b>";
    }
}
