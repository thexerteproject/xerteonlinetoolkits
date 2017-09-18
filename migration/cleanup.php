<?php
/**
 * Created by PhpStorm.
 * User: tom
 * Date: 8-4-2017
 * Time: 9:53
 */
define("CLI_SCRIPT", true);

$xerte_toolkits_site = new stdClass();

$xerte_toolkits_site->database_type = "mysql";

require_once("../database.php");
require_once("database_library.php");
require_once("../website_code/php/database_library.php");

function _hashAndSalt($username, $password)
{
    // well, it's better than no salt!
    return sha1("stablehorseboltapple" . $username . $password);
}


// Loop over all the users

$q = "select * from vdab";
$params = array();

$result = db_query($q, $params);
//print_r($result);

foreach($result as $row)
{

    //1. Put user in logindetails
    // get user record
    $q = "select * from logindetails where username=?";
    $params = array($row['username']);
    $user = db_query_one($q, $params);
    if ($user == null)
        continue;

    $q = "insert into logindetails set login_id=?, username=?, lastlogin=?, firstname=?, surname=?";
    $params=array($user['login_id'], $user['username'], $user['lastlogin'], $user['firstname'], $user['surname']);
    $res = db_query2($q, $params);
    if ($res === false)
    {
        echo "Could not add user record for user " . $user['username'] . "\n";
        exit;
    }
    // Also add to user tabe, so we can test
    $spassword = _hashAndSalt($user['username'], "Vd@b2017");

    $query="insert into user set firstname=?, surname=?, username=?, password=?";
    $params = array($user['firstname'], $user['surname'], $user['username'], $spassword);
    $res = db_query2($query, $params);
    if ($res === false)
    {
        echo "Could not add user record to user table for user " . $user['username'] . "\n";
        exit;
    }

    //2. Get all the folders from folderdetails and put in folderdetails
    $q = "select * from folderdetails where login_id=?";
    $params = array($user['login_id']);
    $folders = db_query($q, $params);
    if ($folders === false)
    {
        echo "Could not retrieve folders of user " . $user['username']  . "\n";
        exit;
    }
    foreach($folders as $folder) {
        $q = "insert into folderdetails set folder_id=?, login_id=?, folder_parent=?, folder_name=?, date_created=?";
        $params = array($folder['folder_id'], $folder['login_id'], $folder['folder_parent'], $folder['folder_name'], $folder['date_created']);
        $res = db_query2($q, $params);
        if ($res === false)
        {
            echo "Could not store folder " . $folder['folder_id'] . " of user " . $user['username']  . "\n";
            exit;
        }
    }

    //3. Get all the templates from templatedetails
    $q = "select t.*, otd.template_name as template_type_name from templatedetails t, originaltemplatesdetails otd where t.creator_id=? and t.template_type_id=otd.template_type_id";
    $params = array($user['login_id']);
    $templates = db_query($q, $params);
    if ($templates === false)
    {
        echo "Could not retrieve templates of user " . $user['username']  . "\n";
        exit;
    }
    foreach($templates as $template)
    {
        //4. Put in templatedetails and templaterights
        $q = "INSERT INTO `templatedetails` (`template_id`, `creator_id`, `template_type_id`, `template_name`, `date_created`,`date_modified`, `date_accessed`,`number_of_uses`,`access_to_whom`,`extra_flags`) ";
        $q .= "VALUES (?,?,?,?,?,?,?,?,?,?)";
        $params = array($template['template_id'], $template['creator_id'], $template['template_type_id'], $template['template_name'], $template['date_created'], $template['date_modified'], $template['date_accessed'], $template['number_of_uses'], $template['access_to_whom'], $template['extra_flags']);
        $res = db_query2($q, $params);
        if ($res === false)
        {
            echo "Could not store template " . $template['template_id'] . " of user " . $user['username']  . "\n";
            exit;
        }
        // Retrieve templaterights record
        $q = "select * from templaterights where template_id=? and user_id=? and role='creator'";
        $params = array($template['template_id'], $user['login_id']);
        $tr = db_query_one($q, $params);
        if ($tr === false)
        {
            echo "Could not retrieve template rights of " . $template['template_id'] . " of user " . $user['username']  . "\n";
            exit;
        }
        $q = "INSERT INTO `templaterights` (`template_id`, `user_id`, `role`, `folder`, `notes`) VALUES (?,?,?,?,?)";
        $params = array($tr['template_id'], $tr['user_id'], $tr['role'], $tr['folder'], $tr['notes']);
        $res = db_query2($q, $params);
        if ($res === false)
        {
            echo "Could not store template rights of " . $template['template_id'] . " of user " . $user['username']  . "\n";
            exit;
        }

        // 5. Check and store template syndication
        $q = "select * from templatesyndication where template_id = ?";
        $params = array($template['template_id']);
        $syndication = db_query($q, $params);
        if ($syndication === false)
        {
            echo "Could not retrieve template syndication of " . $template['template_id'] . " of user " . $user['username']  . "\n";
            exit;
        }
        foreach($syndication as $s)
        {
            // At most one
            $q = "INSERT INTO `templatesyndication` (`template_id`, `description`, `keywords`, `rss`, `export`, `syndication`, `category`, `license`) VALUES (?,?,?,?,?,?,?,?)";
            $params = array($s['template_id'], $s['description'], $s['keywords'], $s['rss'], $s['export'], $s['syndication'], $s['category'], $s['license']);
            $res = db_query2($q, $params);
            if ($res === false)
            {
                echo "Could not store template syndication of " . $template['template_id'] . " of user " . $user['username']  . "\n";
                exit;
            }
        }
        //6. output folder to script to zip USER-FILES
        echo "./USER-FILES/" . $template['template_id'] . "-" . $user['username'] . "-" . $template['template_type_name']  . "\n";
    }
}

// Cleanup templaterights
$q = "select * from vdab";
$params = array();

$result = db_query($q, $params);

foreach($result as $row) {
    // 1. Get login details
    $q = "select * from logindetails where username=?";
    $params = array($row['username']);
    $user = db_query_one($q, $params);

    if ($user == null)
        continue;

    //2. Loop over templatesrights
    $q = "select * from templaterights where user_id=? and role!='creator'";
    $params = array($user['login_id']);
    $trs = db_query($q, $params);
    if ($trs === false)
    {
        echo "Could not retrieve template rights of " . $template['template_id'] . " of user " . $user['username']  . "\n";
        exit;
    }

    foreach ($trs as $tr) {
        //3. If template exists in new db, add record
        // Retrieve template (from vdab db) and check if it exists
        $q = "select * from templatedetails where template_id=?";
        $params = array($tr['template_id']);
        $t = db_query2($q, $params);
        if ($t === false)
        {
            echo "Could not retrieve template of " . $tr['template_id'] . " of user " . $user['username'] . " from vdab db\n";
            exit;
        }
        if (count($t) > 0)
        {
            // Template exists
            $q = "INSERT INTO `templaterights` (`template_id`, `user_id`, `role`, `folder`, `notes`) VALUES (?,?,?,?,?)";
            $params = array($tr['template_id'], $tr['user_id'], $tr['role'], $tr['folder'], $tr['notes']);
            $res = db_query2($q, $params);
            if ($res === false)
            {
                echo "Could not store template rights of " . $template['template_id'] . " (role=" . $tr['role'] . ") of user " . $user['username']  . "\n";
                exit;
            }
        }
    }
}
