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
if ($development) {
    ini_set('error_reporting', E_ALL);
}


require_once(dirname(__FILE__) . '/functions.php');
require_once(dirname(__FILE__) . '/library/autoloader.php');

if (!isset($xerte_toolkits_site)) {

    // create new generic object to hold all our config stuff in....
    $xerte_toolkits_site = new StdClass();

    /**
     * Access the database to get the variables
     */
    if (!is_file(dirname(__FILE__) . '/database.php')) {
        die("please run /setup");
    }

    require_once(dirname(__FILE__) . '/database.php');
    require_once(dirname(__FILE__) . '/website_code/php/database_library.php');
    if (!database_connect("", "")) {
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
    if ($row['integration_config_path'] != "") {
        require_once($row['integration_config_path']);
    }

    unset($row['integration_config_path']);
    foreach($row as $key => $value) {
        $xerte_toolkits_site->$key = $value;
    }
    
    // awkward ones.
    $xerte_toolkits_site->mimetypes = explode(",", $row['mimetypes']);
    
    $xerte_toolkits_site->name = $row['site_name'];
    
    $xerte_toolkits_site->demonstration_page = $xerte_toolkits_site->site_url . $row['demonstration_page'];

    $xerte_toolkits_site->news_text = base64_decode($row['news_text']);
    $xerte_toolkits_site->pod_one = base64_decode($row['pod_one']);
    $xerte_toolkits_site->pod_two = base64_decode($row['pod_two']);
    $xerte_toolkits_site->copyright = utf8_decode($row['copyright']);
    
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
/**
 *Change this to reflect the authentication mechanism you wish to use. 
 * Possible values: Ldap, Db, Static and Guest. (perhaps soon also Moodle).
 *Guest will let anyone login as the same user, once they click 'Login'. 
 *
 * See code in library/Xerte/Authentication/*.php - where each file should match up to the value used below.
 */
    
    $xerte_toolkits_site->authentication_method = 'Guest';
    //$xerte_toolkits_site->authentication_method = 'Ldap';
    //$xerte_toolkits_site->authentication_method = 'Db';
    //$xerte_toolkits_site->authentication_method = 'Static';
    //$xerte_toolkits_site->authentication_method = "Moodle";

    if(isset($_SESSION['integrate_with_moodle']) && $_SESSION['integrate_with_moodle'] == true) {
        // skip session_start()
    }
    session_start();
}
