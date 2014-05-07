<?php 
/**
 * 
 * name select gift template, displays usernames so people can choose one to gift a template to
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/name_select_gift_template.inc");

$search = $_POST['search_string'];
$prefix = $xerte_toolkits_site->database_table_prefix;

if(is_numeric($_POST['template_id'])){

    $tutorial_id =  (int) $_POST['template_id'];

    $database_id=database_connect("Template name select share access database connect success","Template name select share database connect failed");

    /**
     * Search the list of user logins for user with that name
     */

    if(strlen($search)!=0){
        
        $query_for_names = "SELECT login_id, firstname, surname from {$prefix}logindetails WHERE "
        . "((firstname like ? ) or (surname like ?) ) "
        . "AND login_id not in( SELECT creator_id from {$prefix}templatedetails where template_id= ? ) ORDER BY firstname ASC"; 

$params = array("$search%", "$search%", $tutorial_id);
        $rows = db_query($query_for_names, $params);

        if(sizeof($rows) > 0){			

            foreach($rows as $row) { 
                echo "<p>" . $row['firstname'] . "  "  . $row['surname'] .  " (" . $row['login_id'] . ") - <button type=\"button\" class=\"xerte_button\" onclick=\"gift_this_template('" . $tutorial_id . "', '" . $row['login_id'] . "', 'keep')\">" . NAME_SELECT_GIFT_CLICK . "</button>" . NAME_SELECT_GIFT_INSTRUCTION . "</p>";

            }

        }else{

            echo "<p>" . NAME_SELECT_GIFT_FIND_FAIL . "</p>";			

        }

    }

}
