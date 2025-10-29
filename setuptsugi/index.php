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
require_once("../config.php");
require_once("../website_code/php/user_library.php");

if ( ! is_Cli() ) {
    // https://stackoverflow.com/questions/3133209/how-to-flush-output-after-each-echo-call
    @ini_set('zlib.output_compression',0);
    @ini_set('implicit_flush',1);
    @ob_end_clean();
    set_time_limit(0);
}

function backup_tables($tables = '*'){
    global $xerte_toolkits_site;
    $data = "\n/*---------------------------------------------------------------".
        "\n  SQL DB BACKUP ".date("d.m.Y H:i")." ".
        "\n  HOST: {$xerte_toolkits_site->database_host}".
        "\n  DATABASE: {$xerte_toolkits_site->database_name}".
        "\n  TABLES: {$tables}".
        "\n  ---------------------------------------------------------------*/\n";
    db_query( "SET NAMES `utf8` COLLATE `utf8_general_ci`"); // Unicode

    if(!is_array($tables) && strpos( $tables, "*") !== false){ //get all of the tables
        $pos = strpos( $tables, "*");
        if ($pos === 0) {
            $prefix = "";
        }
        else {
            $prefix = substr($tables, 0, $pos);
        }
        $tables = array();
        $result = db_query("SHOW TABLES");

        foreach($result as $row){
            if ($prefix === "" || strpos($row[0], $prefix) === 0)
            {
                $tables[] = $row[0];
            }
        }
    }else{
        $tables = is_array($tables) ? $tables : explode(',',$tables);
    }

    if (count($tables) == 0)
        return false;

    $dbconn = database_connect();
    foreach($tables as $table){
        $data.= "\n/*---------------------------------------------------------------".
            "\n  TABLE: `{$table}`".
            "\n  ---------------------------------------------------------------*/\n";
        $data.= "DROP TABLE IF EXISTS `{$table}`;\n";
        $res = db_query("SHOW CREATE TABLE `{$table}`");
        $data.= $res[0][1].";\n";

        $result = db_query("SELECT * FROM `{$table}`");

        $vals = Array(); $z=0;
        foreach($result as $items) {
            $vals[$z] = "(";
            $j=0;
            foreach ($items as $key=>$value) {
                if (isset($value)) {
                    $vals[$z] .= "'" . $dbconn->quote($value) . "'";
                } else {
                    $vals[$z] .= "NULL";
                }
                if ($j < (count($items) - 1)) {
                    $vals[$z] .= ",";
                }
                $j++;
            }
            $vals[$z] .= ")";
            $z++;
        }
        if (count($vals) > 0) {
            $data .= "INSERT INTO `{$table}` VALUES ";
            $data .= "  " . implode(";\nINSERT INTO `{$table}` VALUES ", $vals) . ";\n";
        }
    }
    $dbconn = null;
    return $data;
}

function is_Cli() {
    if(php_sapi_name() == 'cli' && empty($_SERVER['REMOTE_ADDR'])) {
        return true;
    } else {
        return false;
    }
}

/**
 * Returns a GUIDv4 string
 *
 * Ref: https://www.php.net/manual/en/function.com-create-guid.php
 *
 * Uses the best cryptographically secure method
 * for all supported pltforms with fallback to an older,
 * less secure version.
 *
 * @param bool $trim
 * @return string
 */
function GUIDv4 ($trim = true)
{
    // Windows
    if (function_exists('com_create_guid') === true) {
        if ($trim === true)
            return trim(com_create_guid(), '{}');
        else
            return com_create_guid();
    }

    // OSX/Linux
    if (function_exists('openssl_random_pseudo_bytes') === true) {
        $data = openssl_random_pseudo_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);    // set version to 0100
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);    // set bits 6-7 to 10
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    // Fallback (PHP 4.2+)
    mt_srand((double)microtime() * 10000);
    $charid = strtolower(md5(uniqid(rand(), true)));
    $hyphen = chr(45);                  // "-"
    $lbrace = $trim ? "" : chr(123);    // "{"
    $rbrace = $trim ? "" : chr(125);    // "}"
    $guidv4 = $lbrace.
        substr($charid,  0,  8).$hyphen.
        substr($charid,  8,  4).$hyphen.
        substr($charid, 12,  4).$hyphen.
        substr($charid, 16,  4).$hyphen.
        substr($charid, 20, 12).
        $rbrace;
    return $guidv4;
}

