<?PHP
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
 ?>

<html>
	<head>
		<style>

			html{
	
				font-family:arial;

			}

		</style>

	</head>
	<body>

<?PHP 

	echo "Trying to write to USER-FILES<br>";

	$file_handle = fopen("../USER-FILES/database.txt",'a+');

	$work = true;

	if(!$file_handle){

		$work = false;
		
		?>
			<p>The file /setup/database.txt was not set to be writable - this means future pages will not work. Please edit this file before continuing.
		<?PHP

	}
	
	if(!fwrite($file_handle," ")){

		$work = false;

		?>
			<p>The file /setup/database.txt could not be written too - this means future pages will not work. Please edit this file before continuing.
		<?PHP		

	}

	if($work){

		?>
			<p>The file /setup/database.txt has been successfully written to.
		<?PHP


	}


?>
<form action="file_system_iframe.php">
<input type="submit" value="Try again" />
</form>