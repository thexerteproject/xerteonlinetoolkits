<?PHP 

echo file_get_contents("page_top");

?>
<h2 style="margin-top:15px">
Xerte Online Toolkits MySQL checks
</h2>
<p>
<ol>
<li>A MYSQL Install (Xerte Online Toolkits was developed on ver 14.12 Distrib 5.05.51a for Win32. We haven't tested this with other versions, or on other database systems)</li>
<li><b>The PHP "MySQL" Settings</b> - Please see <a href="http://uk3.php.net/manual/en/mysql.installation.php">PHP's own guide</a> for more details. Xampp installs should come with MySQL installed. Different versions of PHP however may or may not have MySQL installed by default. If on the PHP Info page you can find a section headed  "MySQL", then you should find it is installed.</li>
/ol>	
</p>
<p>
You will need
<ol>
<li><b>A User account</b> - with select, insert, update and delete priviledges.</li>
<li><b>An Admin account</b> - which can create the database, AND / OR create tables in a database.</li>
<li><b>A database</b> - This can be a new one which is created, or an existing one into which Toolkits can be installed .</li>
</ol>
</p>
<iframe width="900" height="300" src="iframe_mysql.php"></iframe><br>
	If no errors are listed above, please start the <a href="page1.php">installation process</a>.
</body>
</html>