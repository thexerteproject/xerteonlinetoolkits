<?php
//moodle integration (please view moodle_integration_readme.txt before use)
//The require path below is the path to the moodle installation config file 
//this needs to be the path from root rather than something like ../../moodle/config.php
//e.g. this might be something like require("/home/yourdomain/public_html/config.php");
//set this same path in moodle_integration.txt also
//require("/xampp/htdocs/moodle/config.php");

/**
 * 
 * Config page, sets up the site variable from the database
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

/** 
 * $xerte_toolkits_site variable
 * Variable used to hold database settings
 * @global object $xerte_toolkits_site
 */

// Same as error_reporting(E_ALL);
global $xerte_toolkits_site;

// Change this to FALSE for production sites.
global $development;
$development = true;

ini_set('error_reporting', 0);
if($development) {
    ini_set('error_reporting', E_ALL);
}

if(!function_exists('_debug')) {
    /**
     * @param string $string - the message to write to the debug file.
     * @param int $up - how far up the call stack we go to; this affects the line number/file name given in logging
     */
    function _debug($string, $up = 0) {
        global $development;
        if(isset($development) && $development) {
            // yes, we really don't want to report file write errors if this doesn't work.
            $backtrace = debug_backtrace();
            if(isset($backtrace[$up]['file'])) {
                $string = $backtrace[$up]['file'] . $backtrace[$up]['line'] . $string;
            }
            @file_put_contents('/tmp/debug.log', date('Y-m-d H:i:s ') . $string . "\n", FILE_APPEND);
        }
    }
}
if(!function_exists('_load_language_file')) {
    function _load_language_file($file_path) { 
        if(isset($_SESSION['toolkits_language'])) {
            $file_path = dirname(__FILE__) . '/languages/' . $_SESSION['toolkits_language'] . "/" . $file_path;
        }
        else {
            // additional logic could use e.g. $_GET['language'] or $_COOKIE['language'] at this point... or something like Zend_Locale and HTTP accept headers...
            // we'll just fall back to assuming en-gb if nothing else is specified here.
            $file_path = dirname(__FILE__) . '/languages/en-gb/' . $file_path;
        }
        require_once($file_path);
        return true;
    }
}

