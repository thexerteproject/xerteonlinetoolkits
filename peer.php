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


    /**
     *  Peer review needs a password, so check if anything has been posted
     */

    if($_SERVER['REQUEST_METHOD'] == 'POST') {

        /**
         *  Check the password againsr the value in the database
         */

        if($_POST['password'] == $query_for_peer_response['extra']) {

            /**
             *  Output the code
             */

            require $xerte_toolkits_site->php_library_path . "screen_size_library.php";

            // should the $ really be escaped with \ ?
            $query_for_play_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

            $query_for_play_content = str_replace("TEMPLATE_ID_TO_REPLACE", $template_id, $query_for_play_content_strip);

            $row_play = db_query_one($query_for_play_content);

            require $xerte_toolkits_site->root_file_path . "modules/" . $row_play['template_framework'] . "/peer.php";

            show_template($row_play);					

        }else{

            $buffer = $xerte_toolkits_site->peer_form_string . $temp[1] . "<p>" . PEER_LOGON_FAIL . ".</p></center></body></html>";

            echo $buffer;

        }		

    }else{

        /**
         *  Nothing posted so output the password string
         */

        echo $xerte_toolkits_site->peer_form_string;

    }

}else{

    dont_show_template();

}
