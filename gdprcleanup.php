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

(PHP_SAPI !== 'cli' || isset($_SERVER['HTTP_USER_AGENT'])) && die('cli only');

require_once('config.php');

function get_user_from_username($username)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $q = "select * from {$prefix}logindetails where username = ?";
    $params = array($username);
    $result = db_query_one($q, $params);
    return $result;
}

function get_user_from_id($login_id)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $q = "select * from {$prefix}logindetails where login_id = ?";
    $params = array($login_id);
    $result = db_query_one($q, $params);
    return $result;
}

function get_users($lastlogin)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $q = "select * from {$prefix}logindetails where lastlogin < ?";
    $params = array($lastlogin);
    $users = db_query($q, $params);
    return $users;
}

function unique_multidim_array($array, $key) {
    $temp_array = array();
    $key_array = array();

    foreach($array as $val) {
        if (!in_array($val[$key], $key_array)) {
            $key_array[] = $val[$key];
            $temp_array[] = $val;
        }
    }
    return $temp_array;
}

function get_next_anonymised_user()
{
    $q = "select * from logindetails where username like 'anonymised%'";
    $users = db_query($q);
    if (count($users) == 0)
    {
        return 'anonymised1';
    }
    else
    {
        $users = array_map(function($user) {
            return intval(substr($user['username'], 10));
        }, $users);
        sort($users);
        $last = array_pop($users);
        return 'anonymised' . ($last + 1);
    }
}

function anonymise_user($user, $anonymised)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    // Update the user's entry in the logindetails table
    $q = "update {$prefix}logindetails set username=?, firstname='Anonymous', surname='User' where login_id=?";
    $params = array($anonymised, $user['login_id']);
    db_query($q, $params);

    $los = get_los_from_user($user['login_id']);
    $userfiles = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short;
    foreach ($los as $lo)
    {
        // Update the lo's folder name in the USER-FILES area
        $orgpath = $userfiles . $lo['template_id'] . '-' . $user['username'] . '-' . get_template_originaltemplate_name($lo['template_id']);
        $newpath = $userfiles . $lo['template_id'] . '-' . $anonymised . '-'. get_template_originaltemplate_name($lo['template_id']);
        rename($orgpath, $newpath);
    }
}

function count_non_private_los_from_user($login_id)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $q = "select count(template_id) as count_los from {$prefix}templatedetails where creator_id= ? and (access_to_whom != 'Private' || tsugi_published = '1')";
    $params = array($login_id);
    $count_los = db_query_one($q, $params);

    // Check how menay los are shared with others
    $q = "select count(tr.template_id) as count_shared from {$prefix}templatedetails td, {$prefix}templaterights tr where td.creator_id=? and td.template_id=tr.template_id and tr.role != 'creator'";
    $params = array($login_id);
    $count_shared_los = db_query_one($q, $params);

    return (int)$count_los['count_los'] + (int)$count_shared_los['count_shared'];
}

function get_los_from_user($login_id)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $q = "select * from {$prefix}templatedetails where creator_id= ?";
    $params = array($login_id);
    $los = db_query($q, $params);
    return $los;
}

function get_template_originaltemplate_name($template_id)
{
    global $xerte_toolkits_site;

    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query_to_get_template_type_name = "select otd.template_name from "
        . "{$prefix}originaltemplatesdetails otd, {$prefix}templatedetails td where td.template_id=? and td.template_type_id = otd.template_type_id ";

    $params = array($template_id);

    $row_template_name = db_query_one($query_to_get_template_type_name, $params);

    $name = $row_template_name['template_name'];

    return $name;
}

function delete($path)
{
    if (is_dir($path) === true) {
        $files = array_diff(scandir($path), array('.', '..'));

        foreach ($files as $file) {
            delete(realpath($path) . '/' . $file);
        }

        return rmdir($path);
    } else if (is_file($path) === true) {
        return unlink($path);
    }

    return false;
}

function remove_lo($user, $template)
{
    global $xerte_toolkits_site;

    $prefix = $xerte_toolkits_site->database_table_prefix;


    $template_folder = get_template_originaltemplate_name($template['template_id']);
    $path = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $template['template_id'] . '-' .$user['username'] . '-' . $template_folder;

    /*
     * delete from the file system
     */
    delete($path);

    // Delete from template rights
    $q = "delete from {$prefix}templaterights where template_id=?";
    $params = array($template['template_id']);
    db_query($q, $params);

    $q = "delete from {$prefix}templatedetails where template_id= ?";
    db_query($q, $params);

    $q = "delete from {$prefix}templatesyndication where template_id=?";
    db_query($q, $params);

    $q = "delete from {$prefix}additional_sharing where template_id=?";
    db_query($q, $params);

}

function remove_user($user)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $q = "delete from {$prefix}logindetails where login_id = ?";
    $params = array($user['login_id']);
    db_query($q, $params);
}

$restindex = 1;
$args = getopt("", array("id-column:","username-column:", "anonymise", "help", "no-public", "doaction", "remove", "csvseparator:", "lastlogin:"), $restindex);


$helptext = <<<EOT

Routine to anonymise or delete user data from a Xerte installation
First parameter is a CSV file with a list of user IDs to anonymise or delete
By default, only first column is used and interpreted as the user id
Optionaly you can indicate which column should be used to identify the user:
 --id-column=2
 --username-column=3
