<?php
/**
 * 
 * peer page, allows for the peer review of a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once(dirname(__FILE__) . "/config.php");

_load_language_file("/peer.inc");

require $xerte_toolkits_site->php_library_path . "display_library.php";

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

    $query_for_play_content = "select otd.template_name, ld.username, otd.template_framework, tr.user_id, tr.folder, tr.template_id, td.access_to_whom, td.extra_flags";
    $query_for_play_content .= " from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails otd, " . $xerte_toolkits_site->database_table_prefix . "templaterights tr, " . $xerte_toolkits_site->database_table_prefix . "templatedetails td, " . $xerte_toolkits_site->database_table_prefix . "logindetails ld";
    $query_for_play_content .= " where td.template_type_id = otd.template_type_id and td.creator_id = ld.login_id and tr.template_id = td.template_id and tr.template_id=" . $template_id .  " and role='creator'";

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
            $retouremail .= '@';
            if (strlen($xerte_toolkits_site->email_to_add_to_username)>0)
            {
                $retouremail .= $xerte_toolkits_site->email_to_add_to_username;
            }

        }

        if($_POST['password'] == $passwd) {

            /**
             *  Output the code
             */

            show_peer_template($row_play, $retouremail);
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