// Ref. https://stackoverflow.com/questions/4356289/php-random-string-generator
function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}


$_SESSION['elevated'] = true;
if (!isset($_SESSION['toolkits_logon_id'])) {
    unset($_SESSION['elevated']);
    $url = "setuptsugi";
    $_SESSION['adminTo'] = $url;
    if (isset($_GET['altauth'])) {
        $_SESSION['altauth'] = $xerte_toolkits_site->altauthentication;
    }
    header("location: {$xerte_toolkits_site->site_url}");
    exit();
}

// Authentication
$full_access = false;
// Admin user
if (is_user_admin()){
    $full_access = true;
}
else
{
    die("access denied!");
}

$prefix = $xerte_toolkits_site->database_table_prefix;
if ($full_access)
{

$_SESSION['admin'] = true;

?>
<!DOCTYPE html>
<html>
    <head>
        <meta name="description" content="TSUGI Installer">
        <meta name="keywords" content="tsugi, install">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=0.80">
        <link rel="stylesheet" href="css/stylesheet.css">
    </head>
    <body>
<!-- Menu -->
        <ul class="main_menu">
            <li class="title">TSUGI Setup</li>
        </ul>
        <div class="homepage"><br>
            <h1>Welcome to TSUGI Setup!</h1>
            <p class="indextext">
                Tsugi is a framework that handles much of the low-level detail of building multi-tenant tool that makes use of the IMS Learning Tools Interoperability® (LTI®) and other learning tool interoperability standards. The Tsugi Framework provides library and database code to receive and model all of the incoming LTI data in database tables and sets up a session with the important information about the LMS, user, and course.
            </p>
            <br>
            <?php
            echo "Let's get started!";
            ?>
            <br>
            <br>
            <?php
            $file_pointer = $xerte_toolkits_site->root_file_path .  "tsugi";
            if (!file_exists($file_pointer))
            {
            ?>
                <div class="centerblock">
                <p>Installing TSUGI will do the following:</p>
                <ol>
                    <li>Do a pre-flight check to see whether requirements are met</li>
                    <li>Create a folder named tsugi in your Xerte installation</li>
                    <li>Retrieve the TSUGI install package and unzip it</li>
                    <li>Create a config.php for TSUGI</li>
                    <li>Create the TSUGI database (inside the Xerte database)</li>
                </ol>
                <p>Your TSUGI admin panel will have the same password as your Xerte admin user</p>
                </div>
                <form method="post">
                <input type="submit" name="install" value="Install Tsugi" class="install">
                </form>
            <?php
            }
            else{
            ?>
                <div class="centerblock">
                <p>Upgrading TSUGI will do the following:</p>
                <ol>
                    <li>Do a pre-flight check to see whether requirements are met</li>
                    <li>Create a backup of the tsugi folder in the setuptsugi folder</li>
                    <li>Create a backup of the MySQL database tables in the setuptsugi folder</li>
                    <li>Remove the old folder and create a new empty folder named tsugi</li>
                    <li>Retrieve the TSUGI install package and unzip it</li>
                    <li>Write the original config.php to the new installation</li>
                    <li>Upgrade the TSUGI database (inside the Xerte database)</li>
                </ol>
                </div>
                <form method="post">
                    <input type="submit" name="update" value="Update Tsugi" class="update">
                </form>
            <?php
            }
            ?>


            <br>

            <div class="button_1">
                <a href="<?php echo $xerte_toolkits_site->site_url .  "tsugi/"; ?>">
                        Go to TSUGI panel
                </a>
            </div>

            <div class="button_1">
                <a href="<?php echo $xerte_toolkits_site->site_url .  "tsugi/admin"; ?>">
                    Go to TSUGI admin panel
                </a>
            </div>


            <div class="button_1">
                <a href="<?php echo $xerte_toolkits_site->site_url;?>">
                        Go to Xerte
                </a>
            </div>
            
            <?php

    function preflightchecks($mode)
    {
        global $branch, $tag;

        $tag = "";

        echo "<br>Running pre-flight checks<br>\n";
        flush();
        // Check OS
        $os = php_uname('s');
        if ($mode === "update" && $os === "Windows")
        {
            echo "<span style='color:#F41F15;'>Updating on Windows is not supported (as there is no reliable way to create a backup)</span> <br>\n";
            echo "Aborting!";
            exit(-1);
        }

        // Check PHP version
        $phpversion = phpversion();
        if ($phpversion < "7.2.0")
        {
            echo "<span style='color:#F41F15;'>Your PHP version (". $phpversion . ") is not supported by TSUGI. Please update to a PHP version 7.2 or higher. </span> <br>\n";
            echo "Aborting!";
            exit(-1);
        }
		else if ($phpversion < "8.0")
		{
			echo "Your PHP version is ". $phpversion . ". Using branch php-72-x.<br>";
			$branch = "php-72-x";
		}
		else if ($phpversion < "8.1")
		{
			echo "Your PHP version is ". $phpversion . ". Using branch php-80-x.<br>";
			$branch = "php-80-x";
		}
        else if ($phpversion < "8.4")
        {
            echo "Your PHP version is ". $phpversion . ". Using tag 25.5.1 (php 8.2 and 8.3).<br>";
            $branch = "master";
            $tag = "25.5.1";
        }
		else
		{
			$branch = "master";
		}
		flush();
        // Check zip extension
        $zipextension = phpversion("zip");
        if ($zipextension === false)
        {
            echo "<span style='color:#F41F15;'>Your PHP does not have support for ZipArchive. Please enable the php-zip extension.</span> <br>\n";
            echo "Aborting!";
            exit(-1);
        }

        // Check curl extension
        $zipextension = phpversion("curl");
        if ($zipextension === false)
        {
            echo "<span style='color:#F41F15;'>Your PHP does not have support for Curl. Please enable the php-curl extension.</span> <br>\n";
            echo "Aborting!";
            exit(-1);
        }
        echo "<span style='color:#099E12;'>All pre-flight checks are Ok!</span> <br>\n";
		flush();
    }

    function backup()
    {
        global $CFG;;
        echo "<br>Creating a backup of the current TSUGI folder (this may take several minutes)<br>\n";
        flush();
        $date = date("YmdHi");
        $tarfile = "setuptsugi/tsugi_" . $date . ".tar.bz2";
        exec("cd ..; tar cjvf " . $tarfile . " tsugi", $out, $result);
        if ($result !== 0)
        {
            echo "<span style='color:#F41F15;'>Creating backup failed!</span> <br>\n";
            echo "Aborting!";
            exit(-1);
        }
        else
        {
            echo "<span style='color:#099E12;'>Backup ". $tarfile . " created!</span> <br>\n";
        }
        echo "Create backup of TSUGI tables (this may take several minutes)<br>\n";
        flush();
        $sqlbackup = backup_tables($CFG->dbprefix . "*");
        if ($sqlbackup === false)
        {
            echo "<span style='color:#F41F15;'>Failed to create backup of SQL tables. No table were found in the Xerte database. This is not a TSUGI install previously done by setuptsugi. You have to upgrade your installation by hand.</span> <br>\n";
            echo "Aborting!";
            exit(-1);
        }
        $ok = file_put_contents("tsugidb_" . $date . ".sql", $sqlbackup);
        if ($ok === false)
        {
            echo "<span style='color:#F41F15;'>Failed to create backup of SQL tables.</span> <br>\n";
            echo "Aborting!";
            exit(-1);
        }
        else
        {
            echo "<span style='color:#099E12;'>SQL backup created in setuptsugi/tsugidb_" . $date . ".sql</span><br> \n";
        }
        echo "Removing TSUGI folder (this may take several minutes)<br>\n";
        flush();
        unset($out);
        exec("cd ..; rm -rf tsugi", $out,$result);
        if ($result !== 0)
        {
            echo "<span style='color:#F41F15;'>Could not remove tsugi folder. Please remove the folder yourself and try again. You need to make a copy of the config.php file, and put it back after the install!</span> <br>\n";
            echo "Aborting!";
            exit(-1);
        }
        else
        {
            echo "<span style='color:#099E12;'>Existing TSUGI folder has been removed</span><br> \n";
        }
		flush();
    }
            
    function install()
    {
        global $xerte_toolkits_site, $branch, $tag;

        // Download Tsugi bestanden
        echo "<br>Download the TSUGI installer package<br>\n";
        flush();
        global $xerte_toolkits_site;
        //$url = "https://github.com/$u/$repo/archive/master.zip";
        if (!isset($tag) || $tag==="") {
            $url = "https://github.com/tsugiproject/tsugi/archive/refs/heads/{$branch}.zip";
            $version = $branch;
        }
        else
        {
            $url = "https://github.com/tsugiproject/tsugi/archive/refs/tags/{$tag}.zip";
            $version = $tag;
        }
        $tsugizip = __DIR__."/../import/tsugi-{$version}.zip";
        $ch = curl_init();
        $f = fopen($tsugizip, 'w+');
        $opt = [
            CURLOPT_URL => $url,
            CURLOPT_FILE => $f,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HEADER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_SSL_VERIFYPEER => false,
        ];
        curl_setopt_array($ch, $opt);
        $res = curl_exec($ch);

        curl_close($ch);
        fclose($f);
        if (!file_exists($tsugizip))
        {
            echo "<span style='color:#F41F15;'>Could not download the tsugi package</span> <br>\n";
            echo "Aborting!<br>";
            exit(-1);
        }

        echo "Installing TSUGI package<br>\n";
        flush();
        $zip = new ZipArchive;
        $res = $zip->open($tsugizip);
        if ($res === TRUE) {
            // extract it to the path we determined above
            $res = $zip->extractTo($xerte_toolkits_site->root_file_path . "/.");
            if ($res === false)
            {
                echo "<span style='color:#F41F15;'>Failed to extract " . $tsugizip . ": " . x_clean_input($zip->getStatusString()) . "</span><br>\n";
                echo "Aborting!<br>";
                exit(-1);
            }
            $res = $zip->close();
            echo "<span style='color:#099E12;'>TSUGI package successfully extracted</span><br>\n";
            flush();
        } else {
            echo "<span style='color:#F41F15;'>Couldn't open $tsugizip!</span><br>\n";
            echo "Aborting!";
            exit(-1);
        }

        rename($xerte_toolkits_site->root_file_path . "tsugi-{$version}", $xerte_toolkits_site->root_file_path . "tsugi");

        echo "<span style='color:#099E12;'>TSUGI package successfully installed</span><br>\n";
        flush();

    }
            
    function prepare_config($config_file)
    {
        // Replace placeholders with unique keys
        // Cookies
        $lconfig_file = str_replace("warning:please-change-cookie-secret-a289b543", GUIDv4(), $config_file);
        $lconfig_file = str_replace("TSUGIAUTO", "TSUGI" . gethostname(), $lconfig_file);
        $lconfig_file = str_replace("390b246ea9", generateRandomString(), $lconfig_file);
        // Session salt
        $lconfig_file = str_replace("warning:please-change-sessionsalt-89b543", GUIDv4(), $lconfig_file);

        return $lconfig_file;
    }

    function install_config_file($config_file)
    {
        global $xerte_toolkits_site;
        $ok = file_put_contents($xerte_toolkits_site->root_file_path .  "tsugi/config.php", $config_file);
        if ($ok === false)
        {
            echo "<span style='color:#F41F15;'>config.php can't be copied!</span> <br>\n";
        }
        else
        {
            echo "<span style='color:#099E12;'>config.php has been copied!</span> <br>\n";
        }
		flush();
    }

    function copy_config_template()
    {
        $config_file = file_get_contents("config.php");
        $config_file = prepare_config($config_file);
        install_config_file($config_file);
    }

    function upgrade_database()
    {
        echo "<br>Upgrade tsugi database<br>\n";
        flush();
        $_SESSION['admin'] = true;
        // Try to call commandline php
        $ok = exec("cd ../tsugi/admin; php upgrade.php", $out, $result);
        if ($ok === false || $result !== 0) {
            echo "<span style='color:#F41F15;'>upgrading database failed, please navigate to the TSUGI admin panel, and try from there!</span><br>\n";
        }
        else{
            $upgrade_log = "<div><div class=\"log\">\n";
            foreach ($out as $line)
            {
                $upgrade_log .= $line . "\n";
            }
            $upgrade_log .= "</div></div>";
            echo $upgrade_log;
            flush();
        }
    }
            
    if(isset($_POST['install']))
    {
        preflightchecks('install');
        install();
        copy_config_template();
        upgrade_database();
        echo "<br><br><span style='color:#099E12;'>Installation is ready!</span> <br>\n";
        flush();
    }

    if(isset($_POST['update']))
    {
        require_once("../tsugi/config.php");
        preflightchecks('update');
        $filepath = $xerte_toolkits_site->root_file_path .  "tsugi/config.php";
        $config_file = file_get_contents($filepath);
        backup();
        install();
        install_config_file($config_file);
        upgrade_database();
        echo "<br><br><span style='color:#099E12;'>Installation is ready!</span> <br>\n";
        flush();
    }


?>
            
        </div>
    </body>
</html>

<?php
}
