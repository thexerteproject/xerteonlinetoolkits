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
require_once("../functions.php");
require_once('page_header.php'); 

$xot_setup->check['file_system'] = SetupRequirements::folders(dirname(__FILE__) );
$ok = false; ?>

    <h2 style="margin-top:15px">File System Checks</h2>

    <p>If you are installing for testing in a local development environment such as Xampp you can ignore the results of these checks.</p>

    <ol>

    <?php foreach ( $xot_setup->check['file_system']->folders as $k => $v): ?>

        <li>
            <?php echo $k; ?> folder: <code><?php echo $v; ?></code> must be writable

            <?php if ($k == "Root" || $k == "Setup"): ?>during setup <?php endif; ?>-

            <?php $xot_setup->check['file_system'] = SetupRequirements::fileSystem(
                $v ); ?>

            <div class="<?php echo $xot_setup->check['file_system']->css; ?>"><?php echo $xot_setup->check['file_system']->message; ?></div>

            <?php if ($xot_setup->check['file_system']->passed): $ok = true; endif; ?>
        </li>

    <?php endforeach; ?>

    </ol>

    <h2>Notes</h2>

    <ul>
        <li>The folders listed above must be writable during setup to complete installation.</li>

        <li>Once the installer has finished, you can set the folder permissions to suit your own preferences.
            <ul>
                <li><strong>Please note</strong>: the web server will still need write / read and delete access to the 'USER-FILES', 'error_logs' and 'import' folders AFTER installation.</li>
            </ul>
        </li>
        <li>If you encounter problems: refer to the install guide or the resources available on the <a href="http://www.xerte.org.uk" target="_blank">Xerte Community Website</a>.</li>
    </ul>

    <?php if ( $ok ): ?>

        <a href="php_modules.php"><button>Next &raquo;</button></a>

    <?php else: ?>

        <a href="file_system.php"><button>Try again &raquo;</button></a>

    <?php endif; ?>

<?php require_once('page_footer.php'); ?>