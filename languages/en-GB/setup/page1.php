<?PHP echo file_get_contents("page_top");

if(function_exists("mysql_connect")&&function_exists("mysql_query")){

?>

<h2 style="margin-top:15px">
MySQL Database Creation page
</h2>
<p>
On this page the installer will execute a MySQL query to create the database that Xerte Online Toolkits will use. 
</p>
<form action="page2.php" method="post" enctype="multipart/form-data">
<label>Please start by typing in the name of the host where you'd like the toolkits database to be created on. People following the XAMPP path / or testing locally should type in localhost.</label><br><br><input type="text" size="100" name="host" /><br /><br>
<label>Please enter the username for a MySQL account that has Create and Insert rights on this host from this location. People following the XAMPP path / or testing locally should type in root.</label><br><br>
<input type="text" size="100" name="username" /><br><br>
<label>Please enter the password for this account (optional). People following the XAMPP path / or testing locally should leave this field blank.</label><br><br>
<input type="password" size="100" name="password" /><br><br>
<label>Please enter the name for the database if it already exists, or the name of the new database if you'd like one creating.</label><br><br>
<input type="text" size="100" name="database_name" /><br><br>
<label>If you'd like to prefix the tables installed with a word to help house keeping, please type it in below (optional).</label><br><br>
<input type="text" size="100" name="database_prefix" /><br><br>
<input type="image" src="next.gif" />
</form>



<?PHP }else{

?>

	<p>Sorry your PHP install lacks the functions mysql_connect and mysql_query, and without these this installer cannot create the database.</p>
	die();

<?PHP }

?>


</body>
</html>
