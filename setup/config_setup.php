<?PHP
echo file_get_contents("page_top");
?>
<h2 style="margin-top:15px">
    Xerte Online Toolkits initial technical checks
</h2>
<p>
    Please <b><u>note the following technical requirements</u></b> for the site. 



<ol>
    <li>A PHP Server running version 5.2 or above (Xerte Online Toolkits was developed on PHP 5.2+, it may work on older versions. It may not.) - 
<?php
$ok = true;
$version = phpversion();
if (version_compare($version, "5.2.0", "<")) {
    echo "<div class='error'>Your version of PHP is older than 5.2.0. ($version)</div>";
} else {
    echo "<div class='ok'>Your version of PHP is " . $version . " - OK</div>";
}
?>
    </li>

    <li>A MYSQL Install (Xerte Online Toolkits was developed on ver 14.12 Distrib 5.05.51a for Win32. We haven't tested this with other versions, or on other database systems)
        <?php
        if (!function_exists('mysql_connect')) {
            echo "<div class='error'><p>Your  PHP does not seem to have MySQL support</p><p>Please see <a href=\"http://uk3.php.net/manual/en/mysql.installation.php\">PHP's own guide</a> for more details. Xampp installs should come with MySQL installed. Different versions of PHP however may or may not have MySQL installed by default. If on the PHP Info page you can find a section headed  \"MySQL\", then you should find it is installed.</p> </div>";
            $ok = false;
        } else {
            echo "<div class='ok'>MySQL support present</div>";
        }
        ?>

    </li>
    <li><b>All of the above can come from a single WAMP or LAMP installation</b>, such as those available as part of <a href="http://www.apachefriends.org/" target="_blank">XAMPP Project</a></li>
    <li>Although not critical, Xerte Online Toolkits uses PHP mail functions for parts of its code. You can remove these manually from the code should you so wish.
    </li>
    <li>Xerte Online Toolkits suppots multiple authentication types (Database, Moodle, LDAP or a Static list). </li>
</ol>
</p>
<p>At present, with the files positioned as they are, you will install the system into <?PHP echo substr(getcwd(), 0, strlen(getcwd()) - 5); ?> and you will have a system with the web address of http://<?PHP echo $_SERVER['HTTP_HOST'] . substr($_SERVER['PHP_SELF'], 0, strlen($_SERVER['PHP_SELF']) - 22); ?>. <br><br><b>Do not proceed with the installer unless you have these as the installer will fail</b>.</p>
<p>
The next pages will help you verify and solve system issues. You will not be able to continue until all requirements are fulfilled.
</p>

<p>
<?php
    if ($ok)
    {
        echo "<form action=\"file_system_test.php\"><input type=\"submit\" value=\"Next\" ></form>";
    }
    else{
        echo "<form action=\"config_setup.php\"><input type=\"submit\" value=\"Try again\"></form>";
    }
?>
</p>
</body>
</html>