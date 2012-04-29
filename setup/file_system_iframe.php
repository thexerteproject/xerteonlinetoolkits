<html>
    <head>
        <style>
            html{
                font-family:arial;
            }
        </style>
    </head>
    <body>

        <?php
        $file = str_replace("setup", "", getcwd());

        echo "Checking for write permissions to the root folder - $file <br>";

        if ($file != "") {

            if (function_exists("is_writable")) {

                if (is_writable($file)) {

                    echo "1. Root folder - Writable according to file permissions<Br>";
                } else {

                    $file_handle = fopen($file . "test.txt", "w+");

                    if (!$file_handle) {

                        echo "3. Root folder - Fail on file creation in the directory<br>";
                    } else {

                        echo "4. Root folder - Success on file writing after is_writable<br>";
                    }

                    $file_handle = fwrite($file_handle, "tree");

                    if (!$file_handle) {

                        echo "3. Root folder - Fail on file writing to the directory<br>";
                    } else {

                        echo "4. Root folder - Success on file writing after is_writable<br>";
                    }

                    fclose($file_handle);

                    unlink($file . "test.txt");
                }
            } else {

                $file_handle = fopen($file . "test.txt", "w+");

                if (!$file_handle) {

                    echo "3. Root folder - Fail on file creation in the directory<br>";
                } else {

                    echo "4. Root folder - Success on file writing after is_writable<br>";
                }

                $file_handle = fwrite($file_handle, "tree");

                if (!$file_handle) {

                    echo "3. Root folder - Fail on file writing to the directory<br>";
                } else {

                    echo "4. Root folder - Success on file writing after is_writable<br>";
                }

                fclose($file_handle);

                unlink($file . "test.txt");
            }
        }

        echo "<br><br>";

        $file = getcwd();

        echo "Checking for write permissions to the setup folder - $file <br>";

        if ($file != "") {

            if (function_exists("is_writable")) {

                if (is_writable($file)) {

                    echo "1. Setup folder - Writable according to file permissions<Br>";
                } else {

                    $file_handle = fopen($file . "test.txt", "w+");

                    if (!$file_handle) {

                        echo "3. Root folder - Fail on file creation in the directory<br><p style=\"color:#f00\">Please set this folder to be writable</p>";
                    } else {

                        echo "4. Root folder - Success on file writing after is_writable<br>";
                    }

                    $file_handle = fwrite($file_handle, "tree");

                    if (!$file_handle) {

                        echo "3. Root folder - Fail on file writing to the directory<br><p style=\"color:#f00\">Please set this folder to be writable</p>";
                    } else {

                        echo "4. Root folder - Success on file writing after is_writable<br>";
                    }

                    fclose($file_handle);

                    unlink($file . "test.txt");
                }
            } else {

                $file_handle = fopen($file . "test.txt", "w+");

                if (!$file_handle) {

                    echo "3. Root folder - Fail on file creation in the directory<br><p style=\"color:#f00\">Please set this folder to be writable</p>";
                } else {

                    echo "4. Root folder - Success on file writing after is_writable<br>";
                }

                $file_handle = fwrite($file_handle, "tree");

                if (!$file_handle) {

                    echo "3. Root folder - Fail on file writing to the directory<br><p style=\"color:#f00\">Please set this folder to be writable</p>";
                } else {

                    echo "4. Root folder - Success on file writing after is_writable<br>";
                }

                fclose($file_handle);

                unlink($file . "test.txt");
            }
        }

        echo "<br><br>";

        echo "Checking for write permissions to the database config file - $file/database.txt <br>";

        $file_handle = fopen("database.txt", 'a+');

        $work = true;

        if (!$file_handle) {

            $work = false;
            ?>
            <p>The file <?PHP echo str_replace("\\", "/", getcwd()); ?>/database.txt was not set to be writable - this means future pages will not work. Please edit this file before continuing.
            <?PHP
        }

        if (!fwrite($file_handle, " ")) {

            $work = false;
            ?>
            <p>The file <?PHP echo str_replace("\\", "/", getcwd()); ?>/database.txt could not be written too - this means future pages will not work. Please edit this file before continuing.
            <?PHP
        }

        if ($work) {
            ?>
            <p>The file <?PHP echo str_replace("\\", "/", getcwd()); ?>/database.txt has been successfully written to.
            <?PHP
        }
        ?>
        <form action="file_system_iframe.php">
            <input type="submit" value="Try again" />
        </form>
