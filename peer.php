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
 * peer page, allows for the peer review of a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once(dirname(__FILE__) . "/config.php");

_load_language_file("/peer.inc");

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
        <div style="width:95%; margin:0 auto;">
            <div style="font-family:verdana,tahoma,arial; font-size:11pt">
                    <h1 style="margin-top:1em;"><?php echo XERTE_PEER_DESCRIPTION; ?></h1>
                    <p><?php echo XERTE_PEER_GUIDANCE; ?> <a href="show_peer.php" data-featherlight="iframe" data-featherlight-iframe-style="display:block;border:none;height:85vh;width:85vw;"><?php echo XERTE_PEER_LIGHTBOX; ?></a></p>
                </div>
                <div style="width:24%; display:inline-block; position: fixed;">
                    <form name="peer" action="javascript:send_review('<?php echo $retouremail; ?>','<?php echo $row['template_id']; ?>')" method="post" enctype="text/plain">
                        <textarea style="width:100%; height:70vh;" name="response"><?php echo XERTE_PEER_TEXTAREA_INSTRUCTIONS; ?></textarea>
                        <br/>
                        <button type="submit" class="xerte_button"><?php echo XERTE_PEER_BUTTON_SEND; ?></button>
                    </form>
                    <a name="feedbackform"><p style="color:red;"  id="pv_feedback"></p></a>
                </div> <iframe src="show_peer.php" style="width:74%; height:80%; margin-left: 27%; border:none;"></iframe>

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
    echo "   <b>" . XERTE_PEER_DESCRIPTION . "</b><br>" . XERTE_PEER_GUIDANCE . "\n";
    echo "<p><form method=\"post\" action=\"\">\n";
    echo "<p>" . XERTE_PEER_PASSWORD . " <input type=\"password\" size=\"20\" maxlength=\"36\" name=\"password\" /> <button type=\"submit\">" . XERTE_PEER_LOGIN_BUTTON . "</button></p>\n";
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

$template_id = (int) $_GET['template_id'];

$query_to_check_peer = "select * from " . $xerte_toolkits_site->database_table_prefix . "additional_sharing where sharing_type=\"peer\" and template_id=\"" . $template_id . "\"";

$query_for_peer_response = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}additional_sharing WHERE sharing_type = ? AND template_id = ?", array('peer', $template_id));

/**
 *  The number of rows being not equal to 0, indicates peer review has been set up.
 */

if(!empty($query_for_peer_response)) {

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

        $passwd = $extra[0];
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

        if($_POST['password'] == $passwd) {

            /**
             *  Output the code
             */
            $_SESSION['template_id'] = $template_id;
            show_peer_template_form($row_play, $retouremail);
        }else{
            show_peer_login_form(PEER_LOGON_FAIL);
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
