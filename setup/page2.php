<?php
session_start();

$success = true;

echo file_get_contents("page_top");
if (!isset($_POST['database_created']))
{
    $mysql_connect_id = mysql_connect($_POST['host'], $_POST['username'], $_POST['password']);
    $_POST['account'] = $_POST['username'];
    $_POST['accountpw'] = $_POST['password'];

    // Check for connection and error if failed
    if(!$mysql_connect_id) {
    ?>
        <p >Sorry, the attempt to connect to the host has failed. MySQL reports the following error -</p>
        <p class="error">
            <?php echo mysql_error(); ?>
        </p>
        <br />
    <?php
        $success = false;
    }
    if ($success)
    {
        $query = "create database if not exists " . $_POST['database_name'];
        $query_response = mysql_query($query);
        if(!$query_response){
    ?>
            <p>Sorry, the attempt to create the database to the database has failed. MySQL reports the following error -</p>
            <p class="error"><?php echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id);?>
            </p>
            <br/>
    <?php
            $success = false;
        }
    }
    if ($success)
    {
        $query = "USE " . $_POST['database_name'];
        $query_response = mysql_query($query);
        if(!$query_response){
    ?>
            <p>Sorry, the attempt to specify which database we need to work on (the MySQL keyword - USE) has failed. MySQL reports the following error -</p>
            <p class="error">
    <?php
            echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id); echo "The query response was " . $query_response . "</p><br>";
            $success = false;
        }
    }
    if ($success)
    {
        $temp = explode(";", file_get_contents("basic.sql"));
        $x=0;
        while($x!=count($temp) && $success){
            if($_POST['database_prefix']!=""){
                $query = str_replace("$",$_POST['database_prefix'],ltrim($temp[$x++]));
            }else{
                $query = str_replace("$","",ltrim($temp[$x++]));
            }

            if($query!=""){
                $query_response = mysql_query($query);


                if(!$query_response){
?>
                    <p>Sorry, The query <?php echo $query;  ?> has failed. MySQL reports the following error -</p>
                    <p class="error">
                    <?php echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id); ?>
                    </p>
                    <br />
<?php
                    $success = false;
                }
            }
        }
        mysql_close($mysql_connect_id);
    }
}
if ($success)
{



    $_SESSION['DATABASE_HOST'] = $_POST['host'];
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
