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
 * Play page, displays the template to the end user
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */



require_once(dirname(__FILE__) . "/config.php");

_load_language_file("/play.inc");

require_once $xerte_toolkits_site->php_library_path . "display_library.php";
require_once $xerte_toolkits_site->php_library_path . "template_library.php";



//error_reporting(E_ALL);
//ini_set('display_errors',"ON");

/**
 *
 * Function check_host
 * This function checks http security settings
 * @param string $hostname = should be the $SERVER referrer
 * @param string $setting = what the security setting in play_security_details is
 * @return bool True or False if two params match
 * @version 1.0
 * @author Patrick Lockley
 */
function check_host($hostname, $setting)
{
    $hostname = substr($hostname, 0, strlen($setting));
    if ($hostname == $setting) {
        return true;
    } else {
        return false;
    }
}

/**
 *
 * Function check_ip
 * This function checks IP security settings
 * @param string $hostname = should be the $_SERVER REMOTE_ADDR
 * @param string $setting = what the security setting in play_security_details is
 * @return bool True or False if two params match
 * @version 1.0
 * @author Patrick Lockley
 */
function check_ip($ip_address, $security_settings)
{

    /*
     * Multiple IP Addresses supported, so separate them into individual records
     */

    $security_array = explode(",", $security_settings);
    while ($host_ip = array_pop($security_array)) {

        /*
         * Check for an asterisk. An asterisk indicates you have a domain such as 10.*
         */
        if (strpos($host_ip, "*") === false) {
            /*
             * No asterisk, so do a straight comparison
             */

            if (strcmp($ip_address, $host_ip) == 0) {

                $flag = true;
            } else {

                $flag = false;
            }
        } else {

            /*
             * Found an asterisk so loop though the individual numbers if 192, then 168 checking for equivalence
             */

            $security_range = explode(".", $host_ip);
            $ip_range = explode(".", $ip_address);
            $flag = false;
            for ($x = 0; $x <= 3; $x++) {
                if ($security_range[$x] == "*") {
                    $x = 5;
                } else {
                    if ($ip_range[$x] == $security_range[$x]) {
                        $flag = true;
                    } else {
                        $flag = false;
                    }
                }
            }
        }
    }

    if ($flag == true) {
        return true;
    } else {
        return false;
    }
}

/**
 *
 * Function check_security_type
 * This function checks database settings to see if non standard play security options have been met
 * @param string $security_setting = the value taken from security_setting in play_security_details
 * @return bool True or False if two params match
 * @version 1.0
 * @author Patrick Lockley
 */
function check_security_type($security_setting)
{

    if ($security_setting != "") {

        if (substr($security_setting, 0, 4) == "http") {

            return check_host($_SERVER['HTTP_REFERER'], $security_setting);
        } else {

            return check_ip($_SERVER['REMOTE_ADDR'], $security_setting);
        }
    } else {

        return false;
    }
}

if (!isset($_GET['template_id']) || !is_numeric($_GET['template_id'])) {

    /*
     * Was not numeric, so display error message
     */
    echo file_get_contents($xerte_toolkits_site->website_code_path . "error_top") . " " . PLAY_RESOURCE_FAIL . " </div></div></body></html>";
    exit(0);
}

$safe_template_id = (int) $_GET['template_id'];

/*
 * Check to see whether it is less than the highest ID we have created
 */

if (get_maximum_template_number() < $safe_template_id) {

    echo file_get_contents($xerte_toolkits_site->website_code_path . "error_top") . " " . PLAY_RESOURCE_FAIL . " </div></div></body></html>";
    die();
}

/*
 * Take the query from site variable and alter it to suit this request
 */

$prefix = $xerte_toolkits_site->database_table_prefix;
$sql = "SELECT otd.template_name, ld.username, otd.template_framework, tr.user_id, tr.folder, tr.template_id, td.access_to_whom, td.extra_flags, td.template_name as zipname " .
    " FROM {$prefix}originaltemplatesdetails otd, {$prefix}templaterights tr, {$prefix}templatedetails td, {$prefix}logindetails ld " .
    " WHERE td.template_type_id = otd.template_type_id AND td.creator_id = ld.login_id AND tr.template_id = td.template_id AND tr.template_id= ? AND role = ?";

$row_play = db_query_one($sql, array($safe_template_id, 'creator'));

/*
 * Is the file in the recycle bin?
 */

$row_recycle = db_query_one("SELECT folder_name FROM {$xerte_toolkits_site->database_table_prefix}folderdetails WHERE folder_id = ?", array($row_play['folder']));

if ($row_recycle['folder_name'] == "recyclebin") {

    echo file_get_contents($xerte_toolkits_site->website_code_path . "error_top") . " " . PLAY_RESOURCE_FAIL . " </div></div></body></html>";
    exit(0);
}

require_once $xerte_toolkits_site->php_library_path . "screen_size_library.php";

/*
 * Ge show template functions for this 'module'  / 'template framework'
*/
require_once $xerte_toolkits_site->root_file_path . "modules/" . $row_play['template_framework'] . "/play.php";

