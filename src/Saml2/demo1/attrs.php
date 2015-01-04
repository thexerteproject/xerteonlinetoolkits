<?php

session_start();

if (isset($_SESSION['samlUserdata'])) {
    $dump = print_r($_SESSION, true);
    echo str_replace("\n", "<br>", str_replace(" ", "&nbsp;", $dump));
    if (!empty($_SESSION['samlUserdata'])) {
        $attributes = $_SESSION['samlUserdata'];
        echo 'You have the following attributes:<br>';
        echo '<table><thead><th>Name</th><th>Values</th></thead><tbody>';
        foreach ($attributes as $attributeName => $attributeValues) {
            echo '<tr><td>' . htmlentities($attributeName) . '</td><td><ul>';
            foreach ($attributeValues as $attributeValue) {
                echo '<li>' . htmlentities($attributeValue) . '</li>';
            }
            echo '</ul></td></tr>';
        }
        echo '</tbody></table>';
    } else {
        echo "<p>You don't have any attribute</p>";
    }

    echo '<p><a href="index.php?slo" >Logout</a></p>';
} else {
    echo '<p><a href="index.php?sso2" >Login and access later to this page</a></p>';
}
