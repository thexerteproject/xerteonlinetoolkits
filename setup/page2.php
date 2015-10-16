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
session_start();

// prevent PDO warning notices
// error_reporting(0);
global $dberr;
$success       = true;
$xot_error_tag = 'p';
$xot_error_css = 'setup_error';
$xot_error_txt = 'Sorry, the attempt to create the database to the database has failed. MySQL reports the following error:';
$xot_db_error = '';

require_once('page_header.php'); 

function _setup_debug($string) {
    global $dberr;
    $dberr = $string;
    return $string;
}

if ( !isset($_POST['database_created']) )
{
    $xot_setup->database    = new SetupDatabase($_POST);
    $xerte_toolkits_site    = $xot_setup->database->getSettings();
    $_POST['account']       = $_POST['username'];
    $_POST['accountpw']     = $_POST['password'];

    // Create a PDO instance to represent a connection to the database.
    $connection = $xot_setup->database->connect();

    // Test connection Return error if  failed
    if (!$connection) 
    {
        $xot_db_error = $xot_setup->database->getError($xot_setup->database->conn_error);
        $success = false;
    // create the database
    } else {
        $query = "create database if not exists " . $_POST['database_name'];

        if ( $xot_setup->database->create($connection, $query) )
        {
            // set the database name - for the next conncection test and session variables
            $xerte_toolkits_site->database_name = $_POST['database_name'];
            $xot_setup->database->setName( $_POST['database_name'] );

            // display error if database not created            
            if ( !$statement = $xot_setup->database->connect() ) 
            {
                $xot_db_error = $xot_setup->database->getError($xot_setup->database->conn_error);
                $success = false;
            }
        }

        // insert SQL
        if ($success)
        {
            $sql = $xot_setup->database->getSQL( 'basic.sql' );

            $temp = explode(";", $sql);
            $x    = 0;

            while( $x!=count($temp) && $success )
            {
                $query = $temp[$x++];

                if ( $query !="" ) 
                {
                    $ok = $xot_setup->database->runQuery( $query );

                    if ( $ok === false ) {
                        $xot_db_error = 'Failed to execute query line 89 page2.php';
                        $statement = null;
                        $connection = null;
                        $success = false;
                    }
                }
            }
            $statement = null;
            $connection = null;
        }
    }
}

if ($success):

    SetupDatabase::setSession($_POST, $xerte_toolkits_site);
?>

    <h2>MySQL Database Account Set up page</h2>

    <p>Your Xerte Online Toolkits database has been successfully created. When users are creating work on the site, PHP will need a MySQL username with select, insert, update and delete privileges.</p>

    <p>Re-enter your database username and password below.</p>

    <form action="page_password.php" method="post" enctype="multipart/form-data">

        <div class="form_field">
            <label for="account">Database username</label>
            <input type="text" width="100" name="account" id="account" value="<?php echo $_POST['account'];?>"/>
            <span class="form_help">Database account name for users of the site. XAMPP should type in root.</span>
        </div>

        <div class="form_field">
            <label for="password">Database password</label>
            <input type="password" width="100" name="accountpw" id="accountpw" value="<?php echo $_POST['accountpw'];?>"/>
            <span class="form_help">Database password for the account above. XAMPP should leave this field blank UNLESS they have setup a MySQL password.</span>
        </div>

        <button type="submit">Next</button>
    </form>

<?php else: ?>

    <h2>Creating MySQL Database Failed!</h2>

    <p>Your Xerte Online Toolkits database has not been created! Please investigate the error messages and return to the previous page by pressing the button below!</p>

    <?php if ($xot_db_error): ?>
        <ul>
            <li class="error"><?php echo $xot_db_error; ?></li>
        </ul>
    <?php endif; ?>

    <form action="page1.php" method="post" enctype="multipart/form-data" class="previous">
        <input type="hidden" name="host" value="<?php echo $_POST['host'];?>"/>
        <input type="hidden" name="username" value="<?php echo $_POST['username'];?>"/>
        <input type="hidden" name="password" value="<?php echo $_POST['password'];?>"/>
        <input type="hidden" name="database_name" value="<?php echo $_POST['database_name'];?>"/>
        <input type="hidden" name="database_prefix" value="<?php echo $_POST['database_prefix'];?>"/>
        <button type="submit">&laquo; Previous</button>
    </form>

<?php endif; ?>

<?php require_once('page_footer.php'); ?>