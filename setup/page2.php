<?php
session_start();

$success = true;

echo file_get_contents("page_top");
if (!isset($_POST['database_created']))
{

    global $xerte_toolkits_site;
    global $development;
    $xerte_toolkits_site = new stdClass();
    $xerte_toolkits_site->database_type = "mysql";
    $xerte_toolkits_site->database_host = $_POST['host'];
    if ($xerte_toolkits_site->database_host == 'localhost')
    {
        $xerte_toolkits_site->database_host = '127.0.0.1';
    }

    $xerte_toolkits_site->database_prefix = $_POST['database_prefix'];
    if (isset($_POST['username']) && isset($_POST['password']))
    {
        $xerte_toolkits_site->database_username = $_POST['username'];
        $xerte_toolkits_site->database_password = $_POST['password'];
    }

    require_once(dirname(__FILE__) . '/../website_code/php/database_library.php');

    $connection = database_connect();
    $_POST['account'] = $_POST['username'];
    $_POST['accountpw'] = $_POST['password'];

    // Check for connection and error if failed
    if(!$connection) {
    ?>
        <p >Sorry, the attempt to connect to the host has failed. MySQL reports the following error -</p>
        <p class="error">
            <?php echo $connection->errorInfo(); ?>
        </p>
        <br />
    <?php
        $success = false;
    }
    if ($success)
    {
        $xerte_toolkits_site->database_name = $_POST['database_name'];
        $connection = database_connect();
        $sql = file_get_contents("basic.sql");
        if($_POST['database_prefix']!=""){
            $sql = str_replace("$",$_POST['database_prefix'],$sql);
        }else{
            $sql = str_replace("$","",$sql);
        }
        $sql = str_replace("<databasename>",$_POST['database_name'],$sql);
        $temp = explode(";", $sql);
        $x=0;
        while($x!=count($temp) && $success){
            $query = $temp[$x++];
            if($query!=""){

                $statement = $connection->prepare($query);
                $ok = $statement->execute();

                if ($ok === false) {
                    _debug("Failed to execute query : $sql : " . print_r($connection->errorInfo(), true));


                ?>
                    <p>Sorry, The query <?php echo $query;  ?> has failed. MySQL reports the following error -</p>
                    <p class="error">
                    <?php echo $connection->errorInfo(); ?>
                    </p>
                    <br />
<?php
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
if ($success)
{



    $_SESSION['DATABASE_HOST'] = $xerte_toolkits_site->database_host;
    $_SESSION['DATABASE_NAME'] = $_POST['database_name'];
    $_SESSION['DATABASE_PREFIX'] = $_POST['database_prefix'];
    if (isset($_POST['username']) && isset($_POST['password']))
    {
        $_SESSION['MYSQL_DBA'] = $_POST['username'];
        $_SESSION['MYSQL_DBAPASSWORD'] = $_POST['password'];
    }
?>

    <h2 style="margin-top:15px">
    MySQL Database Account Set up page
    </h2>
    <p>
    Your Xerte Online Toolkits database has been successfully created. When users are creating work on the site, the PHP will need a MySQL username with select,insert,update and delete privileges.
    </p>
    <p>
    <form action="page_password.php" method="post" enctype="multipart/form-data">
        <label for="account">Database account name for users of the site. People following the XAMPP path / or testing locally should type in root.</label><br /><br />
        <input type="text" width="100" name="account" id="account" value="<?php echo $_POST['account'];?>"/><br /><br />
        <label for="password">Database password for the account above. People following the XAMPP path / or testing locally should leave this field blank.</label><br /><br />
        <input type="password" width="100" name="accountpw" id="accountpw" value="<?php echo $_POST['accountpw'];?>"/><br /><br />
        <button type="submit">Next</button>
    </form>
    </p>
<?php
}
else
{
?>
    <h2 style="margin-top:15px">
        Creating MySQL Database Failed!
    </h2>
    <p></p>
    <p>
        Your Xerte Online Toolkits database is not created! Please investigate the error messages and return to the previous page by pressing the button below!
    </p>
    <p>
    <form action="page1.php" method="post" enctype="multipart/form-data">
        <input type="hidden" name="host" value="<?php echo $_POST['host'];?>"/>
        <input type="hidden" name="username" value="<?php echo $_POST['username'];?>"/>
        <input type="hidden" name="password" value="<?php echo $_POST['password'];?>"/>
        <input type="hidden" name="database_name" value="<?php echo $_POST['database_name'];?>"/>
        <input type="hidden" name="database_prefix" value="<?php echo $_POST['database_prefix'];?>"/>
        <button type="submit">Previous</button>
    </form>
    </p>

<?php
}
?>
</div>
</body>
</html>