The id-column and username-column are 1-based
The id-column has precedence over the username-column
The default action is to anonymise the user data
The CSV file should not contain a header row

 --id-column=<column>        Indicates which column from the CSV file to use to identify the user
 --username-column=<column>  Indicates which column from the CSV file to use to identify the user
 --anonymise                 Anonymise user data, anonymise takes precedence over remove
 --remove                    Remove user data, including all LO's owned by the user
 --no-public                 Do not remove users that have non-private LO's 
 --doaction                  Do perform the requested action, by default the routine just shows what would be done
 --csvseparator=<separator>  Use a different separator than the default comma
 --lastlogin=<date>          Only anonymise users that have not logged in since the given date, format YYYY-MM-DD
                             Can be used with or without the CSV file. If used without CSVFILE, the action is forced to anonymise

EOT;

if (isset($args['help'])) {
    echo $helptext;
    exit;
}
$action = 'anonymise';
if (!isset($args['anonymise']) && !isset($args['remove'])) {
    echo "No action specified, defaulting to anonymise\n";
    $args['anonymise'] = true;
}
if (isset($args['remove'])) {
    $action = 'remove';
}
$doaction = false;
if (isset($args['doaction'])) {
    $doaction = true;
}
$no_public = false;
if (isset($args['no-public'])) {
    $no_public = true;
}
$remove = false;
if (isset($args['remove'])) {
    $remove = true;
}
$id_column = 1;
if (isset($args['id-column'])) {
    $id_column = $args['id-column'];
}
$username_column = 1;
if (isset($args['username-column'])) {
    $username_column = $args['username-column'];
    if (!isset($args['id-column'])) {
        $id_column = -1;
    }
}
if ($id_column > 0)
    $id_column--;
if ($username_column > 0)
    $username_column--;

$separator = ',';
if (isset($args['csvseparator'])) {
    $separator = $args['csvseparator'];
}


if (count($argv) < $restindex && !isset($args['lastlogin'])) {
    echo "No CSV file specified and no last login date specified\n";
    echo $helptext;
    exit;
}

if (count($argv) >= $restindex) {
    // Use CSV file
    $csvfile = $argv[$restindex];
    if (!file_exists($csvfile)) {
        echo "CSV file $csvfile does not exist\n";
        exit;
    }

    $csv = array_map(function ($line) use ($separator) {
        return str_getcsv($line, $separator);
    }, file($csvfile));

    if (count($csv) == 0) {
        echo "CSV file $csvfile is empty\n";
        exit;
    }

    $users = array();
    foreach ($csv as $row) {
        if ($id_column >= 0) {
            $users[] = get_user_from_id($row[$id_column]);
        } else {
            $users[] = get_user_from_username($row[$username_column]);
        }
    }
    if (isset($args['lastlogin'])) {
        $users = array_filter($users, function ($user) use ($args) {
            return $user['lastlogin'] < $args['lastlogin'];
        });
    }
}
else if (isset($args['lastlogin'])) {
    // select all users from the database (only if lastlogin is specified)
    $users = get_users($args['lastlogin']);
}

$users = unique_multidim_array($users, 'login_id');
// Remove null entry
$users = array_filter($users, function ($user) {
    return $user !== null;
});

$removedusers = 0;
$removedlos = 0;
$anonymisedusers = 0;
foreach($users as $user)
{
    switch ($action) {
        case 'anonymise':
            $anonymised = get_next_anonymised_user();
            if ($doaction) {
                echo "Anonymising user {$user['firstname']} {$user['surname']} ({$user['login_id']}, {$user['username']}) as user {$anonymised}\n";
            }
            else {
                echo "Would anonymise user {$user['firstname']} {$user['surname']} ({$user['login_id']}, {$user['username']})\n";
            }
            if ($doaction) {
                anonymise_user($user, $anonymised);
            }
            $anonymisedusers++;
            break;
        case 'remove':
            $count_non_private = count_non_private_los_from_user($user['login_id']);
            if ($no_public && $count_non_private > 0) {
                echo "Not removing user {$user['firstname']} {$user['surname']} ({$user['login_id']}, {$user['username']}) because this user has {$count_non_private} non-private LO's\n";
            } else {
                if ($doaction) {
                    echo "Removing user {$user['firstname']} {$user['surname']} ({$user['login_id']}, {$user['username']})\n";
                }
                else {
                    echo "Would remove user {$user['firstname']} {$user['surname']} ({$user['login_id']}, {$user['username']})\n";
                }
                $removedusers++;
                foreach (get_los_from_user($user['login_id']) as $lo) {
                    if ($doaction) {
                        echo "  - Removing LO " . str_replace('_', ' ', $lo['template_name']) . " ({$lo['template_id']}, {$lo['access_to_whom']}, LTI={$lo['tsugi_published']})\n";
                    }
                    else {
                        echo "  - Would remove LO " . str_replace('_', ' ', $lo['template_name']) . " ({$lo['template_id']}, {$lo['access_to_whom']}, LTI={$lo['tsugi_published']})\n";
                    }
                    $removedlos++;
                    if ($doaction) {
                        remove_lo($user, $lo);
                    }
                }
                if ($doaction) {
                    remove_user($user);
                }
            }
            break;
    }
}

if ($action == 'anonymise') {
    echo "Anonymised {$anonymisedusers} users\n";
}
else {
    echo "Removed {$removedusers} users and {$removedlos} LO's\n";
}