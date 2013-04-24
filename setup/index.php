<?PHP 

echo file_get_contents("page_top");

?>
<h2 style="margin-top:15px">
Welcome to the Xerte Online Toolkits Installer
</h2>
<?PHP

	if(file_exists("../database.php")){

		die("<p>You appear to have already installed toolkits</p><p>Please go to <a href='http://" . $_SERVER['HTTP_HOST'] . str_replace("setup/", "", $_SERVER['PHP_SELF']) . "'>Xerte Online Toolkits Install</a></p>");

	}

?>
<p>
Xerte Online Toolkits is a suite of web based tools designed and developed by a wonderful community of <a href="http://www.xerte.org.uk" target="_blank">open source developers.</a></p>
<p>Xerte Online Toolkits is a powerful suite of browser-based tools that allow anyone with a web browser to log on and create interactive learning materials simply and effectively, and to collaborate with other users in developing content. Xerte Online Toolkits provides a number of project templates for creating online presentations and interactive content. Content is assembled using an intuitive interface, and multiple users can collaborate on shared projects. Xerte Toolkits is free software, released under the GNU Public License apart from three files:
</p>
<p>
Snoopy.class.php - written by Monte Ohrt and released as LGPL <br><br> Archive.php - written by Devin Doucette and released as GPL <br><br> dunzip2.inc.php - written by Alexandre Tedeschi and released under his own terms (please see the file for details).</p>
<p>
<p>
	<a href="xampp.php" style="border:0; text-decoration:none"><img src="next.gif" align="middle" style="margin-right:10px" />For XAMPP People</a>
</p>
<p>
	<a href="config_setup.php" style="border:0; text-decoration:none"><img src="next.gif" align="middle" style="margin-right:10px" />For a full install</a>
</p>
<p><b>Please note:</b> If you install locally and use XAMPP it may not run if you are using Skype. Please disable Skype if you intend to use XAMPP locally.</p>
</body>
</html>