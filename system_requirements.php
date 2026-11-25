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
 *
 * Check structure of the workspace of a user
 *
 * @author Tom Reijnders
 * @version 1.0
 * @package
 */

require_once(dirname(__FILE__) . "/config.php");
require_once(dirname(__FILE__) . "\/website_code\/php\/user_library.php");

// Load this page’s language strings
_load_language_file("/system_requirements.inc");

$_SESSION['elevated'] = true;
if(is_user_admin())  {  // or any check for an admin role like is_user_permitted('project_admin')) {
    unset($_SESSION['elevated']);
    global $xerte_toolkits_site;

    //   :
    //   :
    // system requirements code
    //   :
 function getMySQLVersion() {
    global $xerte_toolkits_site;
    $dbName = isset($xerte_toolkits_site->database_name) ? $xerte_toolkits_site->database_name : 'test';
    $mysqli = @new mysqli($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password, $dbName);
    if ($mysqli->connect_error) {
        return "Unable to connect";
    } else {
        $version = $mysqli->server_info;
        $mysqli->close();
        return $version;
    }
}

function getApacheVersion() {
    return function_exists('apache_get_version') ? apache_get_version() : 'N/A';
}

function getStatusClass($status, $optional) {
    if ($optional) {
        return $status ? 'status-optional-on' : 'status-optional-off';
    }
    return $status ? 'status-yes' : 'status-no';
}

function checkExtensionStatus($ext, $isOptional = false) {
    return extension_loaded($ext);
}

function getPermissionClass($isWritable) {
    return $isWritable ? 'perm-yes' : 'perm-no';
}

function checkWritePermission($dir) {
    return is_writable($dir);
}


// PHP Extensions (true = optional)
$extensions = [
    'pdo_mysql' => false,
    'zlib' => false,
    'SimpleXML' => false,
    'xml' => false,
    'gd' => false,
    'json' => false,
    'zip' => false,
    'mbstring' => false,
    'curl' => false,
    'ldap' => true,
    'clamav' => true
];

$dirs = ['/USER-FILES', '/error_logs', '/import', '/languages', '/setuptsugi'];
$mysqlVersion = getMySQLVersion();
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($_SESSION['toolkits_language'] ?? 'en-GB') ?>">
<head>
    <meta charset="UTF-8">
    <title><?= SYSTEM_REQ_PAGE_TITLE ?></title>
	
	<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/all.min.css">
<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v4-shims.min.css">
<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v5-font-face.min.css">
    <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #fff; color: #000; }
    table { border-collapse: collapse; width: 70%; margin-bottom: 30px; }
    th, td { border: 1px solid #ccc; padding: 8px; }
    th { background-color: #f4f4f4; text-align: left; }
    .status-yes         { background-color: #007E33; color: #fff; }  /* Green */
    .status-no          { background-color: #CC0000; color: #fff; }  /* Red */
    .status-optional-on { background-color: #006064; color: #fff; }  /* Teal */
    .status-optional-off{ background-color: #555;    color: #fff; }  /* Charcoal */
    .perm-yes  { background-color: #007E33; color: #fff; } /* Green */
    .perm-no   { background-color: #CC0000; color: #fff; } /* Red */
	.tooltip {
    position: relative;
    display: inline-block;
    cursor: help;
    color: #ff8500;
    font-weight: bold;
    margin-left: 5px;
		font-size:1em;
}

.tooltip .tooltip-text {
    visibility: hidden;
    width: 250px;
    background-color: #333;
    color: #fff;
    text-align: left;
    border-radius: 4px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: 125%; /* Position above */
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.875em;
}
.tooltip:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
}
</style>
</head>
<body>
    <h2><?= SYSTEM_REQ_SERVER_INFORMATION ?></h2>
    <table>
        <tr><th><?= SYSTEM_REQ_ITEM ?></th><th><?= SYSTEM_REQ_VALUE ?></th></tr>
        <tr><td><?= SYSTEM_REQ_PHP_VERSION ?></td><td><?= phpversion() ?></td></tr>
        <tr><td><?= SYSTEM_REQ_APACHE_VERSION ?></td><td><?= getApacheVersion() ?></td></tr>
        <tr><td><?= SYSTEM_REQ_MYSQL_VERSION ?></td><td><?= $mysqlVersion ?></td></tr>
    </table>

    <h2><?= SYSTEM_REQ_PHP_CONFIGURATION ?></h2>
    <table>
        <tr><th><?= SYSTEM_REQ_DIRECTIVE ?></th><th><?= SYSTEM_REQ_VALUE ?></th></tr>
        <tr>
    <td><?= SYSTEM_REQ_UPLOAD_MAX_FILESIZE ?></td>
    <td>
        <?= ini_get('upload_max_filesize') ?>
        <span class="tooltip"><i class="fa fa-info-circle" title="<?= SYSTEM_REQ_MORE_INFO ?>"></i>
            <span class="tooltip-text"><?= SYSTEM_REQ_UPLOAD_MAX_FILESIZE_INFO ?></span>
        </span>
    </td>
</tr>

        <tr>
    <td><?= SYSTEM_REQ_POST_MAX_SIZE ?></td>
    <td>
        <?= ini_get('post_max_size') ?>
        <span class="tooltip"><i class="fa fa-info-circle" title="<?= SYSTEM_REQ_MORE_INFO ?>"></i>
            <span class="tooltip-text"><?= SYSTEM_REQ_POST_MAX_SIZE_INFO ?></span>
        </span>
    </td>
</tr>

    <td><?= SYSTEM_REQ_MEMORY_LIMIT ?></td>
    <td>
        <?= ini_get('memory_limit') ?>
        <span class="tooltip"><i class="fa fa-info-circle" title="<?= SYSTEM_REQ_MORE_INFO ?>"></i>
            <span class="tooltip-text"><?= SYSTEM_REQ_MEMORY_LIMIT_INFO ?></span>
        </span>
    </td>
</tr>

    </table>

    <h2><?= SYSTEM_REQ_EXTENSIONS_HEADING ?></h2>
    <table>
        <tr><th><?= SYSTEM_REQ_EXTENSION ?></th><th><?= SYSTEM_REQ_STATUS ?></th></tr>
        <?php foreach ($extensions as $ext => $optional): ?>
            <tr>
    <td><?= $ext ?></td>
    <td class="<?= getStatusClass(checkExtensionStatus($ext, $optional), $optional) ?>">
        <?= $optional
            ? (checkExtensionStatus($ext) ? SYSTEM_REQ_OPTIONAL_ENABLED : SYSTEM_REQ_OPTIONAL_NOT_INSTALLED)
            : (checkExtensionStatus($ext) ? SYSTEM_REQ_YES : SYSTEM_REQ_NO) ?>
    </td>
</tr>

        <?php endforeach; ?>
    </table>

    <h2><?= SYSTEM_REQ_DIR_PERMISSIONS ?></h2>
<table>
    <tr><th><?= SYSTEM_REQ_DIRECTORY ?></th><th><?= SYSTEM_REQ_WRITABLE ?></th></tr>
    <?php foreach ($dirs as $dir): 
        $fullPath = __DIR__ . $dir;
        $isWritable = checkWritePermission($fullPath); ?>
        <tr>
            <td><?= $dir ?></td>
            <td class="<?= getPermissionClass($isWritable) ?>">
                <?= $isWritable ? SYSTEM_REQ_YES : SYSTEM_REQ_NO ?>
            </td>
        </tr>
    <?php endforeach; ?>

    </table>

    <h2><?= SYSTEM_REQ_LAST_LOGINS ?></h2>
    <?php
    $lastLogins = null;
    $loginError = null;
    try {
        $prefix = isset($GLOBALS['xerte_toolkits_site']->database_table_prefix) ? $GLOBALS['xerte_toolkits_site']->database_table_prefix : '';
        $sql = "SELECT username, firstname, surname, lastlogin FROM {$prefix}logindetails WHERE lastlogin IS NOT NULL ORDER BY lastlogin DESC LIMIT 10";
        $lastLogins = db_query($sql);
        if ($lastLogins === false) {
            $loginError = SYSTEM_REQ_DB_QUERY_FAILED;
        }
    } catch (Exception $e) {
        $loginError = $e->getMessage();
    }
    ?>
    <table>
        <tr><th><?= SYSTEM_REQ_USERNAME ?></th><th><?= SYSTEM_REQ_NAME ?></th><th><?= SYSTEM_REQ_LAST_LOGIN ?></th></tr>
        <?php if (is_array($lastLogins) && count($lastLogins) > 0): ?>
            <?php foreach ($lastLogins as $row): ?>
                <tr>
                    <td><?= htmlspecialchars($row['username'] ?? '') ?></td>
                    <td><?= htmlspecialchars(trim(($row['firstname'] ?? '') . ' ' . ($row['surname'] ?? ''))) ?></td>
                    <td><?= htmlspecialchars($row['lastlogin'] ?? '') ?></td>
                </tr>
            <?php endforeach; ?>
        <?php else: ?>
            <tr>
                <td colspan="3">
                    <?= $loginError ? htmlspecialchars($loginError) : SYSTEM_REQ_NO_RECENT_LOGINS ?>
                </td>
            </tr>
        <?php endif; ?>
    </table>
</body>
</html>

<?php
//Resume permissions check

} else if(isset($_SESSION['toolkits_logon_id'])){
    // User is looged in but still has no acces
    unset($_SESSION['elevated']);
    echo "You are not permitted to use this page";
    exit();
}else {
    // Use is not logged in, piggyback on login page and make sure we are redirected back to this page
    unset($_SESSION['elevated']);
    global $xerte_toolkits_site;
    $url = "admin_logon_template.php";  // Change this!
    $_SESSION['adminTo'] = $url;
    if (isset($_GET['altauth'])){
        $_SESSION['altauth'] = $xerte_toolkits_site->altauthentication;
    }
    header("location: {$xerte_toolkits_site->site_url}");
    exit();
}