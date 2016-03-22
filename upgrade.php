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
    $r = db_query($sql);
    return !empty($r);
}

function _db_add_field($table, $field, $fieldtype, $default, $after) {
    $table = table_by_key($table);
    if(! _db_field_exists($table, $field)) {
        $query = "ALTER TABLE $table ADD COLUMN $field $fieldtype DEFAULT '$default' AFTER $after";
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
    $target_version = $current_version + 0; // changed this to add 0 not 1 as this looks like it causes issues as when done an upgrade you had to add an extra 1 to the upgrade_function
  if($target_version ==0 ) $target_version=1; // fixed this for when the variable didnt exist;


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

/*
 function upgrade_3() {
// DO NOTHING but it seems if you ran the previous 2 steps then it wont run #3 but try to run #4
  _debug('Dummy upgrade required if not already done upgrade step 2');
}
*/

function upgrade_3() {
  _debug("Creating new lti tables");

  $table = table_by_key('lti_context');
  $error1 = _upgrade_db_query("CREATE TABLE IF NOT EXISTS `$table` (
  `lti_context_key` varchar(255) NOT NULL,
  `c_internal_id` varchar(255) NOT NULL,
  `updated_on` datetime NOT NULL,
  PRIMARY KEY (`lti_context_key`),
  KEY `c_internal_id` (`c_internal_id`) ) ");

  $table = table_by_key('lti_keys');
  $error2 = _upgrade_db_query("CREATE TABLE IF NOT EXISTS `$table` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `oauth_consumer_key` char(255) NOT NULL,
  `secret` char(255) DEFAULT NULL,
  `name` char(255) DEFAULT NULL,
  `context_id` char(255) DEFAULT NULL,
  `deleted` datetime DEFAULT NULL,
  `updated_on` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_consumer_key` (`oauth_consumer_key`) ) ");

  $table = table_by_key('lti_resource');
  $error3 = _upgrade_db_query("CREATE TABLE IF NOT EXISTS `$table` (
  `lti_resource_key` varchar(255) NOT NULL,
  `internal_id` varchar(255) DEFAULT NULL,
  `internal_type` varchar(255) NOT NULL,
  `updated_on` datetime DEFAULT NULL,
  PRIMARY KEY (`lti_resource_key`),
  KEY `destination2` (`internal_type`),
  KEY `destination` (`internal_id`) ) ");
  $table = table_by_key('lti_user');
  $error4 = _upgrade_db_query("CREATE TABLE IF NOT EXISTS `$table` (
  `lti_user_key` varchar(255) NOT NULL DEFAULT '',
  `lti_user_equ` varchar(255) NOT NULL,
  `updated_on` datetime NOT NULL,
  PRIMARY KEY (`lti_user_key`),
  KEY `lti_user_equ` (`lti_user_equ`) ) ");

$error_returned=true;
  if (($error1 === false) or ($error2 === false) or ($error3 === false) or ($error4 === false)) {
    $error_returned=false;
   // echo "creating lti tables FAILED";
  }



        return "Creating lti tables - ok ? " . ( $error_returned ? 'true' : 'false' );

}

function upgrade_4()
{
    if (! _db_field_exists('templatedetails', 'extra_flags')) {
        $error1 = _db_add_field('templatedetails', 'extra_flags', 'varchar(45)', '', 'access_to_whom');

        $table = table_by_key('templatedetails');
        $error2 = _upgrade_db_query("UPDATE `$table`  set `extra_flags`='engine=flash'");

        $table = table_by_key('originaltemplatesdetails');
        $error3 = _upgrade_db_query("UPDATE `$table`  set `template_framework`='site' where `template_name`='site'");

        $table = table_by_key('sitedetails');
        $error4 = _upgrade_db_query("ALTER TABLE `$table` CHANGE COLUMN `site_text` `site_text` TEXT NULL DEFAULT NULL");

        $error_returned = true;
        if (($error1 === false) || ($error2 === false) || ($error3 === false) || ($error4 === false)) {
            $error_returned = false;
            // echo "creating lti tables FAILED";
        }

        return "Creating default engine flag - ok ? " . ($error_returned ? 'true' : 'false');
    }
    else
    {
        return "Default engine flag already present - ok ? true";
    }
}

function upgrade_5_step1()
{
    $table = table_by_key('configdetails');
    $error1 = _upgrade_db_query("CREATE TABLE IF NOT EXISTS `$table` (
      `config_key` char(255) NOT NULL,
      `value` text NOT NULL,
      `description_key` text DEFAULT NULL,
      `mandatory` smallint(1) DEFAULT 1,
      `category` char(255) DEFAULT NULL,
      `base64encoded`smallint(1) DEFAULT 0,
      PRIMARY KEY (`config_key`) ) ");

    return "Creating lti tables - ok ? " . ( $error1 ? 'true' : 'false' );
}

function upgrade_5_step2()
{
    global $xerte_toolkits_site;

    // Convert sitedetails table to configdetails
    if (!database_connect("", "")) {
        die("database.php isn't correctly configured; cannot connect to database; have you run /setup?");
    }

    $row = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}sitedetails");

    $table = table_by_key('configdetails');
    foreach ($row as $key => $value) {
        $extraflags = "";
        if ($key == 'demonstration_page' || $key == 'news_text' || $key=='pod_one' || $key=='pod_two' || $key=='form_string' || $key=='peer_form_string' || $key == 'play_edit_preview_query')
        {
            $extraflags = ", base64encoded=1";
        }
        else if ($key == 'site_text')
        {
            $site_texts = explode("~~~", $value);
            $value = $site_texts[0];
            $tutorialkey = "tutorial_text";
            if (count($site_texts) > 1)
            {
                $tutorial = $site_texts[1];
            }
            else
            {
                $tutorial = "";
            }
            db_query_one("insert into " . $table . " set config_key='" . $tutorialkey . "', value='" . $tutorial . "', category='xerte', mandatory=1" . $extraflags);
        }
        db_query_one("insert into " . $table . " set config_key='" . $key . "', value='" . $value . "', category='xerte', mandatory=1" . $extraflags);
    }
    return true;
}

function upgrade_5()
{
    upgrade_5_step1();
    upgrade_5_step2();
    return true;
}

function upgrade_6()
{
    $table = table_by_key('originaltemplatesdetails');
    db_query_one("insert  into " . $table . " (`template_type_id`,`template_framework`,`template_name`,`description`,`date_uploaded`,`display_name`,`display_id`,`access_rights`,`active`) values (17,'decision','decision','A template for presenting a series of questions to reach a solution to a problem.','2009-01-01','Decision Tree Template',0,'*',1)");

	return true;
}

function upgrade_7()
{
    global $xerte_toolkits_site;
    if (! _db_field_exists('sitedetails', 'authentication_method')) {
        $error1 = _db_add_field('sitedetails', 'authentication_method', 'char(255)', '', 'site_session_name');      
        $error_returned = true;
        $res = db_query("update {$xerte_toolkits_site->database_table_prefix}sitedetails set authentication_method = 'Guest' where site_id=1");
        if($res === false) {
            die("Error creating authentication_method field");
        }

        if (($error1 === false)) {
            $error_returned = false;
            // echo "creating authentication_method field FAILED";
        }

        return "Creating authentication_method field - ok ? " . ($error_returned ? 'true' : 'false');
    }
    else
    {
        return "authentication_method field already present - ok ? true";
    }
}

function upgrade_8()
{
    // Make template_id of templatedetails autoincrement
    global $xerte_toolkits_site;

    // Check if auto_increment is set
    $sql = "SELECT * FROM information_schema.COLUMNS where table_schema=? and table_name=? and column_name='template_id'";
    $res = db_query($sql, array($xerte_toolkits_site->database_name, $xerte_toolkits_site->database_table_prefix . 'templatedetails'));
    if ($res !== false && count($res)>1)
    {
        if (strpos('auto_increment', $res[0]['extra']) === false)
        {
            // Add auto_increment flag to column
            $sql = "ALTER TABLE " . $xerte_toolkits_site->database_table_prefix . "templatedetails CHANGE COLUMN `template_id` `template_id` BIGINT(20) NOT NULL AUTO_INCREMENT";
            $res = db_query($sql);
            if($res === false) {
                die("Error adding auto_incement to templatedetails.template_id column.");
            }
            return "Adding auto_increment to templatedetails.template_id column - ok true";
        }
    }
    else
    {
        return "Auto_increment already set on templatedetails.template_id column - ok true";
    }
}


?>