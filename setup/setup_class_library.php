<?php 
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Setup base class
 *
 * @author      @radixmo
 * @since       version 3.01
 * @package     Xerte Online Toolkits
 * @subpackage  Setup
 */
class Setup {

    // Full URL to installation
    public $xot_url = '';
    // DOCUMENT_ROOT 'WITH' trailing slash
    public $root_path = '';


    public function __construct() {
        $this->root_path    = substr(getcwd(), 0, strlen(getcwd()) - 5);

        $http =  $this->getProtocol();

        $this->xot_url = $http . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    }

    public function isSecure() {
        return
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || $_SERVER['SERVER_PORT'] == 443;
    }

    public function getProtocol()
    {
        return ($this->isSecure() ?  'https://' : 'http://');
    }

    public function getRootPath() {
        // $this->root_path     = str_replace('setup/index.php', '', $_SERVER['SCRIPT_FILENAME']);
        return $this->root_path;
    }

    public function getXotUrl() {

        $this->xot_url = str_replace('setup/', '', $this->xot_url);
        $this->xot_url = str_replace('requirements.php?', '', $this->xot_url);

        return $this->xot_url;
    }
}

class SetupRequirements {

  public static $php_version = '5.2.0';

    static function phpVersion() {
        $check                  = new stdClass();
        $check->version = phpversion();

        // uncomment next line to test a version that fails
        // $check->version = '4.2';

        if (version_compare($check->version, self::$php_version, "<")) {
            $check->passed = false;
            $check->css = 'error';
            $check->message = 'older than ' . self::$php_version . ' ('. $check->version . ')';
        } else {
            $check->passed = true;
            $check->css = 'ok';
            $check->message = ' ' . $check->version . ' - OK';
        }

        return $check;
    }

    static function MysqlCheck() {
        $check                  = new stdClass();
        $check->passed  = false;

        if (extension_loaded ('PDO' ) // returns boolean
            && extension_loaded('pdo_mysql'))
        {
            $check->passed = true;
        }

        // uncomment next line to simulate failure
        // $check->passed = false;

        return $check;
    }

    static function folders($setup = '') {
        $check                  = new stdClass();
        $root                   = dirname($setup);
        $check->folders = array(
            'Root'              => $root,
            'Setup'             => $setup,
            'User files'    => $root . "/USER-FILES",
            'Error log'     => $root . "/error_logs",
            'Import'            => $root . "/import"
        );

        return $check;
    }

    static function fileSystem($path = '') {
        $check                  = new stdClass();
        $check->passed  = false;
        $error_message = 'Please fix by changing the permission to 0777 or 
            changing the ownership to the user account that runs the webserver.';

        if (_is_writable($path)) {
            $check->passed = true;
            $check->css = 'ok';
            $check->message = 'OK';
        } else {
            $check->passed = false;
            $check->css = 'error';
            $check->message = $error_message;
        }

        // uncomment next line to simulate failure
        // $check->passed = false;

        return $check;
    }
}

class SetupDatabase {

    public $connection      = '';
    public $settings        = '';
    public $error_msg       = 'Sorry, the attempt to connect to the host 
        has failed. MySQL reports the following error -';
    public $debug           = 'No error message defined.';
    public $conn_error      = '';

    public function __construct( $post = array(), $session = array() ) {
        $this->settings = new stdClass();
        $this->settings->database_type     = "mysql";

        if (isset($post['host'])) {
            // On windows connecting to a MySQL server through localhost is extremely slow, as IPv6 is tried first
            // That connection times out, and then IPv4 is used, so use 127.0.0.1 instead of localhost
            if ($post['host'] == 'localhost') {
                $this->settings->database_host = '127.0.0.1';
            } else {
                $this->settings->database_host = $post['host'];
            }
        }

        if (isset($post['database_prefix'])) {
            $this->settings->database_prefix = $post['database_prefix'];
        }

        if (isset($post['username']) && isset($post['password']))
        {
            $this->settings->database_username = $post['username'];
            $this->settings->database_password = $post['password'];
        }

        $this->updateSettings($post, $session);
    }

    private function updateSettings($post, $session) {
        if ( isset($post['type']) ) {
            $this->settings->database_type = $post['type'];
        }

        if ( isset($session['DATABASE_HOST']) ) {
            $this->settings->database_host = $session['DATABASE_HOST'];
        }

        if ( isset($session['DATABASE_NAME']) ) {
            $this->settings->database_name = $session['DATABASE_NAME'];
        }

        if ( isset($session['DATABASE_PREFIX']) ) {
            $this->settings->database_prefix = $session['DATABASE_PREFIX'];
        }

        if ( isset($post['account']) ) {
            $this->settings->database_username = $post['account'];
        }

        if ( isset($post['account']) ) {
            $this->settings->database_password = $post['accountpw'];
        }
    }

    public function getSettings() {
        return $this->settings;
    }

    public function setName( $name = '' ) {
        $this->settings->database_name = $name;
    }

