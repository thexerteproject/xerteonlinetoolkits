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

	if(ini_get("file_uploads")){

		echo "File uploads are set in php.ini to be on <br>";

	}else{

		echo "File uploads are set in php.ini to be off <br>";

	}

	if(ini_get("upload_tmp_dir")==""){

		echo "The directory isn't set, PHP should use a default value, but you may want to set this. <br>";

	}else{

		echo "File uploads are set in php.ini to be " . ini_get("upload_tmp_dir") . "<br>";

	}

	echo "The maximum uploadedable file size is set in php.ini to be " . ini_get("upload_max_filesize") . "<br>";
	echo "The max post size is set in php.ini to be " . ini_get("post_max_size") . "<br>";
	echo "The memory limit is set in php.ini to be " . ini_get("memory_limit") . "<br>";

	echo "Checking for MySQL Code<br>";

	if(function_exists("mysql_connect")){

		echo "MySQL functions exist<Br>";

	}else{

		echo "MySQL functions do not exist<Br>";

	}

	echo "Checking for sessions<br>";

	if(function_exists("session_start")){

		echo "Sessions exists<Br>";

	}else{

		echo "Session functions do not exist<Br>";

	}

	echo "Checking for ldap code <br>";

	if(function_exists("ldap_connect")){

		echo "LDAP functions exists<Br>";

	}else{

		echo "LDAP functions do not exist<Br>";

	}

	echo "Checking for mail Zlib <br>";

	if(function_exists("gzcompress")){

		echo "Zlib function exists<Br>";

	}else{

		echo "Zlib functions do not exist<Br>";

	}

?>
<form action="php_modules_iframe.php">
<input type="submit" value="Try again" />
</form>