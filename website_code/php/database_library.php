<?php

require_once(dirname(__FILE__) . "/error_library.php");
/**	
 * 
 * Database library, code for connecting to the database
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

// horrible includes.
if(function_exists('database_connect')) {
    return;
}

/**
 * 
 * Function database connect
 * This function checks http security settings
 * @param string $success_string = Successful message for the error log
 * @param string $error_string = Error message for the error log
 * @version 1.0
 * @author Patrick Lockley
 */

function database_connect($success_string, $error_string){


    global $xerte_toolkits_site;

    _load_language_file('website_code/php/database_library.inc'); // _load_language_file("/website_code/php/database_library.inc");

    /*
     * Try to connect
     */

    $mysql_connect_id = @mysql_connect($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password);

    /*
     * Check for connection and error if failed
     */

    if(!$mysql_connect_id){
        die("<h2>Xerte Online Toolkits</h2>
             <p><strong>Sorry, the system cannot connect to the database at present</strong></p>
             <p>This may be because the database server is offline, or this instance of Xerte has not been setup (see <a href='setup'>/setup</a>). </p>
             <p>The mysql error is <strong>" . mysql_error() . "</strong></p>");

    }

    $database_fail = false;

    mysql_select_db($xerte_toolkits_site->database_name) or ($database_fail = true);

    /*
     * database failing code
     */

    $username = 'anonymous';
    if(isset($_SESSION['toolkits_logon_username'])) {
        $username = $_SESSION['toolkits_logon_username'];
    }
    if($database_fail){
        receive_message($username, "ADMIN", "CRITICAL", "DATABASE FAILED AT " . $error_string, "MYSQL ERROR MESSAGE IS " . mysql_error());
        die("Sorry, the system cannot connect to the database at present. The mysql error is " . mysql_error() );
    }else{
        receive_message($username, "ADMIN", "SUCCESS", "DATABASE CONNECTED", $success_string);
    }

    /*
     * if all worked returned the mysql ID
     */

    return $mysql_connect_id;

}

/**
 * Poorman's prepared statement emulation. Does not cope with named parameters - only ?'s.
 * @param string $sql - e.g. "SELECT * FROM users WHERE name = ? OR name = ?"
 * @param array $params - e.g. array('bob', "david's");
 * @return mysql resultset.
 */
function db_query($sql, $params = array()) {
    $connection = database_connect('db_Query ok', 'db_query fail');

    foreach($params as &$value) {
        if(isset($value)) {
            if(get_magic_quotes_gpc()) {
                $value = stripslashes($value);
            }
            $value = "'" . mysql_real_escape_string($value) . "'";
        }
        else {
            $value = 'NULL';
        }
    }

    // following code taken from php.net/mysql_query - axiak at mit dot edu - 24th october 2006
    $curpos = 0;
    $curph = count($params) - 1;
    // start at the end of the string and replace things backwards; this avoids us replacing a replacement
    for($i = strlen($sql)-1; $i>0; $i--) {
        if($sql[$i] !== '?') {
            continue;
        }
        if($curph < 0) {
            $sql = substr_replace($sql, 'NULL', $i, 1);
        }
        else {
            $sql = substr_replace($sql, $params[$curph], $i, 1);
        }
        $curph--;
    }
    _debug("Running : $sql",1);
    $result = mysql_query($sql, $connection);
    if(!$result) {
        _debug("Failed to execute query : $sql : " . mysql_error());
        return false;
    }
    if(preg_match("/^select/i", $sql)) {
        $rows = array();
        while($row = mysql_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }
    return $result;
}

function db_query_one($sql, $params = array()) {
    $results = db_query($sql, $params);

    if(sizeof($results) > 0) {
        return $results[0];
    }
}

?>
