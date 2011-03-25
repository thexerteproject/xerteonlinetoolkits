<?PHP

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

	if(session_start()){

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