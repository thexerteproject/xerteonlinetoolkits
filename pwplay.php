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
 * pwplay page, allows for the password protected access to a template
 *
 * @author Ron Mitchell
 * @version 1.0
 * @package
 */

require_once(dirname(__FILE__) . "/config.php");

_load_language_file("/pwplay.inc");

require $xerte_toolkits_site->php_library_path . "display_library.php";


function show_peer_template_form($row, $retouremail)
{
    ?>
<html>
    <head>
        <script type="text/javascript" language="Javascript" src="website_code/scripts/peer.js"></script>
        <script type="text/javascript" language="Javascript" src="website_code/scripts/ajax_management.js"></script>
        <script type="text/javascript" src="modules/xerte/parent_templates/Nottingham/common_html5/js/jquery-1.9.1.min.js"></script>
        <script type="text/javascript" language="Javascript" src="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.js"></script>
        <link rel="stylesheet" href="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.css" type="text/css" />

    </head>
    <body style="#ffffff;">
        <div style="width:100%; margin:0 auto;">
            <div style="font-family:verdana,tahoma,arial; font-size:11pt">


                </div>
                <iframe src="show_peer.php" style="width:100%; height:100%; margin: 0; border:none;"></iframe>

            </div>

        </div>
    </body>
</html>
<?php
}

function show_peer_login_form($mesg="")
{
    echo "<html>\n";
    echo "<body style=\"#ffffff;\">\n";
    echo "   <div style=\"width:900px; margin:0 auto; font-family:verdana,tahoma,arial; font-size:11pt\">\n";
    echo "   <b>" . XERTE_PWPLAY_DESCRIPTION . "</b><br>" . XERTE_PWPLAY_GUIDANCE . "\n";
    echo "<p><form method=\"post\" action=\"\">\n";
    echo "<p>" . XERTE_PWPLAY_PASSWORD . " <input type=\"password\" size=\"20\" maxlength=\"36\" name=\"password\" /> <button type=\"submit\">" . XERTE_PWPLAY_LOGIN_BUTTON . "</button></p>\n";
    if (strlen($mesg)>0)
    {
        echo "<p>" . $mesg . "</p>";
    }
    echo "</div></body></html>";
}


/**
 *  Check the template ID is a number
 */

if(empty($_GET['template_id']) || !is_numeric($_GET['template_id'])) {
    die("Invalid template id");
}

$template_id = (int) x_clean_input($_GET['template_id'], 'numeric');

$query_to_check_peer = "select * from " . $xerte_toolkits_site->database_table_prefix . "additional_sharing where sharing_type=\"peer\" and template_id=\"" . $template_id . "\"";

$query_for_peer_response = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}additional_sharing WHERE sharing_type = ? AND template_id = ?", array('peer', $template_id));


$prefix =  $xerte_toolkits_site->database_table_prefix ;
$query_for_template_access = "select access_to_whom from {$prefix}templatedetails where template_id= ? ";

$row_access = db_query_one($query_for_template_access, [$template_id]);

if($row_access !== false){
    $extra = explode("," , $query_for_peer_response['extra'],2);

    $password = $extra[0];
	//$pos = strpos($row_access['access_to_whom'], "-");

	//if($pos !== false){
	//	$password = substr($row_access['access_to_whom'], $pos+1);
	//}
}

/**
 *  The number of rows being not equal to 0, indicates peer review has been set up.
 */

if(!empty($query_for_peer_response) || isset($password)) {

    $query_for_play_content = "select otd.template_name, otd.parent_template, ld.username, otd.template_framework, tr.user_id, tr.folder, tr.template_id, td.access_to_whom, td.extra_flags";
    $query_for_play_content .= " from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails otd, " . $xerte_toolkits_site->database_table_prefix . "templaterights tr, " . $xerte_toolkits_site->database_table_prefix . "templatedetails td, " . $xerte_toolkits_site->database_table_prefix . "logindetails ld";
    $query_for_play_content .= " where td.template_type_id = otd.template_type_id and td.creator_id = ld.login_id and tr.template_id = td.template_id and tr.template_id=" . $template_id .  " and (role='creator' or role='co-author')";

    $row_play = db_query_one($query_for_play_content);


    /**
     *  Peer review needs a password, so check if anything has been posted
     */
    require $xerte_toolkits_site->php_library_path . "screen_size_library.php";
    require $xerte_toolkits_site->root_file_path . "modules/" . $row_play['template_framework'] . "/peer.php";

    if($_SERVER['REQUEST_METHOD'] == 'POST') {

        /**
         *  Check the password againsr the value in the database
         */
        $extra = explode("," , $query_for_peer_response['extra'],2);

        if (count($extra) > 1)
        {
            $retouremail = $extra[1];
        }
        else
        {
            $retouremail = $_SESSION['toolkits_logon_username'];
            if (strlen($xerte_toolkits_site->email_to_add_to_username)>0)
            {
                $retouremail .= '@' . $xerte_toolkits_site->email_to_add_to_username;
            }

        }

        if($_POST['password'] == $password) {

            /**
             *  Output the code
             */
            $_SESSION['template_id'] = $template_id;
            show_template($row_play, false);
        }else{
            show_peer_login_form(PWPLAY_LOGON_FAIL);
        }
    }else{
        /**
         *  Nothing posted so output the password string
         */
        show_peer_login_form();
        // echo $xerte_toolkits_site->peer_form_string;

    }
}else{
    dont_show_template();
}