    /**
     * Create PDO connection to the database.
     * @return PDO instance
     * @throws PDOException if it's not setup / working etc.
     */
    public function connect() 
    {
        global $xerte_toolkits_site, $dberr;
        /*
         * Try to connect
         */

        $dsn = false;

        if ($xerte_toolkits_site->database_type == 'sqlite') {
            $dsn = "sqlite:{$xerte_toolkits_site->database_location}";
            /* not relevant parameters */
            $xerte_toolkits_site->database_username = null;
            $xerte_toolkits_site->database_password = null;
        }

        if ($dsn == false) {
            // default to MySQL.
            if (isset($xerte_toolkits_site->database_name))
            {
                $dsn = "mysql:dbname={$xerte_toolkits_site->database_name};host={$xerte_toolkits_site->database_host}";
            }
            else if (isset($xerte_toolkits_site->database_host))
            {
                $dsn = "mysql:host={$xerte_toolkits_site->database_host}";
            }
            else
            {
                return false;
            }
        }

        $options = array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION);

        try
        {
            $db_connection = new PDO($dsn, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password, $options);
        }
        catch(PDOException $e) {
            $this->conn_error = $e->getMessage();
            // _debug("Failed to connect to db: {$e->getMessage()}");
            return false;
        }
        $db_connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT);

        return $db_connection;
    }

    public function runQuery( $query = false ) {
        return db_query($query);
    }

    static public function getError( $error_msg = '' ) {
        return $error_msg;
    }

    public function create($connection = '', $query = '') {
        // Sets an attribute on the database handle.
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        try {
            // Executes an SQL statement, returning a result set (if any) as a PDOStatement object
            $statement = $connection->query($query);
        }
        catch(PDOException $e) {
            $this->_debug("Failed to connect to db: {$e->getMessage()}");
            return false;
        }

        return true;
    }

    public function _debug( $string = '' ) {
        if ($string) {
            $this->debug = $string;
        }
    }

    public function getDebug() {
        return $this->debug;
    }

    public function getSQL($file = 'basic.sql') {
        $sql = file_get_contents($file);
        // replace database_prefix with placeholder in basic.sql
        if ( $_POST['database_prefix'] != "" ) {
          $sql = str_replace("$",$_POST['database_prefix'],$sql);
        } else {
          // strip database_prefix placeholder from basic.sql
          $sql = str_replace("$","",$sql);
        }

        // replace <databasename> placeholder with database_name in basic.sql
        $sql = str_replace("<databasename>",$_POST['database_name'],$sql);

        return $sql;
    }

    static public function setSession($post, $xerte_toolkits_site) {
        $_SESSION['DATABASE_HOST']      = $xerte_toolkits_site->database_host;
        $_SESSION['DATABASE_NAME']      = $post['database_name'];
        $_SESSION['DATABASE_PREFIX']    = $post['database_prefix'];
        if (isset($post['username']) && isset($post['password']))
        {
            $_SESSION['MYSQL_DBA']          = $post['username'];
            $_SESSION['MYSQL_DBAPASSWORD']  = $post['password'];
        }
    }
}

/**
 * Setup page class
 *
 * @author      @radixmo
 * @since       version 3.01
 * @package     Xerte Online Toolkits
 * @subpackage  Setup
 */
class SetupPage extends Setup {

    protected $login = '';
    protected $page  = array(); // holds page variables

    public function getPage() {
        $this->page['name'] = 'settings'; // default if not logged in
        // $this->login = new ManagementLogin( $this->settings );

        $msg = $this->login->getLoginMessage();
        if ( !empty($msg) ) {
            $this->page['name']          = 'login';
            $this->page['login_message'] = $msg;
        }

        return $this->showPage();
    }

    protected function showPage() {
        $method_name = 'get' . ucwords($this->page['name']) . 'Page';

        if ( method_exists( $this, $method_name) ) {
            // set path to template files
            $this->file_path = $this->settings->root_file_path . '/' 
                . $this->settings->php_library_path . '/' . $this->view_path . '/';
            return $this->{$method_name}();
        } else {
            die( "Error: ManagementPage::" . $this->page['name'] . " method does not exist.\n" );
        }
    }

    protected function getLoginPage() {

        $this->page['isAdmin'] = '';
        
        return $this->pageDisplayHelper();
    }

    protected function getSettingsPage() {

        if (($this->login->getUsername() == $this->settings->admin_username) 
            && ($this->login->getPassword() == $this->settings->admin_password)) {

            $_SESSION['toolkits_logon_id'] = "site_administrator";
            $mysql_id = database_connect("management.php database connect success", 
                "management.php database connect fail");
            $this->page['isAdmin'] = true;        
        } else {
            $this->getLoginPage();
            return;
        }

        return $this->pageDisplayHelper();
    }

    private function pageDisplayHelper() {
        // Set default header branding images 
        $this->page['header_img_right'] = 'website_code/images/apereoLogo.png';
        $this->page['header_img_left']  = 'website_code/images/logo.png';

        if (file_exists($this->settings->root_file_path . "branding/logo_right.png")) {
            $this->page['header_img_right'] = 'branding/logo_right.png';
        }

        if (file_exists($this->settings->root_file_path . "branding/logo_left.png")) {
            $this->page['header_img_left'] = 'branding/logo_left.png';
        }

        require_once ( $this->file_path . 'html/' . $this->page['name'] . '.php');
    }
}

// /setup/setup_class_library.php