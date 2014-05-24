<?php
/**
 * 
 * set sharing rights template, modifies rights to a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */


require_once("../../../config.php");

$prefix = $xerte_toolkits_site->database_table_prefix;
if(is_numeric($_POST['user_id'])&&is_numeric($_POST['template_id'])){

    $new_rights = $_POST['rights'];

    $user_id = $_POST['user_id'];

    $tutorial_id = $_POST['template_id'];

    $database_id=database_connect("Template sharing rights database connect success","Template sharing rights database connect failed");

    $query_to_change_share_rights = "update {$prefix}templaterights set role = ? WHERE template_id = ? and user_id= ?";
    $params = array($new_rights, $tutorial_id, $user_id);
    db_query($query_to_change_share_rights, $params);
}
