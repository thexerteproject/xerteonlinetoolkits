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
 * feedback page, allows users to send feedback to site admins
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../config.php");
_load_language_file("/feedback/index.inc");

$edit_site_logo = $xerte_toolkits_site->site_logo;
$pos = strrpos($edit_site_logo, '/') + 1;
$edit_site_logo = substr($edit_site_logo,0,$pos) . "edit_" . substr($edit_site_logo,$pos);

$edit_organisational_logo = $xerte_toolkits_site->organisational_logo;
$pos = strrpos($edit_organisational_logo, '/') + 1;
$edit_organisational_logo = substr($edit_organisational_logo,0,$pos) . "edit_" . substr($edit_organisational_logo,$pos);

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?PHP echo FEEDBACK_TITLE; ?></title>

<link href="../website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />

</head>

<body>

    <div class="topbar">
        <img src="<?php echo $edit_site_logo;?>" style="margin-left:10px; float:left" />
        <img src="<?php echo $edit_organisational_logo;?>" style="margin-right:10px; float:right" />
    </div>
    <div class="mainbody"><?PHP
	
	if(isset($_POST['name'])){

		echo "<p>" . FEEDBACK_RESPONSE . "</p></div></body></html>";

		mail($xerte_toolkits_site->feedback_list, 
                        FEEDBACK_EMAIL_TITLE, 
                        FEEDBACK_GIVER . $_POST['name'] . "<br>" . FEEDBACK_MESSAGE_INTRO . "<br>" . $_POST['feedback'], 
                        get_email_headers()
                        );

		echo "<div class=\"title\"><p>" . FEEDBACK_PAGE_TITLE . "</p></div><div style=\"width:45%; float:left; position:relative; margin-right:20px;\">" . FEEDBACK_DESCRIPTION . "</div><div style=\"width:50%; float:left; position:relative;\">";

		echo "<form action=\"\" method=\"post\">Name<textarea name=\"name\" style=\"width:100%;\" rows=\"1\"></textarea>" . FEEDBACK_TEXTAREA . "<textarea name=\"feedback\" style=\"width:100%;\" rows=\"25\"></textarea><input type=\"submit\" value=\"" . FEEDBACK_BUTTON . "\"></form>";
		
	}else{

    /**
     *	Else display the page
     */

		echo "<div class=\"title\"><p>Welcome to Xerte Online Toolkits Feedback page</p></div><div style=\"width:45%; float:left; position:relative; margin-right:20px;\">Please leave your feedback here. All feedback is anonymous, unless you would like a response, and if you do, please leave your name opposite and some contact details in the box below.</div><div style=\"width:50%; float:left; position:relative;\">";

		echo "<form action=\"\" method=\"post\">Name<textarea name=\"name\" style=\"width:100%;\" rows=\"1\"></textarea>Feedback<textarea name=\"feedback\" style=\"width:100%;\" rows=\"25\"></textarea><input type=\"submit\" value=\"Send Feedback\"></form>";

		echo "</div></div></body></html>";
		
	}

?>
    </div>
</body>
</html>
