<?PHP
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
require_once("../functions.php");
require_once('../website_code/php/database_library.php');
require_once('page_header.php');

$xot_setup->check['php']    = SetupRequirements::phpVersion(); 
$xot_setup->check['mysql']  = SetupRequirements::MysqlCheck(); ?>

    <h2>System Requirements</h2>

    <p>Xerte Online Toolkits has the following system requirements:</p> 

    <ol>
        <li>A Web server running PHP version 5.2 or above.        
            <div class="<?php echo $xot_setup->check['php']->css; ?>">Your version of PHP is <?php echo $xot_setup->check['php']->message; ?></div>
            <ul>
                <li>Xerte Online Toolkits was developed on PHP 5.2+, it may work on older versions. It may not.</li>
            </ul>
        </li>

        <li>A MYSQL database - 

            <?php if ( $xot_setup->check['mysql']->passed ): ?>

                <div class="ok">MySQL support present - OK</div>

            <?php else: ?>

                <div class="error">
                    <p>Your PHP does not seem to have MySQL support</p>
                    <p>Please see <a href="http://uk3.php.net/manual/en/mysql.installation.php">PHP's own guide</a> for more details. Xampp installs should come with MySQL installed. Different versions of PHP however may or may not have MySQL installed by default. If on the PHP Info page you can find a section headed "MySQL", then you should find it is installed.</p>
                </div>

            <?php endif; ?>

            <ul>
                <li>Xerte Online Toolkits was developed on ver 14.12 Distrib 5.05.51a for Win32.</li>
                <li>We haven't tested this with other versions, or on other database systems.</li>
            </ul>
        </li>
    </ol>

    <h2>Notes</h2>


      <?php if ( !$xot_setup->check['mysql']->passed || !$xot_setup->check['php']->passed ): ?>

        <h2>Installation Aborted</h2>

        <p>Upgrades to your system are required to complete installaion. See suggestions above.</p>

        <p><strong>All of the above are present within WAMP or LAMP installations</strong>. See your system administrator or check out the <a href="http://www.apachefriends.org/" target="_blank" title="XAMPP Project">XAMPP Project</a> to get a non-production development environment for Windows, Linux or OS X.</p>

        <a href="requirements.php"><button>Try again &raquo;</button></a>

    <?php elseif ( $xot_setup->check['mysql']->passed && $xot_setup->check['php']->passed ): ?>
        
        <p>Your system meets the minimum requirements.</p>

        <a href="file_system_test.php"><button>Next &raquo;</button></a>

    <?php endif; ?>

<?php require_once('page_footer.php'); ?>