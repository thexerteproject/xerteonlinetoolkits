<?php 
require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");

if(!isset($_SESSION['toolkits_logon_id'])) {
    die("Session ID not set");
}

if (isset($_SESSION["paths_img_search"])) {
    $images =$_SESSION["paths_img_search"];
    if ($_POST["indices_to_delete"] !== null) {
        $indices_to_delete = x_clean_input($_POST["indices_to_delete"]);
        for ($i = 0; $i < count($indices_to_delete); $i++) {
            $index = $indices_to_delete[$i];
            if ($index > count($images) && $index < 0) {
                continue;
            }
            $image = $images[$index];
            $ext = pathinfo($image, PATHINFO_EXTENSION);
            $credits = str_replace($ext, "txt", $image);
            //echo $image . "<br>";
            //x_check_path_traversal($image);
            unlink($image);
            unlink($credits);
        }
    }
    unset($_SESSION["paths_img_search"]);
    echo "OK";
}

