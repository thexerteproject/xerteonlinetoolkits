<html>
	<head>
		<style>

			html{
	
				font-family:arial;

			}

		</style>

	</head>
	<body>
	Running a test for MySQL error reporting. Having MySQL functions mysql_errno and mysql_error makes allows for easier debugging of mysql problems. <br>
	We've deliberately made a mysql function fail to see what errors you get.<br><br><br>
<?PHP

	$response = mysql_connect("","","");

	if(!$response){

		echo "The MySQL error number is " . mysql_errno() . "<br>";
		echo "The MySQL error string is " . mysql_error() . "<br>";

	}else{

		echo "Default connection achieved <br>";

	}
?>
<form action="mysql_iframe_3.php">
<input type="submit" value="Next test" />
</form>
<form action="mysql_iframe_2.php">
<input type="submit" value="Try again" />
</form>
