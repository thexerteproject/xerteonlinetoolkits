<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