if(!isset($xerte_toolkits_site)){

    // create new generic object to hold all our config stuff in....
    $xerte_toolkits_site = new StdClass();

    /** 
     * Access the database to get the variables
     */
    if(!is_file(dirname(__FILE__) . '/database.php')) {
        die("please run /setup");
    }

    require_once(dirname(__FILE__) . '/database.php');
    
    require_once(dirname(__FILE__) . '/website_code/php/database_library.php');
    if(!database_connect("","")) {
        die("database.php isn't correctly configured; cannot connect to database; have you run /setup?");
    }    

    $row = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}sitedetails");

    /** 
     * Access the database to get the variables
     * @version 1.0
     * @author Patrick Lockley
     * @copyright 2008,2009 University of Nottingham
     */

    /**
     * Include any script that is used for configuration
     */

    if($row['integration_config_path']!=""){
        require_once($row['integration_config_path']);
    }

    /** 
     * Site variables
     */

    $xerte_toolkits_site->site_url = $row['site_url'];
    $xerte_toolkits_site->apache = $row['apache'];
    $xerte_toolkits_site->integration_config_path = $row['integration_config_path'];
    $xerte_toolkits_site->admin_username = $row['admin_username'];
    $xerte_toolkits_site->admin_password = $row['admin_password'];
    $xerte_toolkits_site->mimetypes = explode(",",$row['mimetypes']);

    /** 
     * Site session variables
     */

    $xerte_toolkits_site->site_session_name = $row['site_session_name'];

    /** 
     * Configure the look and feel for index.php page
     */

    $xerte_toolkits_site->site_title = $row['site_title'];
    $xerte_toolkits_site->name = $row['site_name'];
    $xerte_toolkits_site->site_logo = $row['site_logo'];
    $xerte_toolkits_site->organisational_logo = $row['organisational_logo'];
    $xerte_toolkits_site->welcome_message = $row['welcome_message'];
    $xerte_toolkits_site->demonstration_page = $xerte_toolkits_site->site_url . $row['demonstration_page'];

    $xerte_toolkits_site->site_text = $row['site_text'];
    $xerte_toolkits_site->news_text = base64_decode($row['news_text']);
    $xerte_toolkits_site->pod_one = base64_decode($row['pod_one']);
    $xerte_toolkits_site->pod_two = base64_decode($row['pod_two']);
    $xerte_toolkits_site->copyright = utf8_decode($row['copyright']);

    /** 
     * Configure the RSS Feed title
     */

    $xerte_toolkits_site->rss_title = $row['rss_title'];
    $xerte_toolkits_site->synd_publisher = $row['synd_publisher'];
    $xerte_toolkits_site->synd_rights = $row['synd_rights'];
    $xerte_toolkits_site->synd_license = $row['synd_license'];

    /** 
     * Set up the string for the password protected play page
     */

    $xerte_toolkits_site->form_string = base64_decode($row['form_string']);

    /** 
     * Set up the string for the peer review page
     */

    $xerte_toolkits_site->peer_form_string = base64_decode($row['peer_form_string']);

    /** 
     * Site paths
     */

    $xerte_toolkits_site->module_path = $row['module_path'];
    $xerte_toolkits_site->website_code_path = $row['website_code_path'];
    $xerte_toolkits_site->users_file_area_short = $row['users_file_area_short'];
    $xerte_toolkits_site->php_library_path = $row['php_library_path'];
    $xerte_toolkits_site->root_file_path = $row['root_file_path'];
    $xerte_toolkits_site->basic_template_path = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path;
    $xerte_toolkits_site->users_file_area_full = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short;
    $xerte_toolkits_site->import_path = $row['import_path'];

    /** 
     * SQL query string used by play,edit and preview pages
     */

    $xerte_toolkits_site->play_edit_preview_query = base64_decode($row['play_edit_preview_query']);

    /** 
     * Error handling settings
     */

    $xerte_toolkits_site->error_log_path = $xerte_toolkits_site->root_file_path . $row['error_log_path'];
    $xerte_toolkits_site->email_error_list = $row['email_error_list'];
    $xerte_toolkits_site->error_log_message= $row['error_log_message'];
    $xerte_toolkits_site->error_email_message= $row['error_email_message'];
    $xerte_toolkits_site->max_error_size= $row['max_error_size'];

    /** 
     * LDAP Settings
     */

    $xerte_toolkits_site->ldap_host = $row['ldap_host'];
    $xerte_toolkits_site->ldap_port = $row['ldap_port'];
    $xerte_toolkits_site->bind_pwd = $row['bind_pwd'];
    $xerte_toolkits_site->basedn = $row['basedn'];
    $xerte_toolkits_site->bind_dn = $row['bind_dn'];
    $xerte_toolkits_site->LDAP_preference = $row['LDAP_preference'];
    $xerte_toolkits_site->LDAP_filter = $row['LDAP_filter'];

    /** 
     * Xerte settings
     */

    $xerte_toolkits_site->flash_save_path = $row['flash_save_path'];
    $xerte_toolkits_site->flash_upload_path = $row['flash_upload_path'];
    $xerte_toolkits_site->flash_preview_check_path = $row['flash_preview_check_path'];
    $xerte_toolkits_site->flash_flv_skin = $xerte_toolkits_site->site_url . $row['flash_flv_skin'];

    /** 
     * Email settings
     */

    $xerte_toolkits_site->site_email_account = $row['site_email_account'];
    $xerte_toolkits_site->headers = $row['headers'];
    $xerte_toolkits_site->email_to_add_to_username = $row['email_to_add_to_username'];

    /** 
     * RSS Proxy settings
     */

    $xerte_toolkits_site->proxy1 = $row['proxy1'];
    $xerte_toolkits_site->port1 = $row['port1'];

    /** 
     * Set up the feedback list from the feedback page
     */

    $xerte_toolkits_site->feedback_list = $row['feedback_list'];

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
	 
    session_start();
    // fall back to en-gb if nothing is chosen elsewhere.
    if(!isset($_SESSION['toolkits_language'])) {
        $_SESSION['toolkits_language'] = "en-gb";
    }
}
