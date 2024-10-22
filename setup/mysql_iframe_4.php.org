<!--
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
 -->
<html>
	<head>
		<style>

			html{
	
				font-family:arial;

			}

		</style>

	</head>
	<body>
	Trying to connect.<br><br><?PHP

	$response = mysql_connect($_POST['host'],$_POST['username'],$_POST['password']);

	if(!$response){

		echo "The MySQL error number is " . mysql_errno() . "<br>";
		echo "The MySQL error string is " . mysql_error() . "<br>";
		echo "That user cannot connect to that host from this host<br>";

	}else{

		echo "Host / Username / Password connectivitiy achieved <br>";

	}

	echo "<br><br>Checking for user permissions <br>";

	$result = mysql_query("show grants for " . $_POST['username'] . "@" . $_SERVER['SERVER_NAME']);

	if(!$result){
					
		echo "Due to the following error - " . mysql_error() . " - " . mysql_errno() . " we cannot ascertain whether we can create this database<br>";
		echo "<p>Some accounts may not have this right and so you can proceed if you believe this not to be an issue</p>";

	}else{

		echo "These are the rights that users has <br><br>";

		echo "<pre>";

		print_r($result);

		echo "</pre>";

	}
?><form action="mysql_iframe_4.php">
<input type="submit" value="Try again" />
</form>
