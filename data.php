<?php
/**
 * 
 * data page, allows other sites to consume the xml of a toolkit
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once(dirname(__FILE__) . "/config.php");

_load_language_file('data.inc');

require $xerte_toolkits_site->php_library_path  . "template_status.php";
require $xerte_toolkits_site->php_library_path  . "display_library.php";

/**
 *  Check the template ID is a number
 */

if(!isset($_GET['template_id']) || !is_numeric($_GET['template_id'])) {
    dont_show_template();
    exit(0);
}


/**
 *  Run the standard query from config.php, excessive in this case, but suitable
 */ 

$query_to_check_data = "select * from {$xerte_toolkits_site->database_table_prefix}additional_sharing where sharing_type=? AND template_id = ?";

$query_for_data_response = db_query_one($query_to_check_data, array('xml', $_GET['template_id']));
/**
 *  Check to see if for this ID a data value is set in additional sharing.
 */

if(!empty($query_for_data_response)) {
    
    $row_data = $query_for_data_response;

    /**
     *  The extra value in this case is the hostname we have limited XML consumption too, and as such see it exists
     */

    if($row_data['extra']!=""){

        /**
         *  Compare to the host variables
         */

        if(($row_data['extra']==$_SERVER['HTTP_REFERER'])||($row_data['extra']==$_SERVER['REMOTE_ADDR'])){

            /**
             *  Fetch and return the XML
             */

            $query_for_preview_content = $xerte_toolkits_site->play_edit_preview_query;

            $query_for_preview_content_response = mysql_query($query_for_preview_content);

            $row = mysql_fetch_array($query_for_preview_content_response);

            $query_for_username = "select username from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?";
            $row_username = db_query_one($query_for_username, array($row['user_id']));

            if(empty($row_username)) {
                _debug("User deleted, but template remains?");
            }
            else {
                $path = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/";
                echo str_replace("FileLocation + '", $xerte_toolkits_site->site_url . $path, file_get_contents($path . "data.xml"));	
            }
        }else{
            dont_show_template();
        }

    }else{

        /**
         *  Fetch and return the XML
         */

        $query_for_play_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);

        $query_for_play_content = str_replace("TEMPLATE_ID_TO_REPLACE", mysql_real_escape_string($_GET['template_id']), $query_for_play_content_strip);

        $row = db_query_one($query_for_play_content);

        $query_for_username = "select username from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?";

        $row_username = db_query_one($query_for_username, array($row['user_id']));


        $path = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/";

        echo str_replace("FileLocation + '", $xerte_toolkits_site->site_url . $path, file_get_contents($path . "data.xml"));	
    }
}
else{
    /***  
      Display nothing
     */

    echo DATA_XMLFAIL;

    dont_show_template();

}
