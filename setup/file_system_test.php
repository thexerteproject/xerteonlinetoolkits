<?PHP
echo file_get_contents("page_top");
require("../functions.php");
?>
<h2 style="margin-top:15px">
    Xerte Online Toolkits file system checks
</h2>
<p>
    The are some settings which must be in place before starting the installer. You should set the file permissions on the following folders as the page specifies. 
<ol>
    <?php
    $root = dirname(dirname(__FILE__));
    $ok = true;
    ?>

    <li>
        The root folder for this install (<?PHP echo $root; ?>) must be writable during setup.
        <?php if (_is_writable($root)) {
            echo "<div class='ok'>OK</div>";
        } else {
            echo "<div class='error'><p>Please fix by changing the permission to 0777 or changing the ownership to the user account that runs the webserver.</p></div>";
            $ok = false;
        } ?>
    </li>
    <li>
        The setup folder for this install (<?PHP echo dirname(__FILE__); ?>) must be writable during setup.
        <?php if (_is_writable(dirname(__FILE__))) {
            echo "<div class='ok'>OK</div>";
        } else {
            echo "<div class='error'><p>Please fix by changing the permission to 0777 or changing the ownership to the user account that runs the webserver.</p></div>";
            $ok = false;
        } ?>
    </li>
    <li>
        The user files folder for this install (<?PHP echo $root . "/USER-FILES"; ?>) must be writable.
        <?php if (_is_writable($root . "/USER-FILES")) {
            echo "<div class='ok'>OK</div>";
        } else {
            echo "<div class='error'><p>Please fix by changing the permission to 0777 or changing the ownership to the user account that runs the webserver.</p></div>";
            $ok = false;
        } ?>
    </li>
    <li>
        The error log folder for this install (<?PHP echo $root . "/error_logs"; ?>) must be writable.
        <?php if (_is_writable($root . "/error_logs")) {
            echo "<div class='ok'>OK</div>";
        } else {
            echo "<div class='error'><p>Please fix by changing the permission to 0777 or changing the ownership to the user account that runs the webserver.</p></div>";
            $ok = false;
        } ?>
    </li>
    <li>
        The import folder for this install (<?PHP echo $root . "/import"; ?>) must be writable.
        <?php if (_is_writable($root . "/import")) {
            echo "<div class='ok'>OK</div>";
        } else {
            echo "<div class='error'><p>Please fix by changing the permission to 0777 or changing the ownership to the user account that runs the webserver.</p></div>";
            $ok = false;
        } ?>
    </li>
</ol>
</p>
<?php
    if ($ok)
    {
        echo "<form action=\"php_modules_test.php\"><input type=\"submit\" value=\"Next\" ></form>";
    }
    else{
        echo "<form action=\"file_system_test.php\"><input type=\"submit\" value=\"Try again\"></form>";
    }
?>
<p>
    Once the installer has finished, you can set the folder permissions to your own preferences - except for USER-FILES, error_logs and import, to which the web server will still need write / read and delete access. People testing locally do not need to worry about these settings.
</p>
<p>
If problems have occurred then please refer to the install guide or the resources available on the <a href="http://www.xerte.org.uk">Xerte Community Website</a>.
</p>
</body>
</html>