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


function is_Cli() {
    if(php_sapi_name() == 'cli' && empty($_SERVER['REMOTE_ADDR'])) {
        return true;
    } else {
        return false;
    }
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
        <meta name="description" content="YT DLP">
        <meta name="keywords" content="yt-dlp, install">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=0.80">
        <link rel="stylesheet" href="css/stylesheet.css">
    </head>
    <body>
<!-- Menu -->
        <ul class="main_menu">
            <li class="title">YT-DLP Setup</li>
        </ul>
        <div class="homepage"><br>
            <h1>Welcome to YT-DLP Setup!</h1>
            <p class="indextext">
                Yt-dlp is a feature-rich command-line audio/video downloader
            </p>
            <br>
            <?php
            echo "Let's get started!";
            ?>
            <br>
            <br>
            <?php
            $file_pointer = $xerte_toolkits_site->root_file_path .  "yt-dlp";
            if (!file_exists($file_pointer))
            {
            ?>
                <div class="centerblock">
                <p>Installing yt-dlp will do the following:</p>
                <ol>
                    <li>Do a pre-flight check to see whether requirements are met</li>
                    <li>Create a folder named yt-dlp in your Xerte installation</li>
                    <li>Retrieve the yt-dlp install package and unzip it</li>
                    <li>Retrieve ffmpeg executable and install it in the same folder</li>
                </ol>
                </div>
                <form method="post">
                <input type="submit" name="install" value="Install yt-dlp" class="install">
                </form>
            <?php
            }
            else{
            ?>
                <div class="centerblock">
                <p>Upgrading yt-dlp will do the following:</p>
                <ol>
                    <li>Run the self-updating routine of yt-dlp</li>
                </ol>
                </div>
                <form method="post">
                    <input type="submit" name="update" value="Update yt-dlp" class="update">
                </form>
            <?php
            }
            ?>

            <div class="button_1">
                <a href="<?php echo $xerte_toolkits_site->site_url;?>">
                        Go to Xerte
                </a>
            </div>
            
            <?php

    function preflightchecks($mode)
    {
        global $yturl, $ytdlp_exe, $ffmpeg_url, $ffmpeg_pkg_extension, $os;

        echo "<br>Running pre-flight checks<br>\n";
        flush();
        // Check OS
        $os = php_uname('s');
        if ($mode !== "update" && $os === "Windows")
        {
            echo "<span style='color:#F41F15;'>Using https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe</span> <br>\n";
            $yturl = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
            $ytdlp_exe = "yt-dlp.exe";
            echo "<span style='color:#F41F15;'>https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip</span> <br>\n";
            $ffmpeg_url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip";
            $ffmpeg_pkg_extension = "zip";
        }
        elseif ($mode !== "update" && $os === "Darwin") {
            echo "<span style='color:#F41F15;'>Using https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos</span> <br>\n";
            $yturl = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos";
            $ytdlp_exe = "yt-dlp_macos";
            echo "<span style='color:#F41F15;'>Make sure ffmpeg is installed and in the PATH</span> <br>\n";
            $pyversion = exec("python -V 2>&1 | sed 's/Python //'");
            $py3version = exec("python3 -V 2>&1 | sed 's/Python //'");
            if (($pyversion === null && $py3version === null)||(version_compare($pyversion, '3.10', '<') && version_compare($py3version, '3.10', '<'))) {
                echo "<span style='color:#F41F15;'>Python 3.10 or higher is required to run yt-dlp on MacOS. Please install Python and make sure it's in the PATH</span> <br>\n";
                echo "Aborting!<br>";
                exit(-1);
            }
        }
        elseif ($mode !== "update") {
            echo "<span style='color:#F41F15;'>Using https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp</span> <br>\n";
            $yturl = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
            $ytdlp_exe = "yt-dlp";
            $pyversion = exec("python -V 2>&1 | sed 's/Python //'");
            $py3version = exec("python3 -V 2>&1 | sed 's/Python //'");
            if (($pyversion === null && $py3version === null)||(version_compare($pyversion, '3.10', '<') && version_compare($py3version, '3.10', '<'))) {
                echo "<span style='color:#F41F15;'>Python 3.10 or higher is required to run yt-dlp on Linux. Please install Python and make sure it's in the PATH</span> <br>\n";
                echo "Aborting!<br>";
                exit(-1);
            }
            echo "<span style='color:#F41F15;'>Using https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz</span> <br>\n";
            $ffmpeg_url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz";
            $ffmpeg_pkg_extension = "tar.xz";
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
        echo "<br>Creating a backup of the current yt-dlp folder (this may take several minutes)<br>\n";
        flush();
        $date = date("YmdHi");
        $tarfile = "setupytdlp/yt-dlp_" . $date . ".tar.bz2";
        exec("cd ..; tar cjvf " . $tarfile . " yt-dlp", $out, $result);
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
        echo "Removing yt-dlp folder (this may take several minutes)<br>\n";
        flush();
        unset($out);
        exec("cd ..; rm -rf yt-dlp", $out,$result);
        if ($result !== 0)
        {
            echo "<span style='color:#F41F15;'>Could not remove yt-dlp folder. Please remove the folder yourself and try again. You need to make a copy of the config.php file, and put it back after the install!</span> <br>\n";
            echo "Aborting!";
            exit(-1);
        }
        else
        {
            echo "<span style='color:#099E12;'>Existing yt-dlp folder has been removed</span><br> \n";
        }
		flush();
    }
            
    function install()
    {
        global $xerte_toolkits_site, $yturl, $ytdlp_exe, $ffmpeg_url, $ffmpeg_pkg_extension, $os;

        // Download yt-dlp files
        echo "<br>Download the yt-dlp executable<br>\n";
        flush();
        global $xerte_toolkits_site;
        //$url = "https://github.com/$u/$repo/archive/master.zip";
        // Create yt-dlp folder
        $ret = mkdir($xerte_toolkits_site->root_file_path . "yt-dlp", 0755, true);
        if ($ret === false)
        {
            $error = error_get_last();

            echo "<span style='color:#F41F15;'>Could not create yt-dlp folder: " . $error['message'] . "</span> <br>\n";
            echo "Aborting!<br>";
            exit(-1);
        }

        $ytdlp_exe_path = __DIR__."/../yt-dlp/" . $ytdlp_exe;
        $ch = curl_init();
        $f = fopen($ytdlp_exe_path, 'w+');
        $opt = [
            CURLOPT_URL => $yturl,
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
        if (!file_exists($ytdlp_exe_path))
        {
            echo "<span style='color:#F41F15;'>Could not download the yt-dlp executable</span> <br>\n";
            echo "Aborting!<br>";
            exit(-1);
        }
        chmod($ytdlp_exe_path, 0755);

        // Download ffmpeg package
        if ($ffmpeg_url === null)
        {
            echo "<span style='color:#F41F15;'>Please install ffmpeg and make sure it's in the PATH</span> <br>\n";
            return;
        }
        echo "<br>Download the ffmpeg package<br>\n";
        flush();

        $ffmpeg_pkg = __DIR__."/../import/ffmpeg." . $ffmpeg_pkg_extension;
        $ch = curl_init();
        $f = fopen($ffmpeg_pkg, 'w+');
        $opt = [
            CURLOPT_URL => $ffmpeg_url,
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
        if (!file_exists($ffmpeg_pkg))
        {
            echo "<span style='color:#F41F15;'>Could not download the ffmpeg package</span> <br>\n";
            echo "Aborting!<br>";
            exit(-1);
        }


        echo "Installing ffmpeg package<br>\n";
        flush();
        // Windows
        if ($os == "Windows") {
            $zip = new ZipArchive;
            $res = $zip->open($ffmpeg_pkg);
            if ($res === TRUE) {
                // extract it to the path we determined above
                $res = $zip->extractTo($xerte_toolkits_site->root_file_path . "/.");
                if ($res === false) {
                    echo "<span style='color:#F41F15;'>Failed to extract " . $ffmpeg_pkg . ": " . x_clean_input($zip->getStatusString()) . "</span><br>\n";
                    echo "Aborting!<br>";
                    exit(-1);
                }
                $res = $zip->close();
                // Move all files and folders in ffmpeg-master-latest-win64-gpl to .
                $ffmpeg_folder = glob($xerte_toolkits_site->root_file_path . "/yt-dlp/ffmpeg-master-latest-win64-gpl/*");
                foreach ($ffmpeg_folder as $file) {
                    $res = rename($file, $xerte_toolkits_site->root_file_path . "/yt-dlp/" . basename($file));
                    if ($res === false) {
                        echo "<span style='color:#F41F15;'>Failed to move " . $file . " to " . $xerte_toolkits_site->root_file_path . ": " . x_clean_input(error_get_last()['message']) . "</span><br>\n";
                    }
                }
                rmdir($xerte_toolkits_site->root_file_path . "/yt-dlp/ffmpeg-master-latest-win64-gpl");
                unlink($ffmpeg_pkg);
                echo "<span style='color:#099E12;'>ffmpeg package successfully extracted</span><br>\n";
                flush();
            } else {
                echo "<span style='color:#F41F15;'>Couldn't open $ffmpeg_pkg!</span><br>\n";
                echo "Aborting!";
                exit(-1);
            }
        }
        else {
            // Linux/Mac
            $cmp = "cd " . $xerte_toolkits_site->root_file_path . "/yt-dlp; tar xJf " . $ffmpeg_pkg;
            exec($cmp, $out, $result);
            if (!file_exists($xerte_toolkits_site->root_file_path . "/yt-dlp/ffmpeg-master-latest-linux64-gpl"))
            {
                echo "<span style='color:#F41F15;'>Failed to extract " . $ffmpeg_pkg . "</span><br>\n";
                echo "Aborting!<br>";
                exit(-1);
            }
            // Move all files and folders in ffmpeg-master-latest-linux64-gpl to .
            $ffmpeg_folder = glob($xerte_toolkits_site->root_file_path . "/yt-dlp/ffmpeg-master-latest-linux64-gpl/*");
            foreach ($ffmpeg_folder as $file) {
                $res = rename($file, $xerte_toolkits_site->root_file_path . "/yt-dlp/" . basename($file));
                if ($res === false) {
                    echo "<span style='color:#F41F15;'>Failed to move " . $file . " to " . $xerte_toolkits_site->root_file_path . ": " . x_clean_input(error_get_last()['message']) . "</span><br>\n";
                }
            }
            rmdir($xerte_toolkits_site->root_file_path . "/yt-dlp/ffmpeg-master-latest-linux64-gpl");
            unlink($ffmpeg_pkg);
            echo "<span style='color:#099E12;'>ffmpeg package successfully extracted</span><br>\n";
            flush();
        }

        echo "<span style='color:#099E12;'>yt-dlp package successfully installed</span><br>\n";
        flush();
    }
            
    if(isset($_POST['install']))
    {
        preflightchecks('install');
        install();
        echo "<br><br><span style='color:#099E12;'>Installation is ready!</span> <br>\n";
        flush();
    }

    if(isset($_POST['update']))
    {
//        require_once("../tsugi/config.php");
//        preflightchecks('update');
//        $filepath = $xerte_toolkits_site->root_file_path .  "tsugi/config.php";
//        $config_file = file_get_contents($filepath);
//        backup();
//        install();
//        install_config_file($config_file);
//        upgrade_database();
//        echo "<br><br><span style='color:#099E12;'>Installation is ready!</span> <br>\n";
//        flush();
    }


?>
            
        </div>
    </body>
</html>

<?php
}
