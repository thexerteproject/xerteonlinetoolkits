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
 * name select gift template, displays usernames so people can choose one to gift a template to
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
include "../template_status.php";
include "../user_library.php";

_load_language_file("/website_code/php/properties/name_select_gift_template.inc");

$search = $_POST['search_string'];
$prefix = $xerte_toolkits_site->database_table_prefix;

if (!isset($_SESSION['toolkits_logon_id']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

if(is_numeric($_POST['template_id'])){
    if(is_user_creator_or_coauthor($_POST['template_id'])||is_user_permitted("projectadmin")){
        $tutorial_id = (int)$_POST['template_id'];

        $database_id = database_connect("Template name select share access database connect success", "Template name select share database connect failed");

        /**
         * Search the list of user logins for user with that name
         */

        if (strlen($search) != 0) {

            $query_for_names = "SELECT login_id, firstname, surname, username from {$prefix}logindetails WHERE "
                . "((firstname like ? ) or (surname like ?) or (username like ?) ) "
                . "AND disabled=0 AND login_id not in( SELECT creator_id from {$prefix}templatedetails where template_id= ? ) ORDER BY firstname ASC";

            $params = array("$search%", "$search%", "$search%", $tutorial_id);
            $rows = db_query($query_for_names, $params);

            if (sizeof($rows) > 0) {
				
				echo "<ul class=\"share_form_results\">";

                foreach ($rows as $row) {
					
                    echo "<li>" . $row['firstname'] . "  " . $row['surname'] . " (" . $row['username'] . ") <button type=\"button\" class=\"xerte_button\" onclick=\"gift_this_template('" . $tutorial_id . "', '" . $row['login_id'] . "', 'keep')\"><i class=\"fa fa-plus\"></i>&nbsp;" . NAME_SELECT_GIFT_CLICK . "<span class=\"sr-only\"> (" . $row['firstname'] . "  " . $row['surname'] . " - " . $row['username'] . ")</span></button></li>";

                }
				
				echo "</ul>";

            } else {

                echo "<p>" . NAME_SELECT_GIFT_FIND_FAIL . "</p>";

            }

        }
    }

}
