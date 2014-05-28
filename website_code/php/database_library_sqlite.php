<?php

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
        
        $db->query("UPDATE sitedetails SET site_url = 'http://{$_SERVER['HTTP_HOST']}/'");
        $root_path = realpath(dirname(__FILE__) . '/../../');
        
        $db->query("UPDATE sitedetails SET root_file_path = '$root_path/'");
        $db->query("UPDATE sitedetails SET import_path = '$root_path/import'");
        
        $db->close();
    } else {
        die("Can't find : $schema_file");
    }
    
    return true;
}

