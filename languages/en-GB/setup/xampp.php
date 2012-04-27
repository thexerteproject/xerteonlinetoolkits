<?PHP echo file_get_contents("page_top");

	$mysql_connect_id = mysql_connect("localhost", "root", "");

	// Check for connection and error if failed

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

	rename("../index.php","../index.txt");

	rename("../demo.txt","../index.php");


	?>

		<h2 style="margin-top:15px">
			Toolkits has been installed.</h2><p> Please go to <a href="http://localhost/xertetoolkits/">http://localhost/xertetoolkits/</a>
		</p>
		<p>
			Please see the Xerte site at <a href="http://www.nottingham.ac.uk/xerte" target="new">http://www.nottingham.ac.uk/xerte</a> and please consider joining the mailing list.
		</p>
</body>
</html>