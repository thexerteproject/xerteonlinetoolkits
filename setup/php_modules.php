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
require_once('page_header.php'); 
$ok = true; $warning = false; ?>

    <h2>PHP Module Checks</h2>

    <p>Use your <a href="phpinfo.php" target="_blank">PHP info page</a> to find the 'Loaded Configuration File' (look on the first part of the php info page for the text 'Loaded Configuration File' - the use this path to find the file. Make a copy of it before you start. You can edit this file in notepad, or any text editor. People following the XAMPP path should find that they do not need to make any of these changes to make their system work.</p>

    <ol>
        <li><strong>The PHP " File uploads" setting</strong>
            <ul>
                <li>Look in the Ini file for "file_uploads =" and set the value to be On: <?php if (ini_get("file_uploads") == 1){ echo "<div class=\"ok\">OK</div>";} else {echo "div class=\"error\">Off</div>"; $ok = false;} ?></li>

                <li>Look in the Ini file for "upload_tmp_dir =" and set the value to a path of your system outside of the area available from the web server (i.e if you are using XAMPP - do not put the temp directory in the HTDOCS folder): 
                <div class="info"><?php echo ini_get("upload_tmp_dir"); ?></div><?php if (ini_get("upload_tmp_dir") == ""): $warning=true; ?><div class="warning">Not set!
                </div><?php endif; ?></li>

                <li>Look in the Ini file for "upload_max_filesize =" and set the value to a that you want to be the maximum file size you can upload. The format for the setting is the number, then the letter 'M': 
                <div class="info"><?php echo ini_get("upload_max_filesize");?></div></li>

                <li>Look in the Ini file for "post_max_size =" and set the value to a that you want to be the maximum file size you can upload (PHP advise you set this value to be slightly greater than the upload_max_filesize. The format for the setting is the number, then the letter 'M': 
                <div class="info"><?php echo ini_get("post_max_size");?></div></li>

                <li>Look in the Ini file for "memory_limit =" and set the value to a that you want to be the maximum file size you can upload (PHP advise you set this value to be slightly greater than the upload_max_filesize. The format for the setting is the number, then the letter 'M': 
                <div class="info"><?php echo ini_get("memory_limit");?></div></li>
            </ul>
        </li>

        <li>
            <strong>The PHP "Sessions" Settings</strong> -
            <?php if(function_exists("session_start")): ?>
                <div class="ok">OK</div>
            <?php else: $ok = false; ?>
                <div class="error"><p>Please see <a href="http://uk2.php.net/manual/en/session.installation.php">PHP's own guide</a> for more details. Sessions should be turned on by default in a PHP install. Again, XAMPP users should find this is installed by default.<strong>Some of the session file settings in index, integration and session.php have been commented out - you may wish to look at which settings work best for you </strong>.</p></div>
            <?php endif; ?>
        </li>

        <li>
            <strong>The PHP "LDAP" Settings</strong> -
            <?php if (function_exists("ldap_connect")): ?>
                <div class="ok">OK</div>
            <?php else: $warning = true; ?>                
                <div class="moreinfo"><p>Please see <a href="http://php.net/manual/en/ldap.setup.php">PHP.net's guide LDAP setup</a> for more details. If you don't want to use LDAP you can continue with the installation. Make sure to choose a different authentication method.</p></div>
            <?php endif; ?>
        </li>

        <li>
            <strong>The PHP "Mail" Settings</strong> -
            <?php if(ini_get("SMTP") != ""): ?>
                <div class="ok">Probably OK</div>
            <?php else: $warning = true; ?>
            <?php endif; ?>
                
            <div class="moreinfo">
                <p>Please see <a href="http://php.net/manual/en/mail.setup.php">PHP.net's guide to mail setup</a> for more details. As the page lists, you may need to set the following variables - </p>
                <ul>
                    <li><strong>SMTP</strong> - <?php echo ini_get("SMTP"); ?></li>
                    <li><strong>smtp_port</strong> - <?php echo ini_get("smtp_port"); ?></li>
                    <li><strong>sendmail_from</strong> - <?php echo ini_get("sendmail_from"); ?></li>
                    <li><strong>sendmail_path</strong> = <?php echo ini_get("sendmail_path"); ?></li>
                </ul>
                <p>Should you wish to, you can run the code without mail, but some modifications to the feedback and version control pages would be required.</p>
            </div>           
        </li>

        <li>
            <strong>The PHP "Zlib" Settings</strong> -
            <?php if(function_exists("gzcompress")): ?>
                <div class="ok">OK</div>
            <?php else: $ok = false; ?>
                <div class="error"><p>Please see <a href="http://uk2.php.net/manual/en/zlib.setup.php">PHP's own guide</a> for more details. If you wish to export projects or make SCORM packages, you will need this library to be installed.</p></div>
            <?php endif; ?>
        </li>
    </ol>	

    
    <?php if ($warning): ?>        
        <p>Warnings were issued but you can continue the installation.</p>
    <?php endif; ?>

    <?php if ($ok): ?>
        <a href="page1.php"><button>Next &raquo;</button></a>
    <?php else: ?>
        <a href="php_modules.php"><button>Try again &raquo;</button></a>
    <?php endif; ?>

<?php require_once('page_footer.php'); ?>