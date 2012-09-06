<?php

/**
 * Upgrade script for generic-ish MySQL database.
 *
 * Method of operation:
 * 
 * 1. Creates a config table, which it'll use to store a version number within it. 
 * 2. Each time this script runs, it looks to see if there is a function called 'upgrade_NN' where NN is version_number +1.
 * 3. If it finds update_NN, it will keep running all subsequent upgrade_NN functions it can find.
 *
 * This script is loosely based on a similar script in the PostfixAdmin project and one Pale Purple uses internally.
 *
 * It's been changed a little for Xerte Online Toolkits to take into consideration the table prefix stuff and that XOT only deals with MySQL.
 *
 * Error reporting could be enhanced a bit; in that the 'native' db_query*() functions we have in XOT now don't really raise any sort of 
 * error messages... so it's difficult to retrieve them to show here - although perhaps a call to mysql_error() would work, 
 * it's not been tested.
 *
 * For now, if someone calls this script via http://server/path/to/xot/upgrade.php?debug=yes then they'll see the queries being output, 
 * but error messages will probably remain hidden. Hopefully this is sufficient to debug any problems end users/sysadmins encounter, 
 * but who knows.
 * Alternatively, edit config.php, enable development mode, and see what is shown in the debug file (probably /tmp/debug.log).
 *
 * @author David Goodwin <gingerdog@gmail.com>
 *
 */
// cannot not have this.
require_once(dirname(__FILE__) . "/config.php");


function _db_field_exists($table, $field) {
    global $xerte_toolkits_site;
    $table = $xerte_toolkits_site->database_table_prefix . $table;
    $sql = "SHOW COLUMNS FROM $table LIKE '$field'";
    $r = db_query_one($sql);
    return !empty($r);
}

function _db_add_field($table, $field, $fieldtype, $after) {
    $table = table_by_key($table);
    if(! _db_field_exists($table, $field)) {
        $query = "ALTER TABLE $table ADD COLUMN $field $fieldtype AFTER $after";
        return db_query($query);
    } else { 
        printdebug ("field already exists: $table.$field");
        return false;
    }
}

/**
 * Fix up table name to include {$xerte_toolkits_site->database_table_prefix} if necessary.
 * If the name already contains the prefix, do not re-add it.
 * @param string $name
 * @return string $name
 */
function table_by_key($name) {
    global $xerte_toolkits_site;

    if(!preg_match("/^{$xerte_toolkits_site->database_table_prefix}/", $name)) {
        $name = $xerte_toolkits_site->database_table_prefix . $name;
    }
    return $name;
}

$_GET['debug'] = true;
function printdebug($text) {
    if (!empty($_GET['debug'])) {
        print "<p style='color:#999'>$text</p>";
    }
}

$config_table = table_by_key('config');
$mysql = "CREATE TABLE IF NOT EXISTS $config_table (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(20) NOT NULL,
      value varchar(20) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY name_idx (name)
    )
";
db_query($mysql) or die("Failed to create $config_table!");

$sql = "SELECT * FROM $config_table WHERE name = 'version'";

$r = db_query_one($sql);
if(!empty($r)) {
    $version = $r['value'];
    echo "Starting from $version\n";
} else {
    db_query("INSERT INTO $config_table (name, value) VALUES ('version', '0')");
    $version = 0;
}

echo "Updates are being applied to {$xerte_toolkits_site->database_name} \n";
_do_upgrade($version);


function _do_upgrade($current_version) {
    $target_version = $current_version + 1;

    echo "<p>Current database version - $current_version</p>";
    if(!function_exists('upgrade_' . $target_version)) {    
        echo "<p>Database is up to date, nothing to do</p>";
        return true;
    }

    echo "<p>Updating database:</p><p> - from version: $current_version</p>";
    echo "<div style='color:#999'>&nbsp;&nbsp; (If the update doesn't work, run setup.php?debug=1 to see the detailed error messages and SQL queries.)</div>";

    while(function_exists('upgrade_' . $target_version)) {
        $function = "upgrade_" . $target_version;
        echo " Updating to version $target_version \n";
        $ok = $function();
        if(!$ok) {
            echo "Oh dear. Something probably went wrong; exiting after trying $function\n</p>";
            return;
        }
        echo "<p> $ok </p>";
        $target_version += 1;
    }
    echo "<p><b>Upgrade complete</b></p>\n";
    // Update config table so we don't run the same query twice in the future.
    $table = table_by_key('config');
    $sql = "UPDATE $table SET value = $target_version WHERE name = 'version'";
    if(!db_query($sql)) {
        echo "<P><strong>Failed to update config table; last update may be repeated if you re-run this script!</strong></p>";
    }
}

