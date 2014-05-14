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

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $user_id = $_POST['user_id'];

    $tutorial_id = $_POST['template_id'];

    $database_id=database_connect("Template sharing database connect failed","Template sharing database connect failed");

    $query_to_delete_share = "delete from {$prefix}templaterights where template_id = ? AND user_id = ?";

    $params = array($tutorial_id, $user_id);
    db_query($query_to_delete_share, $params);
    

}
