<?php
/**
 * 
 * name select template, displays usernames so people can choose to share a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/name_select_template.inc");
$prefix = $xerte_toolkits_site->database_table_prefix;

if(is_numeric($_POST['template_id'])){

    $search = $_POST['search_string'];

    $tutorial_id = (int) $_POST['template_id'];

    $database_id=database_connect("Template name select share access database connect success","Template name select share database connect failed");

    /**
     * Search the list of user logins for user with that name
     */

    if(strlen($search)!=0){

        $query_for_names = "select login_id, firstname, surname from {$prefix}logindetails WHERE "
        . "((firstname like ?) or (surname like ?)) AND login_id NOT IN ( "
        . "SELECT user_id from {$prefix}templaterights where template_id = ? ) ORDER BY firstname ASC";

        $params = array("$search%", "$search%", $tutorial_id);
                
        $query_names_response = db_query($query_for_names, $params); 

        if(sizeof($query_names_response)!=0){			

            foreach($query_names_response as $row){

                echo "<p>" . $row['firstname'] . " " . $row['surname'] . " (" . $row['login_id'] . ") - <button type=\"button\" class=\"xerte_button\" onclick=\"share_this_template('" . $tutorial_id . "', '" . $row['login_id'] . "')\">" . NAME_SELECT_CLICK . "</button></p>";

            }

        }else{

            echo "<p>" . NAME_SELECT_DETAILS_FAIL . "</p>";			

        }

    }

}
