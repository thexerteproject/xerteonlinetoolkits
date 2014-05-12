<?php

require_once("../../../config.php");

_load_language_file("/website_code/php/management/error_list.inc");

require("../user_library.php");
require("management_library.php");

if(is_user_admin()){

    $path = $xerte_toolkits_site->error_log_path;

    $error_file_list = opendir($path);

    echo "<div style=\"float:left; margin:10px; width:100%; height:30px; position:relative; border-bottom:1px solid #999\"><button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_error_logs()\">" . DELETE_ALL . "</button></div>";

    while($file = readdir($error_file_list)){

        if(strpos($file,".log")!=0){

            $user_parameter = substr($file,0,strlen($file)-4);

            $prefix = $xerte_toolkits_site->database_table_prefix ;
            
            $query_for_full_name = "select login_id, firstname, surname from {$prefix}logindetails where username= ?";
            $params = array($user_parameter);

            $query_for_full_name_response = db_query($query_for_full_name, $params);
		
            if(sizeof($query_for_full_name_response) > 0) { 
                $row_name =	$query_for_full_name_response[0];
                echo "<div class=\"template\" id=\"log" . $row_name['login_id'] . "\" savevalue=\"log" . $row_name['login_id'] .  "\"><p>" . $row_name['firstname'] . " " . $row_name['surname'] . " <a href=\"javascript:templates_display('log" . $row_name['login_id'] . "')\">View</a></p></div><div class=\"template_details\" id=\"log" . $row_name['login_id']  . "_child\">";

            }else{

                echo "<div class=\"template\" id=\"log" . $user_parameter . "\" savevalue=\"log" . $user_parameter .  "\"><p>" . $user_parameter . " <a href=\"javascript:templates_display('log" . $user_parameter . "')\">" . DELETE_VIEW . "</a></p></div><div class=\"template_details\" id=\"log" . $user_parameter  . "_child\">";

            }

            echo "<p>" . str_replace("*","",file_get_contents($path . $file)) . "</p>";

            echo "</div>";

        }

    }

}else{

    management_fail();

}
