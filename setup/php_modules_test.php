<?PHP
echo file_get_contents("page_top");
$ok = true;
$warning=false;
?>
<h2 style="margin-top:15px">
    Xerte Online Toolkits PHP modules checks
</h2>

<p>
    Use your <a href="phpinfo.php" target="_blank">PHP info page</a> to find the 'Loaded Configuration File' (look on the first part of the php info page for the text 'Loaded Configuration File' - the use this path to find the file. Make a copy of it before you start. You can edit this file in notepad, or any text editor. People following the XAMPP path should find that they do not need to make any of these changes to make their system work.
<ol>
    <li><b>The PHP " File uploads" setting</b>
        <ul>
            <li>Look in the Ini file for "file_uploads =" and set the value to be On :<?PHP if (ini_get("file_uploads") == 1){ echo "<div class=\"ok\">OK</div>";} else {echo "div class=\"error\">Off</div>"; $ok=false;} ?></li>
            <li>Look in the Ini file for "upload_tmp_dir =" and set the value to a path of your system outside of the area available from the web server (i.e if you are using XAMPP - do not put the temp directory in the HTDOCS folder): <div class="info"><?php echo ini_get("upload_tmp_dir"); ?></div>
                <?php if (ini_get("upload_tmp_dir") == "") {echo "<div class=\"warning\">Not set!</div>"; $warning=true;}?></li>
            <li>Look in the Ini file for "upload_max_filesize =" and set the value to a that you want to be the maximum file size you can upload. The format for the setting is the number, then the letter 'M': <div class="info"><?php echo ini_get("upload_max_filesize");?></div></li>
            <li>Look in the Ini file for "post_max_size =" and set the value to a that you want to be the maximum file size you can upload (PHP advise you set this value to be slightly greater than the upload_max_filesize. The format for the setting is the number, then the letter 'M': <div class="info"><?php echo ini_get("post_max_size");?></div></li>
            <li>Look in the Ini file for "memory_limit =" and set the value to a that you want to be the maximum file size you can upload (PHP advise you set this value to be slightly greater than the upload_max_filesize. The format for the setting is the number, then the letter 'M': <div class="info"><?php echo ini_get("memory_limit");?></div></li>
        </ul>
    </li>

    <li>
        <b>The PHP "Sessions" Settings</b> -
        <?php if(function_exists("session_start"))
        {
            echo "<div class=\"ok\">OK</div>";
        }
        else
        {
            $ok = false;
            echo "<div class=\"error\"><p>Please see <a href=\"http://uk2.php.net/manual/en/session.installation.php\">PHP's own guide</a> for more details. Sessions should be turned on by default in a PHP install. Again, XAMPP users should find this is installed by default.<b>Some of the session file settings in index, integration and session.php have been commented out - you may wish to look at which settings work best for you </b>.</p></div>";
        }
        ?>
    </li>
    <li>
        <b>The PHP "LDAP" Settings</b> -
        <?php if(function_exists("ldap_connect"))
        {
            echo "<div class=\"ok\">OK</div>";
        }
        else
        {
            $warning = true;
            echo "<div class=\"info\"><p>Please see <a href=\"http://uk2.php.net/manual/en/ldap.setup.php\">PHP's own guide</a> for more details. If you don't want to use LDAP you can continue with the installation. Make sure to choose a different authentication method.</p></div>";
        }
        ?>
    </li>
    <li>
        <b>The PHP "Mail" Settings</b> -
        <?php if(ini_get("SMTP") != "")
        {
            echo "<div class=\"ok\">Probably OK</div>";
        }
        else
        {
            $warning = true;
        }
        echo "<div class=\"info\">";
        echo "<p>Please see <a href=\"http://uk2.php.net/manual/en/mail.setup.php\">PHP's own guide</a> for more details. As the page lists, you may need to set the following variables - </p>";
        echo "<ul>";
        echo "<li><b>SMTP</b> - " . ini_get("SMTP") . "</li>";
        echo "<li><b>smtp_port</b> - " . ini_get("smtp_port") . "</li>";
        echo "<li><b>sendmail_from</b> - " . ini_get("sendmail_from") . "</li>";
        echo "<li><b>sendmail_path</b> = " . ini_get("sendmail_path") . "</li>";
        echo "</ul>";
        echo "<p>Should you wish to, you can run the code without mail, but some modifications to the feedback and version control pages would be required.</p></div>";
        ?>
    </li>
    <li>
        <b>The PHP "Zlib" Settings</b> -
        <?php if(function_exists("gzcompress"))
        {
            echo "<div class=\"ok\">OK</div>";
        }
        else
        {
            $ok = false;
            echo "<div class=\"error\"><p>Please see <a href=\"http://uk2.php.net/manual/en/zlib.setup.php\">PHP's own guide</a> for more details. If you wish to export projects or make SCORM packages, you will need this library to be installed.</p></div>";
        }
        ?>
    </li>
</ol>	

</p>
<p>
<?php
if ($warning)
{
    echo "Warnings were issued but you can continue the installation.";
}
?>
</p>
<p>
<?php
if ($ok)
{
    echo "<form action=\"page1.php\"><input type=\"submit\" value=\"Next\" ></form>";
}
else{
    echo "<form action=\"php_modules_test.php\"><input type=\"submit\" value=\"Try again\"></form>";
}
?>
</p>


</body>
</html>