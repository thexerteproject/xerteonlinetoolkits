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