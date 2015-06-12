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
 
require("../functions.php");
/**
 * XOT installer for XAMP type  users.
 * It assumes that :
 * - The database server is accessible on localhost, port 3306 with no password (user=root)
 * - The database to be created is called toolkits_data
 *
 */ 
 
echo file_get_contents("page_top");

global $xerte_toolkits_site;
global $development;
global $dberr;
$xerte_toolkits_site = new stdClass();
$xerte_toolkits_site->database_type = "mysql";
$xerte_toolkits_site->database_host = "localhost";
$xerte_toolkits_site->database_username = "root";
$xerte_toolkits_site->database_password = "";

function _debug($string) {
    global $dberr;
    $dberr = $string;
}

require_once(dirname(__FILE__) . '/../website_code/php/database_library.php');

// $xerte_toolkits_site->database_name should NOT be set
// We need to contect the server first and create it if needed
$connection = database_connect();

// Check for connection and error if failed

if(file_exists("../database.php")){

	die("<p>You've already installed toolkits</p><p>Please go to <a href='http://" . $_SERVER['HTTP_HOST'] . str_replace("setup/xampp.php", "", $_SERVER['PHP_SELF']) . "'>Xerte Online Toolkits</a></p>");

}

if(!$connection){

?>

        <p>Sorry, the attempt to connect to the host has failed. MySQL reports the following error - </p>
        <p class="error">
            <?php echo $dberr; ?>
        </p>

<?PHP }

$query = "create database if not exists toolkits_data";
try{
    $statement = $connection->query($query);
}
catch(PDOException $e) {
    _debug("Failed to connect to db: {$e->getMessage()}");
    ?>
    <p>Sorry, the attempt to create the database to the database has failed. MySQL reports the following error -</p>
    <p class="error"><?php echo  $connection->errorInfo();?>
    </p>
    <br/>
    <?php
    die;
}

$xerte_toolkits_site->database_name = 'toolkits_data';
$connection = database_connect();

$temp = explode(";",file_get_contents("basic.sql"));
$sql = file_get_contents("basic.sql");
$sql = str_replace("$","",$sql);
$sql = str_replace("<databasename>",'toolkits_data',$sql);
$temp = explode(";", $sql);
$x=0;

while($x!=count($temp)){
    $query = $temp[$x++];
    if($query!=""){

        $statement = $connection->prepare($query);
        $ok = $statement->execute();

        if ($ok === false) {
            _debug("Failed to execute query : $query : " . print_r($connection->errorInfo(), true));


            ?>
            <p>Sorry, The query <?php echo $query;  ?> has failed. MySQL reports the following error -</p>
            <p class="error">
                <?php echo $connection->errorInfo(); ?>
            </p>
            <br />
            <?php
            $statement = null;
            $connection = null;
            die;
        }
    }
}

$temp = file_get_contents("xampp.txt");

$query = substr($temp,3);
$statement = $connection->prepare($query);
$ok = $statement->execute();

if ($ok === false) {
    _debug("Failed to execute query : $query : " . print_r($connection->errorInfo(), true));


    ?>
    <p>Sorry, The query <?php echo $query;  ?> has failed. MySQL reports the following error -</p>
    <p class="error">
        <?php echo $connection->errorInfo(); ?>
    </p>
    <br />
    <?php
    $statement = null;
    $connection = null;
    die;
}

/*
 * Create the database
 */

$buffer = file_get_contents("xampp_database.txt");
$file_handle = fopen("../database.php",'w');
fwrite($file_handle,$buffer,strlen($buffer));
fclose($file_handle);

if(!is_writable('../index.php')) {
    echo "Check your file permissions, index.php file is not writeable by the web server; you will want to replace index.php with demo.txt";
}
/*if(is_file('../index.php') && _is_writable('../index.php')) {
    @copy("../index.php","../index.txt");
    if(copy("../demo.txt","../index.php")) {
        echo "<p>Login requirement removed; using demo.txt as index.php page (index.php -&gt; index.txt && demo.txt -&gt index.php).</p>";
    }
}*/

