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
if (function_exists('database_connect')) {
    return;
}


/**
 * Perform a basic Xerte database install
 * @param string file path for the sqlite database file
 */
function database_setup($database_location) {

    if (is_file($database_location)) {
        return true; // nothing to do.
    }

    if (!extension_loaded('sqlite3')) {
        die("SQLite extension not available; please edit config.php and try using MySQL."
                . "\n\n Or fix your PHP installation. \n\n"
                . "Hint: apt-get install php5-sqlite ");
    }
// need to create.
    $schema_file = dirname(__FILE__) . '/../../sqlite/sqlite.schema';
    $data_file = dirname(__FILE__) . '/../../sqlite/sqlite.data';
    if (is_file($schema_file)) {
        _debug("Creating new Sqlite database");
        $db = new SQLite3($database_location);
        _debug("Loading default sqlite schema");
        $schema = file_get_contents($schema_file);
        $bits = explode(';', $schema);
        foreach ($bits as $bit) {
            $bit = trim($bit);
            if(empty($bit)) {
                continue;
            }
            _debug("Db setup : About to run - $bit");
            $ok = $db->query($bit);
            
            if ($ok === FALSE) {
                _debug("DB schema load error on $bit" . $db->lastErrorMsg());
                die("Failed to run schema load  : $bit / " .print_r($ok, true) .  $db->lastErrorMsg());
            }
        }
        
        // Load initial (near empty) data.
        _debug("Loading default data");
        $bits = explode(';', file_get_contents($data_file));

        foreach ($bits as $bit) {
            $bit = trim($bit);
            if(empty($bit)) {
                continue;
            }
            $ok = $db->query($bit);
            if ($ok === FALSE) {
                _debug("DB error on data load : $bit " . $db->lastErrorMsg());
                die("Failed to load default data : $bit / " . print_r($ok, true));
            }
        }

        if (!$ok) {
            die("SQLite installation failed.");
        }

	$http = 'http';
	if(isset($_SERVER['HTTPS'])) {
		$http = 'https';
	}
	$site_root = $http . '://' . $_SERVER['HTTP_HOST'] . '/' . $_SERVER['REQUEST_URI'] . '/';
        /* $site_root = $_SERVER['SCRIPT_URI']; */
        if(preg_match('!(.*)/([a-z]+.php)$!', $site_root, $matches)) {
            $site_root = $matches[1] . '/';
        }
	while(substr($site_root, -1) == '/') {
		$site_root = substr($site_root, 0, -1);
	}
	$site_root .= '/';

        // this ought to work and cope with https vs http urls - as long as the first url requested isn't within a subdir.
        $db->query("UPDATE sitedetails SET site_url = '" . $db->escapeString($site_root). "'");

        $root_path = realpath(dirname(__FILE__) . '/../../');
        
        $db->query("UPDATE sitedetails SET root_file_path = '$root_path/'");
        $db->query("UPDATE sitedetails SET import_path = '$root_path/import'");
        
        $db->close();
    } else {
        die("Can't find : $schema_file");
    }
    
    return true;
}

/**
 * @global type $xerte_toolkits_site
 * @return \SQLite3
 */
function database_connect() {
    global $xerte_toolkits_site;

    if (!file_exists($xerte_toolkits_site->database_location)) {
        die("Sqlite DB doesn't exist; aborting");
    }

    /* reuse the same connection everywhere, if we can */
    if (isset($xerte_toolkits_site->database)) {
        return $xerte_toolkits_site->database;
    }
    $db = new SQLite3($xerte_toolkits_site->database_location);
    $db->busyTimeout(1000);
    $xerte_toolkits_site->database = $db;
    return $db;
}

/**
 * Poorman's prepared statement emulation. Does not cope with named parameters - only ?'s.
 * @param string $sql - e.g. "SELECT * FROM users WHERE name = ? OR name = ?"
 * @param array $params - e.g. array('bob', "david's");
 * @return mysql resultset.
 */
function db_query($sql, $params = array()) {
    $connection = database_connect('db_query ok', 'db_query fail');

    _debug("SQLITE Running : $sql", 1);
    _debug($params);
    if (empty($params)) {
        _debug("No parameters; lazy query");
        $result = $connection->query($sql);
    } else {
        $statement = $connection->prepare($sql);
        if (!$statement) {
            die("Fail : $sql " . $connection->lastErrorMsg());
        }
        $c = 0;
        foreach ($params as $value) {
            $c++;
            $statement->bindValue($c, $value);
        }

        $result = $statement->execute();
    }
    _debug($result);

    if (!$result) {
        _debug("Failed to execute query : $sql : " . print_r($params, true) . ' -- error message -- ' . $connection->lastErrorMsg());
        return false;
    }

    if (preg_match("/^select/i", $sql)) {
        $rows = array();
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $rows[] = $row;
        }
        return $rows;
    }

    if (preg_match('/^insert/i', $sql)) {
        $result = $connection->lastInsertRowID();
    }
    /* See http://stackoverflow.com/questions/313567/how-can-i-determine-the-number-of-affected-rows-in-a-sqlite-2-query-in-php */
    if (preg_match('/^update/i', $sql) || preg_match('/^delete/i', $sql)) {
        $result = $connection->changes();
        _debug("Result? " . print_r($result, true));
    }
    return $result;
}

/**
 * Convienance query for db_query - retrieve one row
 * @param string $sql
 * @param array $params (optional)
 * @return array (db row) or null
 */
function db_query_one($sql, $params = array()) {
    $results = db_query($sql, $params);

    if (sizeof($results) > 0) {
        return $results[0];
    }
    return null;
}