/** 
 * Wrap around db_query - so we can print out the SQL etc if necessary.
 * @param string $sql
 * @param array parameters for the SQL - if prepared statement. See db_query.
 */
function _upgrade_db_query($sql, $params = array()) {
    $result = db_query($sql, $params);
    if(!empty($_GET['debug'])) {
        echo "<p>DEBUG Query: $sql, output " . print_r($result) . "</p>";
    }
    return $result;
}

/**
 * Example code to illustrate usage:
 *
 * There must be NO gaps in the function names - i.e. sequential numbers are required.
 * The ability to go up/down could be added; but that's left as an exercise for the motivated reader.
 *
 * function upgrade_1() {
 *   // add 'field_name' to the 'logindetails' table; don't worry about making sure the table prefix is there
 *   return _db_add_field('logindetails', 'field_name');
 * }
 * 
 * function upgrade_2() {
 *   // perhaps we need to run a query which reforms some data... do it like so :
 *   return _upgrade_db_query("UPDATE logindetails SET foo = bar WHERE x = y");
 * }
 */

/** Add ldap table into the schema if it's not there already */
function upgrade_1() {
    $table = table_by_key('ldap');
    return _upgrade_db_query("CREATE TABLE IF NOT EXISTS `$table` (
        `ldap_id` bigint(20) NOT NULL AUTO_INCREMENT,
        `ldap_knownname` text NOT NULL,
        `ldap_host` text NOT NULL,
        `ldap_port` text NOT NULL,
        `ldap_username` text,
        `ldap_password` text,
        `ldap_basedn` text,
        `ldap_filter` text,
        `ldap_filter_attr` text,
        PRIMARY KEY (`ldap_id`)
    ) ");
}

function upgrade_2() {

    $sdtable = table_by_key('sitedetails');
    $ldaptable = table_by_key('ldap');

    $site_details = db_query_one("SELECT * FROM {$sdtable}");
    if(empty($site_details['ldap_host']) || empty($site_details['basedn'])) {
        _debug("No ldap information to use; can't migrate"); 
        return "No ldap information here to use for migrating";
    }
    // some empty records may be already here?
    _upgrade_db_query("DELETE FROM {$ldaptable} WHERE ldap_host = ?", array(''));

    $rows = _upgrade_db_query("SELECT * FROM {$ldaptable} WHERE ldap_host = ?", array($site_details['ldap_host']));
    if(sizeof($rows) > 0) {
        echo "LDAP migration appears to have already taken place!";
        return true;
    }

    if(!empty($site_details['ldap_host']) && !empty($site_details['basedn'])) {
        $ldap_details = array('ldap_knownname' => $site_details['ldap_host'],
                              'ldap_host' => $site_details['ldap_host'],
                              'ldap_port' => $site_details['ldap_port'],
                              'ldap_username' => $site_details['bind_dn'],
                              'ldap_password' => $site_details['bind_pwd'],
                              'ldap_basedn' => $site_details['basedn'],
                              'ldap_filter' => $site_details['LDAP_filter'],
                              'ldap_filter_attr' => $site_details['LDAP_preference']);

        $fields = array_keys($ldap_details);
        $qmarks = '';
        $comma = '';
        $fields_sql = '';
        foreach($fields as $field) {
            $qmarks .= $comma . '?';
            $fields_sql .= $comma . $field;
            $comma = ',';
        }
        _debug("Running SQL to copy sitedetails stuff into the ldap table - " . print_r($ldap_details, true));
        $ok = _upgrade_db_query("INSERT INTO {$ldaptable} ($fields_sql) VALUES($qmarks)", array_values($ldap_details));
        return "Migrated LDAP settings from sitedetails to ldap - ok ? " . ( $ok ? 'true' : 'false' );
    }
}
