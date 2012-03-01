<?php 
/**
 * 
 * remove sharing template, removes some one from the list of users sharing the site
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

if(is_numeric($_POST['template_id'])){

    $user_id = mysql_real_escape_string($_POST['user_id']);

    $tutorial_id = mysql_real_escape_string($_POST['template_id']);

    $database_id=database_connect("Template sharing database connect failed","Template sharing database connect failed");

    $query_to_delete_share = "delete from " . $xerte_toolkits_site->database_table_prefix . "templaterights where template_id =\"" . $tutorial_id . "\" and user_id=\"" . $user_id . "\"";

    mysql_query($query_to_delete_share);

}

?>