// update DB so it should work on Windows and OSX installs - rather than being hard coded to WAMP installs...
$site_url = 'http://' . $_SERVER['HTTP_HOST'] . dirname(dirname($_SERVER['REQUEST_URI']));

$db_site_url = mysql_real_escape_string($site_url);

$query= "UPDATE sitedetails SET site_url = '$db_site_url/' WHERE site_id = 1";
$statement = $connection->prepare($query);
$ok = $statement->execute();

if ($ok === false) {
    _debug("Failed to execute query : $query : " . print_r($connection->errorInfo(), true));


    ?>
    <p>Sorry, The query <?php echo $query;  ?> has failed. MySQL reports the following error -</p>
    <p class="error">
        <?php echo $connection->errorInfo(); ?>
    </p>
    <br />
    <?php
    $statement = null;
    $connection = null;
    die;
}

$home = realpath(dirname(dirname(__FILE__)));
$home = str_replace('\\', '/', $home);
$db_root_file_path = $home;
$db_import_path = $home . DIRECTORY_SEPARATOR . 'import' . DIRECTORY_SEPARATOR;

$query = "UPDATE sitedetails SET root_file_path = '$db_root_file_path/' WHERE site_id = 1";
$statement = $connection->prepare($query);
$ok = $statement->execute();

if ($ok === false) {
    _debug("Failed to execute query : $query : " . print_r($connection->errorInfo(), true));


    ?>
    <p>Sorry, The query <?php echo $query;  ?> has failed. MySQL reports the following error -</p>
    <p class="error">
        <?php echo $connection->errorInfo(); ?>
    </p>
    <br />
    <?php
    $statement = null;
    $connection = null;
    die;
}
$query="UPDATE sitedetails SET import_path = '$db_import_path/' WHERE site_id = 1";
$statement = $connection->prepare($query);
$ok = $statement->execute();

if ($ok === false) {
    _debug("Failed to execute query : $query : " . print_r($connection->errorInfo(), true));


    ?>
    <p>Sorry, The query <?php echo $query;  ?> has failed. MySQL reports the following error -</p>
    <p class="error">
        <?php echo $connection->errorInfo(); ?>
    </p>
    <br />
    <?php
    $statement = null;
    $connection = null;
    die;
}

$password = "password_" . time();

$query="UPDATE sitedetails SET admin_username = 'admin' WHERE site_id = 1";
$statement = $connection->prepare($query);
$ok = $statement->execute();

if ($ok === false) {
    _debug("Failed to execute query : $query : " . print_r($connection->errorInfo(), true));


    ?>
    <p>Sorry, The query <?php echo $query;  ?> has failed. MySQL reports the following error -</p>
    <p class="error">
        <?php echo $connection->errorInfo(); ?>
    </p>
    <br />
    <?php
    $statement = null;
    $connection = null;
    die;
}

$query = "UPDATE sitedetails SET admin_password = '" . $password . "' WHERE site_id = 1";
$statement = $connection->prepare($query);
$ok = $statement->execute();

if ($ok === false) {
    _debug("Failed to execute query : $query : " . print_r($connection->errorInfo(), true));


    ?>
    <p>Sorry, The query <?php echo $query;  ?> has failed. MySQL reports the following error -</p>
    <p class="error">
        <?php echo $connection->errorInfo(); ?>
    </p>
    <br />
    <?php
    $statement = null;
    $connection = null;
    die;
}

$statement = null;
$connection = null;

?>
        <h2 style="margin-top:15px">
        Toolkits has been installed.</h2><p> Please go to <a href="<?php echo $site_url; ?>"><?php echo $site_url; ?></a> </p>
        <p>
            Please see the Xerte site at <a href="http://www.nottingham.ac.uk/xerte" target="new">http://www.nottingham.ac.uk/xerte</a> and please consider joining the mailing list.
        </p>
		<p>
			Your admin username for the Admin Panel (management.php) 
			<ul>
				<li>Username : <strong>admin</strong></li>
				<li>Password : <strong><?PHP echo $password; ?></strong></li>
			</ul>
		</p>
</body>
</html>
