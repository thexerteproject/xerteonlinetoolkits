<?PHP 

echo file_get_contents("page_top");

?>
<h2 style="margin-top:15px">
Xerte Online Toolkits php modules checks
</h2>
<p>
Use your <a href="phpinfo.php" target="_blank">PHP info page</a> to find the 'Loaded Configuration File' (look on the first part of the php info page for the text 'Loaded Configuration File' - the use this path to find the file. Make a copy of it before you start. You can edit this file in notepad, or any text editor. People following the XAMPP path should find that they do not need to make any of these changes to make their system work.
<ol>
	<li><b>The PHP " File uploads" setting</b>
				<ul>
					<li>Look in the Ini file for "file_uploads =" and set the value to be On</li>
					<li>Look in the Ini file for "upload_tmp_dir =" and set the value to a path of your system outside of the area available from the web server (i.e if you are using XAMPP - do not put the temp directory in the HTDOCS folder)</li>
					<li>Look in the Ini file for "upload_max_filesize =" and set the value to a that you want to be the maximum file size you can upload. The format for the setting is the number, then the letter 'M'.</li>
					<li>Look in the Ini file for "post_max_size =" and set the value to a that you want to be the maximum file size you can upload (PHP advise you set this value to be slightly greater than the upload_max_filesize. The format for the setting is the number, then the letter 'M'.</li>
					<li>Look in the Ini file for "memory_limit =" and set the value to a that you want to be the maximum file size you can upload (PHP advise you set this value to be slightly greater than the upload_max_filesize. The format for the setting is the number, then the letter 'M'.</li>
				</ul>
	</li>
	<li><b>The PHP "MySQL" Settings</b> - Please see <a href="http://uk3.php.net/manual/en/mysql.installation.php">PHP's own guide</a> for more details. Xampp installs should come with MySQL installed. Different versions of PHP however may or may not have MySQL installed by default. If on the PHP Info page you can find a section headed  "MySQL", then you should find it is installed.</li>
	<li><b>The PHP "Sessions" Settings</b> - Please see <a href="http://uk2.php.net/manual/en/session.installation.php">PHP's own guide</a> for more details. Sessions should be turned on by default in a PHP install. Again, XAMPP users should find this is installed by default.<b>Some of the session file settings in index, integration and session.php have been commented out - you may wish to look at which settings work best for you </b>.</li>
	<li><b>The PHP "LDAP" Settings</b> - Please see <a href="http://uk2.php.net/manual/en/ldap.setup.php">PHP's own guide</a> for more details. If you don't want to use LDAP you could write your own authentication code, or refer to the readme.txt in the main install folder on how to run an LDAP free version of the code.</li>
	<li><b>The PHP "Mail" Settings</b> - Please see <a href="http://uk2.php.net/manual/en/mail.setup.php">PHP's own guide</a> for more details. As the page lists, you may need to set the following variables - <b>SMTP, smtp_port, sendmail_from </b> and <b>sendmail_path</b>. Should you wish to, you can run the code without mail, but some modifications to the feedback and version control pages would be required.</li>	
	<li><b>The PHP "Zlib" Settings</b> - Please see <a href="http://uk2.php.net/manual/en/zlib.setup.php">PHP's own guide</a> for more details. If you wish to export projects or make SCORM packages, you will need this library to be installed.</li>	
</ol>	

</p>
<iframe width="900" height="300" src="iframe_php.php"></iframe><br>
	If no errors are listed above, please proceed to the <a href="mysql_test.php">next test</a>.
</body>
</html>