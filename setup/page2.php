<?PHP echo file_get_contents("page_top");
		
	$mysql_connect_id = mysql_connect($_POST['host'], $_POST['username'], $_POST['password']);

	// Check for connection and error if failed

	if(!$mysql_connect_id){

		?>

		<p>Sorry, the attempt to connect to the host has failed. MySQL reports the following error - <?PHP echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id); ?></p>

		<?PHP }

	$query = "create database if not exists " . $_POST['database_name'];
	
	$query_response = mysql_query($query);			

	if($query_response){


	}else{

		?>

		<p>Sorry, the attempt to create the database to the database has failed. MySQL reports the following error - <?PHP echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id);?></p>

		<?PHP }

	$query = "USE " . $_POST['database_name'];

	$query_response = mysql_query($query);			

	if($query_response){


	}else{

		?>

		<p>Sorry, the attempt to specify which database we need to work on (the MySQL keyword - USE) has failed. MySQL reports the following error - <?PHP echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id); echo "The query response was " . $query_response . "<br>"; ?></p>

		<?PHP }

	$temp = explode(";",file_get_contents("basic.sql")); 

	$x=0;

	while($x!=count($temp)){

		if($_POST['database_prefix']!=""){

			$query = str_replace("$",$_POST['database_prefix'],ltrim($temp[$x++]));

		}else{

			$query = str_replace("$","",ltrim($temp[$x++]));

		}

		if($query!=""){
		
			$query_response = mysql_query($query);			

		}

		if($query_response){


		}else{

			?>

				<p>Sorry, The query <?PHP echo $query;  ?> has failed. MySQL reports the following error - <?PHP echo mysql_errno($mysql_connect_id) . " - " . mysql_error($mysql_connect_id); ?></p>

			<?PHP }


	}

	$buffer = file_get_contents("database.txt");

	$buffer = str_replace("DATABASE_HOST",$_POST['host'],$buffer);
	$buffer = str_replace("DATABASE_NAME",$_POST['database_name'],$buffer);
	$buffer = str_replace("DATABASE_PREFIX",$_POST['database_prefix'],$buffer);

	$file_handle = fopen("database.txt",'w');
	fwrite($file_handle,$buffer,strlen($buffer));
	fclose($file_handle);
	@chmod("database.txt",0777);

?>

<h2 style="margin-top:15px">
MySQL Database Account Set up page
</h2>
<p>
Your Xerte Online Toolkits database has been successfully created. When users are creating work on the site, the PHP will need a MySQL username with select,insert,update and delete privleges.
</p>
<p>
<form action="page3.php" method="post" enctype="multipart/form-data">
<label>Database account name for users of the site. People following the XAMPP path / or testing locally should type in root.</label><br /><br /><input type="text" width="100" name="account" /><br /><br />
<label>Database password for the account above. People following the XAMPP path / or testing locally should leave this field blank.</label><br /><br /><input type="password" width="100" name="password" /><br /><br />
<input type="image" src="next.gif" />
</form>
</p>
</div>
</body>
</html>


