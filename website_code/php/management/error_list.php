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
require_once("../../../config.php");

_load_language_file("/website_code/php/management/error_list.inc");
_load_language_file("/management.inc");

require("../user_library.php");
require("management_library.php");

if(is_user_permitted("system")){
	
	echo "<h2>" . MANAGEMENT_MENUBAR_LOGS . "</h2>";
	echo "<div class=\"admin_block\">";

    $path = $xerte_toolkits_site->error_log_path;

    $error_file_list = opendir($path);

    echo "<div style=\"margin:5px; width:100%; position:relative;\"><button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_error_logs()\"><i class=\"fa fa-trash-o\"></i> " . DELETE_ALL_LOGS . "</button></div>";

    while($file = readdir($error_file_list)){

        if(strpos($file,".log")!=0){

            $user_parameter = substr($file,0,strlen($file)-4);

            $prefix = $xerte_toolkits_site->database_table_prefix ;
            
            $query_for_full_name = "select login_id, firstname, surname from {$prefix}logindetails where username= ?";
            $params = array($user_parameter);

            $query_for_full_name_response = db_query($query_for_full_name, $params);
		
            if(sizeof($query_for_full_name_response) > 0) { 
                $row_name = $query_for_full_name_response[0];
                echo "<div class=\"template\" id=\"log" . $row_name['login_id'] . "\" savevalue=\"log" . $row_name['login_id'] .  "\"><p>" . $row_name['firstname'] . " " . $row_name['surname'] . " <button type=\"button\" class=\"xerte_button\" id=\"log" . $row_name['login_id'] . "_btn\" onclick=\"javascript:templates_display('log" . $row_name['login_id'] . "')\">" . LOGS_VIEW . "</button></p></div><div class=\"template_details\" id=\"log" . $row_name['login_id']  . "_child\">";

            }else{

                echo "<div class=\"template\" id=\"log" . $user_parameter . "\" savevalue=\"log" . $user_parameter .  "\"><p>" . $user_parameter . " <button type=\"button\" class=\"xerte_button\" id=\"log" . $user_parameter . "_btn\" onclick=\"javascript:templates_display('log" . $user_parameter . "')\">" . LOGS_VIEW . "</button></p></div><div class=\"template_details\" id=\"log" . $user_parameter  . "_child\">";

            }

            echo "<p>" . str_replace("*","",str_replace("\n", "<br>\n", file_get_contents($path . $file))) . "</p>";

            echo "</div>";

        }

    }
	
	echo "</div>";

}else{

    management_fail();

}
