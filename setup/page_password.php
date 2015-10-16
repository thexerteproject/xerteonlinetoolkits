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
require_once('page_header.php');

global $xerte_toolkits_site, $development;
$success                = true;
$_POST['mysql']         = "mysql";
$xot_setup->database    = new SetupDatabase($_POST, $_SESSION);
$xerte_toolkits_site    = $xot_setup->database->getSettings();

// Create a PDO instance to represent a connection to the database.
$connection = $xot_setup->database->connect();

if (!$connection) { ?>

    <p>Sorry, the attempt to connect to MySql on the host <?php echo $_SESSION['DATABASE_HOST']; ?> has failed using account <?php echo $_POST['account']; ?>. MySQL reports the following error -</p>
    
    <p class="setup_error"><?php echo $connection->errorInfo(); ?></p>

    <p>The account <?php echo $_POST['account']; ?> must already exist, and have access to database <?php echo $_SESSION['DATABASE_NAME'];?></p>
<?php
    $success = false;
}

$connection = null;

if ($success)
{
    $res = $xot_setup->database->runQuery("insert into " 
        . $_SESSION['DATABASE_PREFIX'] . "sitedetails(site_id) VALUES (999)");
    if ($res === false)
    {
        $success = false;
    }
    else
    {
        $res = db_query("delete from " . $_SESSION['DATABASE_PREFIX'] . "sitedetails where site_id=999");
        if ($res === false)
        {
            $success=false;
        }
    }

    if (!$success)
    {
?>
       <p>Sorry, the attempt to insert and delete records in MySql on the host <?php echo $_SESSION['DATABASE_HOST']; ?> has failed using account <?php echo $_POST['account']; ?>.</p>

        <p>The account <?php echo $_POST['account']; ?> exists, but does not have enough privileges to access database <?php echo $_SESSION['DATABASE_NAME'];?></p>
<?php
        // Remove record as DBA
        $xerte_toolkits_site->database_username = $_POST['account'];
        $xerte_toolkits_site->database_password = $_POST['accountpw'];
        $res = db_query("delete from " . $_SESSION['DATABASE_PREFIX'] . "sitedetails where site_id=999");
    }
}

if ($success)
{

    $buffer = file_get_contents("database.txt");

    $buffer = str_replace("DATABASE_TYPE", $xerte_toolkits_site->database_type,$buffer);
    $buffer = str_replace("DATABASE_HOST", $xerte_toolkits_site->database_host,$buffer);
    $buffer = str_replace("DATABASE_NAME", $xerte_toolkits_site->database_name,$buffer);
    $buffer = str_replace("DATABASE_PREFIX", $xerte_toolkits_site->database_prefix,$buffer);
    $buffer = str_replace("DATABASE_USERNAME",$xerte_toolkits_site->database_username,$buffer);
    $buffer = str_replace("DATABASE_PASSWORD",$xerte_toolkits_site->database_password,$buffer);
    if (file_put_contents('../database.php', $buffer) === false)
    {
        die("database.php could not be created");
    }

?>

    <h2>Admin Password Setup Page</h2>

    <p>Your Xerte Online Toolkits database configuration has been successfully created.</p>
    
    <p>Now please create an admin username and password for the site</p>

    <form action="page3.php" method="post" onSubmit="javascript:
                if(document.getElementById('account').value==''||document.getElementById('password').value==''){
                    alert('Please set a username and password');
                    return false;
                }
                return true;" enctype="multipart/form-data">
        <label for="account">Admin account name</label><br /><br /><input type="text" width="100" name="account" id="account" /><br /><br />
        <label for="password">Admin account password</label><br /><br /><input type="password" width="100" name="password" id="password"/><br /><br />
        <button type="submit">Next</button>
    </form>

<?php
}
else
{
?>
    <h2>Using given MySQL account failed!</h2>

    <p>Your Xerte Online Toolkits database configuration file is not created! Please investigate the error messages and return to the previous page by pressing the button below!</p>

    <form action="page2.php" method="post" enctype="multipart/form-data">
        <input type="hidden" name="host" value="<?php echo $_SESSION['DATABASE_HOST'];?>"/>
        <input type="hidden" name="database_name" value="<?php echo $_SESSION['DATABASE_NAME'];?>"/>
        <input type="hidden" name="database_prefix" value="<?php echo $_SESSION['DATABASE_PREFIX'];?>"/>
        <input type="hidden" name="database_created" value="1" />
        <input type="hidden" name="account" value="<?php echo $_POST['account'];?>"/>
        <input type="hidden" name="accountpw" value="<?php echo $_POST['accountpw'];?>"/>
        <button type="submit">Previous</button>
    </form>

<?php
}
?>

<?php require_once('page_footer.php'); ?>
