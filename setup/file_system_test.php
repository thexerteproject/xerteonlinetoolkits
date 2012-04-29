<?PHP
echo file_get_contents("page_top");
?>
<h2 style="margin-top:15px">
    Xerte Online Toolkits file system checks
</h2>
<p>
    The are some settings which must be in place before starting the installer. You should set the file permissions on the following folders as the page specifies. 
<ol>
    <li>The root folder for this install (<?PHP echo substr(getcwd(), 0, strlen(getcwd()) - 5); ?>) must be set to chmod 0777 / Full write access.</li>
    <li>The setup	folder for this install (<?PHP echo substr(getcwd(), 0, strlen(getcwd())); ?>) must be set to chmod 0777 / Full write access.</li>
    <li>The user files folder for this install (<?PHP echo substr(getcwd(), 0, strlen(getcwd()) - 5) . "USER-FILES"; ?>) must be set to chmod 0777 / Full write access.</li>
    <li>The error log folder for this install (<?PHP echo substr(getcwd(), 0, strlen(getcwd()) - 5) . "error_logs"; ?>) must be set to chmod 0777 / Full write access.</li>
    <li>The import folder for this install (<?PHP echo substr(getcwd(), 0, strlen(getcwd()) - 5) . "import"; ?>) must be set to chmod 0777 / Full write access.</li>
</ol>
</p>
<iframe width="900" height="300" src="iframe_file.php"></iframe><br>
If no errors are listed above, please take the <a href="php_modules_test.php">next test</a>. If problems have occurred then please refer to the install guide or the resources available on the <a href="http://www.nottingham.ac.uk/xerte">Xerte website</a>.
</body>
</html>