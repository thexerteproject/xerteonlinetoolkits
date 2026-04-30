<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
global $xerte_toolkits_site;
global $development;
$xerte_toolkits_site = new stdClass();

function rrmdir($src) {
    if ($src != "") {
        $dir = opendir($src);
        while (false !== ($file = readdir($dir))) {
            if (($file != '.') && ($file != '..')) {
                $full = $src . '/' . $file;
                if (is_dir($full)) {
                    rrmdir($full);
                } else {
                    unlink($full);
                }
            }
        }
        closedir($dir);
        rmdir($src);
    }
}


session_start();
if (!isset($_SESSION['xerte_setup'])) {
    die("Access denied");
}

require_once('page_header.php');

// Actually remove the setup folder, and all files in it, to prevent it being used again. We have to do this at the end of the process, otherwise we won't be able to run the rest of the code.
rrmdir(__DIR__);

?>

<h2>Install complete</h2>

<p>The setup folder has been removed successfully</p>

<p>Your site URL is  <a href="http://<?php echo x_clean_input($_SERVER['HTTP_HOST']) . substr(x_clean_input($_SERVER['PHP_SELF']),0,strlen(x_clean_input($_SERVER['PHP_SELF']))-22); ?>"><?php echo x_clean_input($_SERVER['HTTP_HOST']) . substr(x_clean_input($_SERVER['PHP_SELF']),0,strlen(x_clean_input($_SERVER['PHP_SELF']))-22); ?></a> </p>

<h2>Register!</h2>
<p>Please register your site to receive valuable notifications regarding Xerte Online Toolkits. You can find the registration button in the management page:
    <a href="http://<?php echo x_clean_input($_SERVER['HTTP_HOST']) . substr(x_clean_input($_SERVER['PHP_SELF']),0,strlen(x_clean_input($_SERVER['PHP_SELF']))-22) . "management.php?register"; ?>"><?php echo $_SERVER['HTTP_HOST'] . substr($_SERVER['PHP_SELF'],0,strlen($_SERVER['PHP_SELF'])-22) . "management.php"; ?></a></p>

<h2>Need more help?</h2>
<p>Please see the Xerte Community site at <a href="http://www.xerte.org.uk" target="new">http://www.xerte.org.uk</a> and please consider joining the forum.</p>

<?php require_once('page_footer.php'); ?>

