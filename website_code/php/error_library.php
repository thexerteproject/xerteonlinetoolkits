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
 * Function receive message
 * This function is used to handle how an error message is used
 * @param string $user_name = username the error relates to
 * @param string $type = user / Admin / system
 * @param string $level = how serious the problem is, or whether it is a sucess
 * @param string $subject = The title of the error problem (a preci effectively)
 * @param string $content = The error message in full.
 * @version 1.0
 * @author Patrick Lockley
 */

function receive_message($user_name, $type, $level, $subject, $content){

    global $xerte_toolkits_site;

    if($level!="SUCCESS"){

        $_SESSION['toolkits_most_recent_error'] = $subject . " " . $content;

    }

    /*
     * If error log message turned on, create an error log
     */

    if(isset($xerte_toolkits_site->error_log_message) && $xerte_toolkits_site->error_log_message=="true"){
        write_message($user_name, $type, $level, $subject, $content);		

    }


    /*
     * If error email message turned on, send an error email message 
     */

    if(isset($xerte_toolkits_site->error_email_message) && $xerte_toolkits_site->error_email_message=="true"){

        email_message($user_name, $type, $level, $subject, $content);		

    }

}

/**
 * 
 * Function receive message
 * This function is used to send an error email meesage
 * @param string $user_name = username the error relates to
 * @param string $type = user / Admin / system
 * @param string $level = how serious the problem is, or whether it is a sucess
 * @param string $subject = The title of the error problem (a preci effectively)
 * @param string $content = The error message in full.
 * @version 1.0
 * @author Patrick Lockley
 */

function write_message($user_name, $type, $level, $subject,$content){

    global $xerte_toolkits_site;

    if($user_name==""){

        $user_name="UNKNOWN";

    }

    /*
     * Get the log file contents (a series of HTML paragraphs separated by *)
     */

    if(file_exists($xerte_toolkits_site->error_log_path . $user_name . ".log")){

        $error_string = file_get_contents($xerte_toolkits_site->error_log_path . $user_name . ".log");

    }

    $error_array = explode("*",$error_string);

    /*
     * If the error log is bigger than the maximum size, remove a section
     */

    if(count($error_array)>$xerte_toolkits_site->max_error_size){

        array_splice($error_array,0,1);

    }

    /*
     * If the error log is bigger than the maximum size, remove a section
     */

    if(file_exists($xerte_toolkits_site->error_log_path . $user_name . ".log")){

        $error_message_handle = fopen($xerte_toolkits_site->error_log_path . $user_name . ".log" , "w");

        $string = implode("*", $error_array) . "<p>" . date("G:i:s - d/m/Y") . " " . $level . "<Br>" . $subject . "<Br>" . $content . "</p>*";

        fwrite($error_message_handle, $string);

        fclose($error_message_handle);

    }else{

        $error_message_handle = fopen($xerte_toolkits_site->error_log_path . $user_name . ".log" , "w");

        $string = "<p>" . date("G:i:s - d/m/Y") . " " . $level . "<Br>" . $subject . "<Br>" . $content . "</p>*";

        fwrite($error_message_handle, $string);

        fclose($error_message_handle);

    }


    /*
     * Make an error log file per level as well
     */

    if(file_exists($xerte_toolkits_site->error_log_path . $level . ".log")){

        $error_string = file_get_contents($xerte_toolkits_site->error_log_path . $level . ".log");

    }

    $error_array = explode("*",$error_string);

    if(count($error_array)>$xerte_toolkits_site->max_error_size){

        array_splice($error_array,0,1);

    }

    if(file_exists($xerte_toolkits_site->error_log_path . $level . ".log")){

        $error_message_handle = fopen($xerte_toolkits_site->error_log_path . $level . ".log" , "w");

        $string = implode("*", $error_array) . "<p>" . date("G:i:s - d/m/Y") . " " . $level . "<Br>" . $subject . "<Br>" . $content . "</p>*";

        fwrite($error_message_handle, $string);

        fclose($error_message_handle);

    }else{

        $error_message_handle = fopen($xerte_toolkits_site->error_log_path . $level . ".log" , "w");

        $string = "<p>" . date("G:i:s - d/m/Y") . " " . $level . "<Br>" . $subject . "<Br>" . $content . "</p>*";

        fwrite($error_message_handle, $string);

        fclose($error_message_handle);

    }


}

/**
 * 
 * Function email message
 * This function is used to send an error email meesage
 * @param string $user_name = username the error relates to
 * @param string $type = user / Admin / system
 * @param string $level = how serious the problem is, or whether it is a sucess
 * @param string $subject = The title of the error problem (a preci effectively)
 * @param string $content = The error message in full.
 * @version 1.0
 * @author Patrick Lockley
 */

function email_message($user_name, $type, $level, $subject, $content){

    global $xerte_toolkits_site;

    $email_subject = $user_name . " " . $type . " " . $level . " " . $subject;

    $email_content = date("G:i:s-d/m/Y") . "\n" . $content;

    mail($xerte_toolkits_site->email_error_list, $email_subject, $email_content,get_email_headers());

}