/*
 * Fix for NULL number_of_uses
 */
db_query("UPDATE {$xerte_toolkits_site->database_table_prefix}templatedetails SET number_of_uses = 0 WHERE ISNULL(number_of_uses)");


/*
 * Start to check the access_to_whom settings from templatedetails for this template
 */


if ($row_play['access_to_whom'] == "Private") {
    /*
     * Private - so do nothing
     */

    dont_show_template();

} else if ($row_play['access_to_whom'] == "Public") {

    /*
     * Public - Increment the number of users and show the template
     */

    db_query("UPDATE {$xerte_toolkits_site->database_table_prefix}templatedetails SET number_of_uses=number_of_uses+1 WHERE template_id=?", array($safe_template_id));

    show_template($row_play);

} else if ($row_play['access_to_whom'] == "Password") {

    /*
     * Password protected - Check if there has been a post
     */

   // if ($_SERVER['REQUEST_METHOD'] == 'POST') {

   require_once $xerte_toolkits_site->php_library_path . "login_library.php";
   _load_language_file("/website_code/php/display_library.inc");

  if (!isset($mysqli)) {
    $mysqli = new mysqli($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password, $xerte_toolkits_site->database_name);
    if ($mysqli->error) {
      try {
        throw new Exception("0MySQL error $mysqli->error <br> Query:<br> $query", $mysqli->errno);
      } catch (Exception $e) {
        echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
        echo nl2br($e->getTraceAsString());
      }
    }
  }
  if (!isset($lti)) {
    require_once('LTI/ims-lti/UoN_LTI.php');
    if (strlen($xerte_toolkits_site->database_table_prefix) > 0) {
      $lti = new UoN_LTI($mysqli, array('table_prefix' => $xerte_toolkits_site->database_table_prefix));
    } else {
      $lti = new UoN_LTI($mysqli);
    }
    if(session_id()=='') {
      session_start();
    }
    $lti->init_lti();

  }


if($lti->valid) {
  $success=true;
  unset($errors);
} else {
  $returnedproc = login_processing(false);
  list($success, $errors) = $returnedproc;
}

  if ($success && empty($errors)) {
    //sucessfull authentication
    db_query("UPDATE {$xerte_toolkits_site->database_table_prefix}templatedetails SET number_of_uses=number_of_uses+1 WHERE template_id=?", array($safe_template_id));

    show_template($row_play);
  } else {
    html_headers();
    login_prompt($errors);
  }
        /*
         * Check the password
         */

/*        $auth = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
        if ($auth->check() && isset($_POST['login']) && isset($_POST['password']) && $auth->login($_POST['login'], $_POST['password'])) {

            /*
             * Update uses and display the template
             *-/

            db_query("UPDATE {$xerte_toolkits_site->database_table_prefix}templatedetails SET number_of_uses=number_of_uses+1 WHERE template_id=?", array($safe_template_id));

            require $xerte_toolkits_site->root_file_path . "modules/" . $row_play['template_framework'] . "/play.php";

            show_template($row_play);

        } else {

            /*
             * Login failure
             *-/

            $buffer = $xerte_toolkits_site->form_string . $temp[1] . "<p>" . PLAY_LOGON_FAIL . ".</p></center></body></html>";

            echo $buffer;
        }
    } else {

        /*
         * There has been no postage so echo the site variable to display the login string
         *-/

        echo $xerte_toolkits_site->form_string;*/
  //  }
} else if (substr($row_play['access_to_whom'], 0, 5) == "Other") {

    /*
     * The Other attribute has been set - so break the string down to obtain the host
     */

    $test_string = substr($row_play['access_to_whom'], 6, strlen($row_play['access_to_whom']));
    _debug("'Other' security is active for '" . $test_string . "', the current referrer is: '" . $_SERVER['HTTP_REFERER'] . "'");
    /*
     * Can only check against this variable, if I can't find it (say pop ups) no choice but to fail
     */

    if (strlen($_SERVER['HTTP_REFERER']) != 0) {

        if (strpos($_SERVER['HTTP_REFERER'], $test_string) == 0) {

            db_query("UPDATE {$xerte_toolkits_site->database_table_prefix}templatedetails SET number_of_uses=number_of_uses+1 WHERE template_id=?", array($safe_template_id));

            show_template($row_play);

        } else {
            dont_show_template('Doesnt Match Referer:' . $_SERVER['HTTP_REFERER']);
        }
    } else {
      dont_show_template('No HTTP Referer');
    }
} else if (sizeof($query_for_security_content_response) > 0) {

    /*
     * A setting from play_security_details might be in use, as such, check to see if it is, and then loop through checking if one is valid.
     */

    $flag = false;

    foreach ($query_for_security_content_response as $row_security) {

        /*
         * Check each setting to see if true
         */

        if ($row_play['access_to_whom'] == $row_security['security_setting']) {

            if (check_security_type($row_security['security_data'])) {

                show_template($row_play);

                $flag = true;

                break;

            } else {

                $flag == false;
            }
        }
    }

    if ($flag == false) {

        dont_show_template();
    }
} else {
    dont_show_template();
}
