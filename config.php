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
 
//moodle integration (please view moodle_integration_readme.txt before use)

/**
 *
 * Config page, sets up the site variable from the database
 *
 * @author Patrick Lockley
 * @version 1.0
 */
 
/**
 * $xerte_toolkits_site variable
 * Variable used to hold database settings
 * @global object $xerte_toolkits_site
 */
global $xerte_toolkits_site;

// Change this to FALSE for production sites.
// While set to true, PHP error reporting to the browser
// and logging (to /tmp/debug.log) are turned on; either of these may help you
// diagnose installation and integration issues. 
global $development;
$development = true;

ini_set('error_reporting', 0);
if ($development) {
    ini_set('error_reporting', E_ALL);
    // Change this to where you want the XOT log file to go; 
    // the webserver will need to be able to write to it.
    define('XOT_DEBUG_LOGFILE', '/tmp/debug.log');
}

if (version_compare(PHP_VERSION, '5.1.0', '<')) {
    // perhaps we should die at this point instead?
    trigger_error("You are running an unsupported version of PHP/XerteOnlineToolkits. Please run PHP v5.1 or above");
}

require_once(dirname(__FILE__) . '/functions.php');
require_once(dirname(__FILE__) . '/library/autoloader.php');

if (isset($xerte_toolkits_site)) {
    return;
}


// create new generic object to hold all our config stuff in....
$xerte_toolkits_site = new stdClass();


/** 
 * Comment/uncomment the below to suit. 
 */

/**
 * Note, if you choose sqlite (the default) an empty sqlite db will be 
 * created in your system's temp dir unless you've edited the below.
 * This will probably not survive a server reboot.
 */
//$xerte_toolkits_site->database_type = 'sqlite';
//$xerte_toolkits_site->database_location = sys_get_temp_dir() . '/xerte.sqlite';

$xerte_toolkits_site->database_type = 'mysql';

if(file_exists(dirname(__FILE__) . '/database.php')) {
    require_once(dirname(__FILE__) .'/database.php');
}

require_once(dirname(__FILE__) . '/website_code/php/database_library.php');


$ok = database_is_setup($xerte_toolkits_site);

if(!$ok) {
    if($xerte_toolkits_site->database_type == 'mysql' && is_dir(dirname(__FILE__) . '/setup')) {
        header("Location: {$_SERVER['REQUEST_URI']}setup/");
        exit(0);
    }

    /* run the magical sqlite auto-installer */
    if($xerte_toolkits_site->database_type == 'sqlite') {
        require_once(dirname(__FILE__) . '/website_code/php/database_library_sqlite.php');
        $ok = database_setup($xerte_toolkits_site->database_location);
    }
}

if(!$ok) {
    die("Database setup failed");
}

/* test database access */
if (!database_connect($xerte_toolkits_site)) {
    die("database.php isn't correctly configured; or we cannot connect to database");
}


$row = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}sitedetails");

/**
 * Access the database to get the variables
 * @version 1.0
 * @author Patrick Lockley
 * @copyright 2008,2009 University of Nottingham
 */
/**
 * Include any script that is used for configuration - for moodle this might be e.g. '/xampp/htdocs/moodle/config.php'.
 */
if ($row['integration_config_path'] != "") {
    require_once($row['integration_config_path']);
}

unset($row['integration_config_path']);
foreach ($row as $key => $value) {
    $xerte_toolkits_site->$key = $value;
}

// awkward ones.
$xerte_toolkits_site->mimetypes = explode(",", $row['mimetypes']);
$xerte_toolkits_site->name = $row['site_name'];
$xerte_toolkits_site->demonstration_page = $xerte_toolkits_site->site_url . $row['demonstration_page'];
$xerte_toolkits_site->news_text = base64_decode($row['news_text']);
$xerte_toolkits_site->pod_one = base64_decode($row['pod_one']);
$xerte_toolkits_site->pod_two = base64_decode($row['pod_two']);
//$xerte_toolkits_site->copyright = utf8_decode($row['copyright']);

$site_texts = explode("~~~", $row['site_text']);
if (count($site_texts) > 1) {
    $xerte_toolkits_site->site_text = $site_texts[0];
    $xerte_toolkits_site->tutorial_text = $site_texts[1];
} else {
    $xerte_toolkits_site->site_text = $site_texts[0];
    $xerte_toolkits_site->tutorial_text = "";
}


/**
 * Set up the string for the password protected play page
 */
$xerte_toolkits_site->form_string = base64_decode($row['form_string']);

/**
 * Set up the string for the peer review page
 */
$xerte_toolkits_site->peer_form_string = base64_decode($row['peer_form_string']);


$xerte_toolkits_site->basic_template_path = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path;
$xerte_toolkits_site->users_file_area_full = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short;

/**
 * SQL query string used by play,edit and preview pages
 */
$xerte_toolkits_site->play_edit_preview_query = base64_decode($row['play_edit_preview_query']);

/**
 * Error handling settings
 */
$xerte_toolkits_site->error_log_path = $xerte_toolkits_site->root_file_path . $row['error_log_path'];

$xerte_toolkits_site->flash_flv_skin = $xerte_toolkits_site->site_url . $row['flash_flv_skin'];


$dir = opendir(dirname(__FILE__) . "/modules/");

// I'm not sure why we allow this path to be set via the DB. It'd make more sense to fix it to dirname(__FILE__), which will cope with the site moving.
$xerte_toolkits_site->root_file_path = dirname(__FILE__) . '/';

$learning_objects = new StdClass();

foreach (glob(dirname(__FILE__) . "/modules/**/templates/**/*.info") as $infoFile) {

    if (preg_match('!/modules/(\w+)/templates/(\w+)/!', $infoFile, $matches)) {

        $attributeName = $matches[1] . '_' . $matches[2];

        $templateProperties = new StdClass();
        $learning_objects->{$attributeName} = $templateProperties;

        $info = file($infoFile, FILE_SKIP_EMPTY_LINES);
        if ($info === FALSE || empty($info)) {
            die("Invalid template info file - check $infoFile is valid.");
        }
        foreach ($info as $line) {
            $attr_data = explode(":", $line, 2);
            if (empty($attr_data) || sizeof($attr_data) != 2) {
                continue;
            }
            switch (trim(strtolower($attr_data[0]))) {
                case "editor size" : $templateProperties->editor_size = trim($attr_data[1]);
                    break;
                case "preview size" : $templateProperties->preview_size = trim($attr_data[1]);
                    break;
                case "preview filename" : $templateProperties->preview_file = trim($attr_data[1]);
                    break;
                case "public filename" : $templateProperties->public_file = trim($attr_data[1]);
                    break;
                case "supports" : $templateProperties->supports = explode(",", trim($attr_data[1]));
                    break;
            }
        }
    } else {
        die("Invalid template name : $infoFile");
    }
}
$xerte_toolkits_site->learning_objects = $learning_objects;

/* Optional :
  require_once("session_handler.php");

  $session_handle = new toolkits_session_handler();

  session_set_save_handler(
  array($session_handle,'xerte_session_open'),
  array($session_handle,'xerte_session_close'),
  array($session_handle,'xerte_session_read'),
  array($session_handle,'xerte_session_write'),
  array($session_handle,'xerte_session_destroy'),
  array($session_handle,'xerte_session_clean'));
 */
require_once(dirname(__FILE__) . '/auth_config.php');

