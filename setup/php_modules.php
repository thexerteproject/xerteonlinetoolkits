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

    <ol>
        <li><strong>The PHP "File uploads" setting</strong>
            <ul>
                <li>Look in the Ini file for <code>file_uploads =</code> and set the value to be On: <?php if ( ini_get("file_uploads" ) == 1 ) { echo "<div class=\"ok\">OK</div>"; } else { echo "div class=\"error\">Off</div>"; $ok = false; } ?></li>

                <li>Look in the Ini file for <code>upload_tmp_dir =</code> and set the value to a path outside of the public area available to visitors to the web server (e.g if you are using XAMPP - you should not put the temp directory in the HTDOCS folder): try changing this setting to
                <code><?php echo ini_get( "upload_tmp_dir" ); ?></code>
                <?php if ( ini_get( "upload_tmp_dir" ) == "" ): $warning = true; ?>
                    <div class="warning">Not set!</div>
                <?php endif; ?></li>

                <li>Look in the Ini file for <code>upload_max_filesize =</code> and set the value to an amount that you want to be the maximum file size you can upload. The format for this setting is the number, then the letter 'M': 
                <div class="info"><?php echo ini_get( "upload_max_filesize" );?></div></li>

                <li>Look in the Ini file for <code>post_max_size =</code> and set the value to an amount that you want to be the maximum size of post data allowed. The format for this setting is the number, then the letter 'M':
                <div class="info"><?php echo ini_get( "post_max_size" );?></div>
                    <ul>
                        <li>PHP advise you set this value to be slightly greater than the <code>upload_max_filesize</code>.</li>
                    </ul> 
                </li>

                <li>Look in the Ini file for <code>memory_limit =</code> and set the value to an amount that you want to be the maximum amount of memory in bytes that a script is allowed to allocate. The format for this setting is the number, then the letter 'M': 
                <div class="info"><?php echo ini_get( "memory_limit" );?></div>
                </li>
            </ul>
        </li>

        <li>
            <strong>The PHP "Sessions" Settings</strong> -
            <?php if( function_exists( "session_start" ) ): ?>
                <div class="ok">OK</div>
            <?php else: $ok = false; ?>
                <div class="error"><p>Please see <a href="http://uk2.php.net/manual/en/session.installation.php" target="_blank">PHP's own guide</a> for more details. Sessions should be turned on by default in a PHP install. Again, XAMPP users should find this is installed by default.<strong>Some of the session file settings in index, integration and session.php have been commented out - you may wish to look at which settings work best for you </strong>.</p></div>
            <?php endif; ?>
        </li>

        <li>
            <strong>The PHP "LDAP" Settings</strong> -
            <?php if( function_exists( "ldap_connect" ) ): ?>
                <div class="ok">OK</div>
            <?php else: $warning = true; ?>                
                <div class="moreinfo"><p>Please see <a href="http://php.net/manual/en/ldap.setup.php" target="_blank">PHP.net's guide LDAP setup</a> for more details. If you don't want to use LDAP you can continue with the installation. Make sure to choose a different authentication method.</p></div>
            <?php endif; ?>
        </li>

        <li>
            <strong>The PHP "Mail" Settings</strong> -
            <?php if( ini_get( "SMTP" ) != "" ): ?>
                <div class="ok">Probably OK</div>
            <?php else: $warning = true; ?>
            <?php endif; ?>
                
            <div class="moreinfo">
                <p>Please see <a href="http://php.net/manual/en/mail.setup.php" target="_blank">PHP.net's guide to mail setup</a> for more details. As the page lists, you may need to set the following variables - </p>
                <ul>
                    <li><strong>SMTP</strong> - <?php echo ini_get( "SMTP" ); ?></li>
                    <li><strong>smtp_port</strong> - <?php echo ini_get( "smtp_port" ); ?></li>
                    <li><strong>sendmail_from</strong> - <?php echo ini_get( "sendmail_from" ); ?></li>
                    <li><strong>sendmail_path</strong> = <?php echo ini_get( "sendmail_path" ); ?></li>
                </ul>
                <p>Should you wish to, you can run the code without mail, but some modifications to the feedback and version control pages would be required.</p>
            </div>           
        </li>

        <li>
            <strong>The PHP "Zlib" Settings</strong> -
            <?php if( function_exists( "gzcompress" ) ): ?>
                <div class="ok">OK</div>
            <?php else: $ok = false; ?>
                <div class="error"><p>Please see <a href="http://uk2.php.net/manual/en/zlib.setup.php" target="_blank">PHP's own guide</a> for more details. If you wish to export projects or make SCORM packages, you will need this library to be installed.</p></div>
            <?php endif; ?>
        </li>
    </ol>   

    <h2>Notes</h2>

    <?php if ($warning): ?>        
        <p class="setup_error">"<strong>Warning</strong>" notices were issued but you can continue the installation.</p>
    <?php endif; ?>

    <p>If you need or decide to make changes, this can be achieved by editing a configuration file (typically <code>php.ini</code>).</p>
    
    <blockquote><p><strong>NB:</strong> XAMPP users do not NEED to make any of these changes for local testing.</p></blockquote>

    <h3>Finding the configuation file:</h3>

    <ul>
        <li>An automated check suggests you can find your main PHP configuration file at: <code><?php echo get_cfg_var( 'cfg_file_path' ); ?></code></li>
    </ul>

    <h3>Editing the configuation file:</h3>

    <ul>
        <li>Make a copy of the configuration file before you start.</li>
        <li>Open the original file in a plain text editor such as NotePad.</li>
        <li>Make changes as needed.</li>
        <li>Save your changes.</li>
        <li>Restart your Web server.</li>
    </ul>

    <?php if ($ok): ?>
        <a href="page1.php"><button>Next &raquo;</button></a>
    <?php else: ?>
        <a href="php_modules.php"><button>Try again &raquo;</button></a>
    <?php endif; ?>

<?php require_once('page_footer.php'); ?>