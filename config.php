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
$development = false;

ini_set('error_reporting', 0);
ini_set('display_errors', 0);
if ($development) {
    ini_set('error_reporting', E_ALL);
    // Change this to where you want the XOT log file to go; 
    // the webserver will need to be able to write to it.
    define('XOT_DEBUG_LOGFILE', dirname(__FILE__) . '/error_logs/debug.log');
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

if ($row['integration_config_path'] != "" && (!isset($tsugi_disable_xerte_session) || $tsugi_disable_xerte_session !== true)) {
    require_once($row['integration_config_path']);
}

unset($row['integration_config_path']);
foreach ($row as $key => $value) {
    $xerte_toolkits_site->$key = $value;
}

if($xerte_toolkits_site->tsugi_dir == "" || $xerte_toolkits_site->tsugi_dir == null)
{
	$xerte_toolkits_site->tsugi_dir = $xerte_toolkits_site->root_file_path . "tsugi/";
}

// awkward ones.
$xerte_toolkits_site->enable_mime_check = true_or_false($row['enable_mime_check']);
$xerte_toolkits_site->mimetypes = explode(",", $row['mimetypes']);
$xerte_toolkits_site->enable_file_ext_check = true_or_false($row['enable_file_ext_check']);
$xerte_toolkits_site->file_extensions = explode(",", strtolower($row['file_extensions']));
// Remove empty extensions
$xerte_toolkits_site->file_extensions = array_filter($xerte_toolkits_site->file_extensions, function($ext) {
    return !empty(trim($ext));
});
$xerte_toolkits_site->enable_clamav_check = true_or_false($row['enable_clamav_check']);
$xerte_toolkits_site->name = $row['site_name'];
$xerte_toolkits_site->demonstration_page = $xerte_toolkits_site->site_url . $row['demonstration_page'];
$xerte_toolkits_site->news_text = base64_decode($row['news_text']);
$xerte_toolkits_site->pod_one = base64_decode($row['pod_one']);
$xerte_toolkits_site->pod_two = base64_decode($row['pod_two']);
//$xerte_toolkits_site->copyright = utf8_decode($row['copyright']);
$xerte_toolkits_site->default_theme_xerte = $row['default_theme_xerte'];
$xerte_toolkits_site->default_theme_site = $row['default_theme_site'];

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

// If $xerte_toolkits_site->users_file_area_path is set and is an absolute path, use it as is.
// Otherwise, use $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short as the full path.
if ($xerte_toolkits_site->users_file_area_path !== null &&
    $xerte_toolkits_site->users_file_area_path !== '' &&
    (substr($xerte_toolkits_site->users_file_area_path, 0, 1) == '/' ||
    substr($xerte_toolkits_site->users_file_area_path, 1, 1) == ':')){
    $xerte_toolkits_site->users_file_area_full = $xerte_toolkits_site->users_file_area_path;
} else {
    $xerte_toolkits_site->users_file_area_full = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short;
}

/**
 * SQL query string used by play,edit and preview pages
 */
$xerte_toolkits_site->play_edit_preview_query = base64_decode($row['play_edit_preview_query']);

/**
 * Error handling settings
 */
$xerte_toolkits_site->error_log_path = $xerte_toolkits_site->root_file_path . $row['error_log_path'];

$xerte_toolkits_site->flash_flv_skin = $xerte_toolkits_site->site_url . $row['flash_flv_skin'];

/* Record the last error reported during file checks. */
global $last_file_check_error;


$dir = opendir(dirname(__FILE__) . "/modules/");

// I'm not sure why we allow this path to be set via the DB. It'd make more sense to fix it to dirname(__FILE__), which will cope with the site moving.
$root_file_path = str_replace(DIRECTORY_SEPARATOR, '/', realpath(__DIR__)) . '/';
if (file_exists($root_file_path . 'config.php')) {
    $xerte_toolkits_site->root_file_path = $root_file_path;
}
if (file_exists($root_file_path . 'import')) {
    $xerte_toolkits_site->import_path = $root_file_path . 'import/';
}

// Try to get site_url in the same way
if (file_exists(__DIR__ . "/reverse_proxy_conf.php"))
{
    require_once(__DIR__ . "/reverse_proxy_conf.php");
}
$host = (isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : '');
if (isset($_SERVER['HTTP_X_FORWARDED_HOST']))
{
    $host = $_SERVER['HTTP_X_FORWARDED_HOST'];
}
$port = (isset($_SERVER['SERVER_PORT']) ? $_SERVER['SERVER_PORT'] : 80);
$scheme = (isset($_SERVER['HTTPS']) ? $_SERVER['HTTPS'] : false) || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ? 'https://' : 'http://';

if ($port == 80 || $port == 443 || isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
    $port = '';
}
else{
    $port = ':' . $port;
}

// get subdir from $xerte_toolkits_site->site_url path stored in Db
$subdir = '/';
$subdir_pos = strpos($xerte_toolkits_site->site_url, '/', 8);
if ($subdir_pos !== false)
{
    $subdir = substr($xerte_toolkits_site->site_url, $subdir_pos);
}
if ($host != '' && $scheme != '' && (!isset($force_site_url_from_db) || !$force_site_url_from_db)) {
    $site_url = $scheme . $host . $port . $subdir;
    $xerte_toolkits_site->site_url = $site_url;
}

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
// set authentication method to guest if not set in db via management area
if (!isset($xerte_toolkits_site->authentication_method) || $xerte_toolkits_site->authentication_method=="") {
    $xerte_toolkits_site->authentication_method = 'Guest';
    $res = db_query_one("update {$xerte_toolkits_site->database_table_prefix}sitedetails set authentication_method = 'Guest' where site_id=1");
}
if (file_exists(dirname(__FILE__) . '/auth_config.php'))
{
    require_once(dirname(__FILE__) . '/auth_config.php');
}
else{
    $xerte_toolkits_site->altauthentication = "";
}

/* Set flag of whether oai-pmh harvesting is configured and available */
$xerte_toolkits_site->oai_pmh = file_exists($xerte_toolkits_site->root_file_path . "oai-pmh/oai_config.php");

if (file_exists(dirname(__FILE__) . '/lrsdb_config.php'))
{
    require_once(dirname(__FILE__) . '/lrsdb_config.php');
}

if(!isset($tsugi_disable_xerte_session) || $tsugi_disable_xerte_session !== true)
{
    if($xerte_toolkits_site->authentication_method == "Moodle") {
        // skip session_start() as we'll probably stomp on Moodle's session if we do.
    }
    else {

        ini_set('session.cookie_httponly', '1');
        if (isset($scheme) && $scheme == 'https://') {
            ini_set('session.cookie_secure', '1');
        }
        session_start();
    }
}

// Check whether elevated rights are active
if (isset($_SESSION['elevated']) && $_SESSION['elevated'])
{
    $xerte_toolkits_site->rights = 'elevated';
}

