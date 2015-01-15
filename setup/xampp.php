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

$mysql_connect_id = mysql_connect("localhost", "root", "");

// Check for connection and error if failed

if(file_exists("../database.php")){

	die("<p>You've already installed toolkits</p><p>Please go to <a href='http://" . $_SERVER['HTTP_HOST'] . str_replace("setup/xampp.php", "", $_SERVER['PHP_SELF']) . "'>Xerte Online Toolkits Install</a></p>");

}

if(!$mysql_connect_id){

?>

        <p>Sorry, the attempt to connect to the host has failed. MySQL reports the following error - <?PHP echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id); ?></p>

<?PHP }

$query = "create database if not exists toolkits_data";

$query_response = mysql_query($query);			

if($query_response){


}else{

?>

        <p>Sorry, the attempt to create the database to the database has failed. MySQL reports the following error - <?PHP echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id);?></p>

<?PHP }

$query = "USE toolkits_data";

$query_response = mysql_query($query);			

if($query_response){


}else{

?>

        <p>Sorry, the attempt to specify which database we need to work on (the MySQL keyword - USE) has failed. MySQL reports the following error - <?PHP echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id); echo "The query response was " . $query_response . "<br>"; ?></p>

<?PHP }

$temp = explode(";",file_get_contents("basic.sql")); 

$x=0;

while($x!=count($temp)){

    $query = str_replace("$","",ltrim($temp[$x++]));

    if($query!=""){

        $query_response = mysql_query($query);			

    }

    if($query_response){


    }else{

?>

                <p>Sorry, The query <?PHP echo $query;  ?> has failed. MySQL reports the following error - <?PHP echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id); ?></p>

<?PHP }


}

$temp = file_get_contents("xampp.txt"); 

$query_2 = substr($temp,3);

$query_response = mysql_query($query_2);			

if($query_response){


}else{

?>

            <p>Sorry, The query <?PHP echo $query;  ?> has failed. MySQL reports the following error - <?PHP echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id); ?></p>

<?PHP }


/*
 * Create the database
 */

$buffer = file_get_contents("xampp_database.txt");
$file_handle = fopen("../database.php",'w');
fwrite($file_handle,$buffer,strlen($buffer));
fclose($file_handle);

if(!_is_writable('../index.php')) {
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
mysql_query("UPDATE sitedetails SET site_url = '$db_site_url/' WHERE site_id = 1");

$home = realpath(dirname(dirname(__FILE__)));
$db_root_file_path = mysql_real_escape_string($home);
$db_import_path = mysql_real_escape_string($home . DIRECTORY_SEPARATOR . 'import' . DIRECTORY_SEPARATOR);
mysql_query("UPDATE sitedetails SET root_file_path = '$db_root_file_path/' WHERE site_id = 1");
mysql_query("UPDATE sitedetails SET import_path = '$db_import_path/' WHERE site_id = 1");

$password = "password_" . time();

mysql_query("UPDATE sitedetails SET admin_username = 'admin' WHERE site_id = 1");
mysql_query("UPDATE sitedetails SET admin_password = '" . $password . "' WHERE site_id = 1");

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
