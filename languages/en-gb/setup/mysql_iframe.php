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

	if(function_exists("mysql_connect")){
		
		?><p>Mysql Functions installed</p>
		<form action="mysql_iframe_2.php">
			<input type="submit" value="MySQL Test 2" />
		</form><?PHP
	

	}else{

		echo "mysql software not installed<br>";

	}


?>
<form action="mysql_iframe.php">
<input type="submit" value="Try again" />
</form>