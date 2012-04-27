<?PHP 

echo file_get_contents("page_top");

?>
<h2 style="margin-top:15px">
Xerte Online Toolkits initial technical checks
</h2>
<p>
Please <b><u>note the following technical requirements</u></b> for the site. 
<ol>
<li>A PHP Server running version 4 or above (Xerte Online Toolkits was developed on php 4.3.9 and on php 5.2.5.).</li>
<li>A MYSQL Install (Xerte Online Toolkits was developed on ver 14.12 Distrib 5.05.51a for Win32. We haven't tested this with other versions, or on other database systems)</li>
<li><b>All of the above can come from a single WAMP or LAMP installation</b>, such as those available as part of <a href="http://www.apachefriends.org/" target="_blank">XAMPP Project</a></li>
<li>Although not critical, Xerte Online Toolkits uses PHP mail functions for parts of its code. You can remove these manually from the code should you so wish.
</li>
<li>Xerte Online Toolkits has been build around LDAP authentication - you can however not use this is you prefer.
</li>
</ol>
</p>
<p>At present, with the files positioned as they are, you will install the system into <?PHP echo substr(getcwd(),0,strlen(getcwd())-5);?> and you will have a system with the web address of http://<?PHP echo $_SERVER['HTTP_HOST'] . substr($_SERVER['PHP_SELF'],0,strlen($_SERVER['PHP_SELF'])-22); ?>. <br><br><b>Do not proceed with the installer unless you have these as the installer will fail</b>.</p>
<p>
The are some settings which must be in place before starting the installer. You should set the file permissions on the following folders as the page specifies. 
<ol>
<li>The root folder for this install (<?PHP echo substr(getcwd(),0,strlen(getcwd())-5);?>) must be set to chmod 0777 / Full write access.</li>
<li>The setup folder for this install (<?PHP echo substr(getcwd(),0,strlen(getcwd()));?>) must be set to chmod 0777 / Full write access.</li>
<li>The user files folder for this install (<?PHP echo substr(getcwd(),0,strlen(getcwd())-5) . "USER-FILES";?>) must be set to chmod 0777 / Full write access.</li>
<li>The error log folder for this install (<?PHP echo substr(getcwd(),0,strlen(getcwd())-5) . "error_logs";?>) must be set to chmod 0777 / Full write access.</li>
<li>The import folder for this install (<?PHP echo substr(getcwd(),0,strlen(getcwd())-5) . "import";?>) must be set to chmod 0777 / Full write access.</li>
</ol>
Once the installer has finished, you can set the folder permissions to your own preferences - except for USER-FILES, error_logs and import, to which the web server will still need write / read and delete access. People testing locally do not need to worry about these settings.
</p>
<h2>
	Further Installation Guidance
</h2>
<p>
Use your <a href="phpinfo.php" target="_blank">PHP info page</a> to find the 'Loaded Configuration File' (look on the first part of the php info page for the text 'Loaded Configuration File' - the use this path to find the file. Make a copy of it before you start. You can edit this file in notepad, or any text editor. People following the XAMPP path should find that they do not need to make any of these changes to make their system work.
<ol>
	<li><b>The PHP "Short tags" setting</b> - Look in the Ini file for "short_open_tag =" and set the value to be On. At present your PHP install has this setting turned  (<?PHP if(ini_get("short_open_tag")==1){ echo "on"; }else{ echo "off"; } ?>).</li>
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
<p>
	<a href="file_system_test.php" style="border:0; text-decoration:none"><img src="next.gif" /></a>
</p>
</body>
</html>